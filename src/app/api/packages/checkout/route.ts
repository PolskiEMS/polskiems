import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { packageOrders, producenci } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { getStripeClient } from "@/lib/stripe";
import { getPackagePrice, isPaidPackage, type BillingCycleMonths } from "@/lib/packagePlans";

export const runtime = "nodejs";

type Provider = "stripe" | "przelewy24";


function isProvider(value: string): value is Provider {
  return value === "stripe" || value === "przelewy24";
}

function parseBillingCycleMonths(value: unknown): BillingCycleMonths | null {
  const months = Number(value);
  return months === 1 || months === 3 || months === 6 || months === 12 ? months : null;
}

export async function POST(req: NextRequest) {
  if (process.env.PAYMENTS_ENABLED !== "true") {
    return NextResponse.json(
      {
        ok: false,
        code: "PAYMENTS_DISABLED",
        error: "Płatności są obecnie w trakcie uruchamiania.",
      },
      { status: 503 }
    );
  }

  const body = await req.json();

  const companyName = String(body?.companyName ?? "").trim();
  const companyEmail = String(body?.companyEmail ?? "").trim();
  const companyPhone = String(body?.companyPhone ?? "").trim();
  const companyDescription = String(body?.companyDescription ?? "").trim();
  const packageType = String(body?.packageType || "");
  const provider = String(body?.provider || "");
  const billingCycleMonths = parseBillingCycleMonths(body?.billingCycleMonths);
  const buyerName = String(body?.buyerName ?? "").trim();
  const buyerEmail = String(body?.buyerEmail ?? "").trim();
  const buyerPhone = String(body?.buyerPhone ?? "").trim();
  const buyerCompanyName = String(body?.buyerCompanyName ?? "").trim();
  const buyerTaxId = String(body?.buyerTaxId ?? "").trim();
  const buyerAddressLine1 = String(body?.buyerAddressLine1 ?? "").trim();
  const buyerPostalCode = String(body?.buyerPostalCode ?? "").trim();
  const buyerCity = String(body?.buyerCity ?? "").trim();
  const buyerCountry = String(body?.buyerCountry ?? "Polska").trim();

  if (!companyName || !companyEmail || !isPaidPackage(packageType) || !billingCycleMonths) {
    return NextResponse.json(
      {
        ok: false,
        code: "VALIDATION_ERROR",
        error: "Uzupełnij wymagane dane firmy przed przejściem do płatności.",
      },
      { status: 400 }
    );
  }

  if (!isProvider(provider)) {
    return NextResponse.json(
      { ok: false, code: "VALIDATION_ERROR", error: "Wybierz poprawną metodę płatności." },
      { status: 400 }
    );
  }

  if (provider === "przelewy24") {
    return NextResponse.json(
      {
        ok: false,
        code: "PROVIDER_NOT_AVAILABLE",
        error:
          "Płatność przez Przelewy24 jest obecnie przygotowywana. Wybierz płatność Stripe albo skontaktuj się z nami w celu otrzymania danych do przelewu.",
      },
      { status: 400 }
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      {
        ok: false,
        code: "PAYMENT_CONFIGURATION_ERROR",
        error: "Płatności online są chwilowo niedostępne. Skontaktuj się z nami, aby dokończyć zamówienie.",
      },
      { status: 503 }
    );
  }

  const db = getDb();
  const existingCompanyRows = await db
    .select({ id: producenci.id })
    .from(producenci)
    .where(or(eq(producenci.nazwa, companyName), eq(producenci.email, companyEmail)));

  if (existingCompanyRows.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        code: "COMPANY_EXISTS",
        error:
          "Firma o tej nazwie lub adresie e-mail już istnieje. Skontaktuj się z nami, aby rozszerzyć obecny profil.",
      },
      { status: 409 }
    );
  }

  const amountGross = getPackagePrice(packageType, billingCycleMonths);

  const [createdOrder] = await db.insert(packageOrders).values({
    companyId: null,
    companyName,
    companyEmail,
    companyPhone: companyPhone || null,
    companyDescription: companyDescription || null,
    packageType,
    provider,
    billingCycleMonths,
    amountGross,
    buyerName: buyerName || null,
    buyerEmail: buyerEmail || null,
    buyerPhone: buyerPhone || null,
    buyerCompanyName: buyerCompanyName || null,
    buyerTaxId: buyerTaxId || null,
    buyerAddressLine1: buyerAddressLine1 || null,
    buyerPostalCode: buyerPostalCode || null,
    buyerCity: buyerCity || null,
    buyerCountry: buyerCountry || null,
    paymentStatus: "pending_payment",
  }).returning({ id: packageOrders.id });

  const orderId = createdOrder.id;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: `${siteUrl}/platnosc/sukces?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/platnosc/anulowano`,
    customer_email: companyEmail,
    metadata: {
      orderId: String(orderId),
      companyName,
      companyEmail,
      packageType,
      billingCycleMonths: String(billingCycleMonths),
      provider,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "pln",
          unit_amount: amountGross * 100,
          product_data: {
            name: `Pakiet ${packageType.toUpperCase()} (${billingCycleMonths} mies.)`,
          },
        },
      },
    ],
  });

  await db
    .update(packageOrders)
    .set({ stripeSessionId: session.id })
    .where(eq(packageOrders.id, orderId));

  return NextResponse.json({
    ok: true,
    provider: "stripe",
    checkoutUrl: session.url,
    orderId,
  });
}
