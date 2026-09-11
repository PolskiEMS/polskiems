import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  packageOrders,
  producenci,
  producenciEmsDzialania,
  producenciEmsProdukcja,
} from "@/db/schema";
import { eq, or } from "drizzle-orm";
import {
  getPackageConfig,
  getPackagePriceTotal,
  isPaidPackageType,
  isPublicPackageType,
  parseBillingCycleMonths,
} from "@/lib/packagePlans";

export const runtime = "nodejs";

type ActivationMode = "no_payment" | "bank_transfer";

function parseActivationMode(value: unknown): ActivationMode {
  return value === "bank_transfer" ? "bank_transfer" : "no_payment";
}

function parseIds(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => Number(item)).filter((item) => Number.isFinite(item) && item > 0)
    : [];
}

function joinAddress(street: string, postalCode: string, city: string) {
  return [street, [postalCode, city].filter(Boolean).join(" ")]
    .filter(Boolean)
    .join(", ");
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const companyName = String(body?.companyName ?? "").trim();
  const companyEmail = String(body?.companyEmail ?? "").trim();
  const companyPhone = String(body?.companyPhone ?? "").trim();
  const companyWebsite = String(body?.companyWebsite ?? "").trim();
  const companyDescription = String(body?.companyDescription ?? "").trim();
  const companyStreet = String(body?.companyStreet ?? "").trim();
  const companyPostalCode = String(body?.companyPostalCode ?? "").trim();
  const companyCity = String(body?.companyCity ?? "").trim();
  const packageTypeRaw = String(body?.packageType ?? "free").trim();
  const activationMode = parseActivationMode(body?.activationMode);
  const billingCycleMonths = parseBillingCycleMonths(body?.billingCycleMonths) ?? 1;
  const regionIdRaw = Number(body?.regionId);
  const regionId = Number.isFinite(regionIdRaw) && regionIdRaw > 0 ? regionIdRaw : null;
  const dzialaniaIds = parseIds(body?.dzialaniaIds);
  const produkcjaIds = parseIds(body?.produkcjaIds);
  const buyerName = String(body?.buyerName ?? "").trim();
  const buyerEmail = String(body?.buyerEmail ?? "").trim();
  const buyerPhone = String(body?.buyerPhone ?? "").trim();
  const buyerCompanyName = String(body?.buyerCompanyName ?? "").trim();
  const buyerTaxId = String(body?.buyerTaxId ?? "").trim();
  const buyerAddressLine1 = String(body?.buyerAddressLine1 ?? "").trim();
  const buyerPostalCode = String(body?.buyerPostalCode ?? "").trim();
  const buyerCity = String(body?.buyerCity ?? "").trim();
  const buyerCountry = String(body?.buyerCountry ?? "Polska").trim() || "Polska";

  if (!companyName || !companyEmail || !isPublicPackageType(packageTypeRaw)) {
    return NextResponse.json(
      { ok: false, code: "VALIDATION_ERROR", error: "Uzupełnij nazwę, e-mail firmy i poprawny pakiet." },
      { status: 400 }
    );
  }

  if (activationMode === "bank_transfer" && !isPaidPackageType(packageTypeRaw)) {
    return NextResponse.json(
      { ok: false, code: "VALIDATION_ERROR", error: "Przelew tradycyjny jest dostępny tylko dla pakietów Standard i Premium." },
      { status: 400 }
    );
  }

  if (activationMode === "bank_transfer" && (!buyerCompanyName || !buyerTaxId || !buyerAddressLine1 || !buyerPostalCode || !buyerCity)) {
    return NextResponse.json(
      { ok: false, code: "VALIDATION_ERROR", error: "Uzupełnij nazwę firmy, NIP i pełny adres do faktury." },
      { status: 400 }
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
        error: "Taka firma jest już w bazie. Skontaktuj się z administratorem, aby ją aktywować lub zaktualizować dane.",
      },
      { status: 409 }
    );
  }

  const packageConfig = getPackageConfig(packageTypeRaw);
  const isBankTransferOrder = activationMode === "bank_transfer" && isPaidPackageType(packageTypeRaw);
  const companyAddress = joinAddress(companyStreet, companyPostalCode, companyCity);

  const [createdCompany] = await db.insert(producenci).values({
    nazwa: companyName,
    email: companyEmail,
    telefon: companyPhone || null,
    www: companyWebsite || null,
    opis: companyDescription || null,
    wojewodztwoId: regionId,
    adres: companyAddress || null,
    isActive: !isBankTransferOrder,
    featured: packageConfig.featured,
    packageType: packageConfig.packageType,
    monthlyInquiryLimit: packageConfig.monthlyInquiryLimit,
    monthlyInquiryCount: 0,
  }).returning({ id: producenci.id });

  const companyId = createdCompany.id;

  if (dzialaniaIds.length > 0) {
    await db.insert(producenciEmsDzialania).values(
      dzialaniaIds.map((dzialanieId) => ({ companyId, dzialanieId }))
    );
  }

  if (produkcjaIds.length > 0) {
    await db.insert(producenciEmsProdukcja).values(
      produkcjaIds.map((produkcjaId) => ({ companyId, produkcjaId }))
    );
  }

  if (isBankTransferOrder) {
    const amountGross = getPackagePriceTotal(packageTypeRaw, billingCycleMonths);
    const [createdOrder] = await db.insert(packageOrders).values({
      companyId,
      companyName,
      companyEmail,
      companyPhone: companyPhone || null,
      companyDescription: companyDescription || null,
      packageType: packageTypeRaw,
      provider: "przelewy24",
      billingCycleMonths,
      amountGross,
      buyerName: buyerName || null,
      buyerEmail: buyerEmail || companyEmail,
      buyerPhone: buyerPhone || companyPhone || null,
      buyerCompanyName,
      buyerTaxId,
      buyerAddressLine1,
      buyerPostalCode,
      buyerCity,
      buyerCountry,
      paymentStatus: "pending_payment",
    }).returning({ id: packageOrders.id });

    return NextResponse.json({
      ok: true,
      companyId,
      orderId: createdOrder.id,
      status: "pending_bank_transfer",
      packageType: packageConfig.packageType,
    });
  }

  return NextResponse.json({
    ok: true,
    companyId,
    status: "active",
    packageType: packageConfig.packageType,
  });
}
