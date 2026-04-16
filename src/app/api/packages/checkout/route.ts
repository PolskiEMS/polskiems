import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { packageOrders, producenci } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const runtime = "nodejs";

type PaidPackage = "standard" | "premium";
type BillingCycleMonths = 1 | 3 | 6 | 12;

const PACKAGE_PRICE_TOTAL: Record<PaidPackage, Record<BillingCycleMonths, number>> = {
  standard: {
    1: 199,
    3: 549,
    6: 999,
    12: 1799,
  },
  premium: {
    1: 299,
    3: 849,
    6: 1599,
    12: 2999,
  },
};

function isPackageType(value: string): value is PaidPackage {
  return value === "standard" || value === "premium";
}

function isProvider(value: string): value is "stripe" | "przelewy24" {
  return value === "stripe" || value === "przelewy24";
}

function parseBillingCycleMonths(value: unknown): BillingCycleMonths | null {
  const months = Number(value);
  if (months === 1 || months === 3 || months === 6 || months === 12) {
    return months;
  }

  return null;
}

export async function POST(req: NextRequest) {
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

  if (!companyName || !companyEmail) {
    return NextResponse.json(
      { ok: false, error: "Uzupełnij nazwę i e-mail firmy" },
      { status: 400 }
    );
  }

  if (!isPackageType(packageType)) {
    return NextResponse.json({ ok: false, error: "Wybierz pakiet Standard lub Premium" }, { status: 400 });
  }

  if (!isProvider(provider)) {
    return NextResponse.json({ ok: false, error: "Wybierz operatora płatności" }, { status: 400 });
  }

  if (!billingCycleMonths) {
    return NextResponse.json(
      { ok: false, error: "Wybierz okres subskrypcji: 1, 3, 6 lub 12 miesięcy" },
      { status: 400 }
    );
  }

  const db = getDb();
  const existingCompanyRows = await db
    .select({ id: producenci.id, nazwa: producenci.nazwa })
    .from(producenci)
    .where(
      or(
        eq(producenci.nazwa, companyName),
        eq(producenci.email, companyEmail)
      )
    );

  if (existingCompanyRows.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        code: "COMPANY_EXISTS",
        error:
          "Taki Producent jest już obecny, uzupełnij więcej potrzebnych danych w formularzu zgłoszeniowym.",
      },
      { status: 409 }
    );
  }

  const companyInsertResult = await db.insert(producenci).values({
    nazwa: companyName,
    email: companyEmail,
    telefon: companyPhone || null,
    opis: companyDescription || null,
    isActive: false,
    featured: false,
    packageType: "free",
    monthlyInquiryLimit: 5,
    monthlyInquiryCount: 0,
    packageValidUntil: null,
  });

  const companyId = Number((companyInsertResult as any).insertId);
  const amountGross = PACKAGE_PRICE_TOTAL[packageType][billingCycleMonths];

  const insertResult = await db.insert(packageOrders).values({
    companyId,
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
    status: "pending",
  });

  const orderId = Number((insertResult as any).insertId);

  return NextResponse.json({
    ok: true,
    orderId,
    companyId,
    companyName,
    amountGross,
    provider,
    packageType,
    billingCycleMonths,
  });
}
