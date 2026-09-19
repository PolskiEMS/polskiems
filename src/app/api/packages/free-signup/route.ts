import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  packageOrders,
  producenci,
  producenciEmsProdukcja,
  producerCapabilities,
  producerCertifications,
  producerIndustries,
  producerServices,
} from "@/db/schema";
import { eq, or } from "drizzle-orm";
import {
  getPackageConfig,
  getPackagePrice,
  isPackageType,
  isPaidPackage,
  type BillingCycleMonths,
} from "@/lib/packagePlans";
import { COMPANY_TYPE_LABELS } from "@/lib/supplierTaxonomy";

export const runtime = "nodejs";

type ActivationMode = "no_payment" | "bank_transfer";

function parseActivationMode(value: unknown): ActivationMode {
  return value === "bank_transfer" ? "bank_transfer" : "no_payment";
}

function parseBillingCycleMonths(value: unknown): BillingCycleMonths {
  const months = Number(value);
  return months === 1 || months === 3 || months === 6 || months === 12 ? months : 1;
}

function parseIds(value: unknown) {
  return Array.isArray(value)
    ? [...new Set(value.map((item) => Number(item)).filter((item) => Number.isInteger(item) && item > 0))]
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
  const companyTypeRaw = String(body?.companyType ?? "unclassified").trim();
  const packageTypeRaw = String(body?.packageType ?? "free").trim();
  const activationMode = parseActivationMode(body?.activationMode);
  const billingCycleMonths = parseBillingCycleMonths(body?.billingCycleMonths);
  const regionIdRaw = Number(body?.regionId);
  const regionId = Number.isInteger(regionIdRaw) && regionIdRaw > 0 ? regionIdRaw : null;

  const serviceIds = parseIds(body?.serviceIds);
  const capabilityIds = parseIds(body?.capabilityIds);
  const industryIds = parseIds(body?.industryIds);
  const certificationIds = parseIds(body?.certificationIds);
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

  if (!companyName || !companyEmail || !isPackageType(packageTypeRaw)) {
    return NextResponse.json(
      { ok: false, code: "VALIDATION_ERROR", error: "Uzupełnij nazwę, e-mail firmy i poprawny pakiet." },
      { status: 400 }
    );
  }

  const companyType = Object.prototype.hasOwnProperty.call(COMPANY_TYPE_LABELS, companyTypeRaw)
    ? companyTypeRaw
    : "unclassified";

  if (serviceIds.length === 0) {
    return NextResponse.json(
      { ok: false, code: "VALIDATION_ERROR", error: "Wybierz co najmniej jedną usługę firmy." },
      { status: 400 }
    );
  }

  if (isPaidPackage(packageTypeRaw) && activationMode !== "bank_transfer") {
    return NextResponse.json(
      { ok: false, code: "VALIDATION_ERROR", error: "Pakiety Standard i Premium wymagają płatnej aktywacji." },
      { status: 400 }
    );
  }

  if (!isPaidPackage(packageTypeRaw) && activationMode === "bank_transfer") {
    return NextResponse.json(
      { ok: false, code: "VALIDATION_ERROR", error: "Pakiet Free nie wymaga płatności." },
      { status: 400 }
    );
  }

  if (
    isPaidPackage(packageTypeRaw) &&
    (!buyerCompanyName || !buyerTaxId || !buyerAddressLine1 || !buyerPostalCode || !buyerCity)
  ) {
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
        error: "Taka firma jest już w bazie. Użyj trybu aktualizacji istniejącego profilu.",
      },
      { status: 409 }
    );
  }

  const packageConfig = getPackageConfig(packageTypeRaw);
  const companyAddress = joinAddress(companyStreet, companyPostalCode, companyCity);

  const result = await db.transaction(async (tx) => {
    const [createdCompany] = await tx
      .insert(producenci)
      .values({
        nazwa: companyName,
        email: companyEmail,
        telefon: companyPhone || null,
        www: companyWebsite || null,
        opis: companyDescription || null,
        wojewodztwoId: regionId,
        adres: companyAddress || null,
        companyType,
        isActive: false,
        featured: packageConfig.featured,
        packageType: packageConfig.packageType,
        monthlyInquiryLimit: packageConfig.monthlyInquiryLimit,
        monthlyInquiryCount: 0,
      })
      .returning({ id: producenci.id });

    const companyId = createdCompany.id;

    if (serviceIds.length > 0) {
      await tx.insert(producerServices).values(
        serviceIds.map((serviceId) => ({
          companyId,
          serviceId,
          source: "company_submission",
        }))
      ).onConflictDoNothing();
    }

    if (capabilityIds.length > 0) {
      await tx.insert(producerCapabilities).values(
        capabilityIds.map((capabilityId) => ({
          companyId,
          capabilityId,
          source: "company_submission",
        }))
      ).onConflictDoNothing();
    }

    if (industryIds.length > 0) {
      await tx.insert(producerIndustries).values(
        industryIds.map((industryId) => ({
          companyId,
          industryId,
          source: "company_submission",
        }))
      ).onConflictDoNothing();
    }

    if (certificationIds.length > 0) {
      await tx.insert(producerCertifications).values(
        certificationIds.map((certificationId) => ({
          companyId,
          certificationId,
          status: "company_confirmed",
        }))
      ).onConflictDoNothing();
    }

    if (produkcjaIds.length > 0) {
      await tx.insert(producenciEmsProdukcja).values(
        produkcjaIds.map((produkcjaId) => ({ companyId, produkcjaId }))
      );
    }

    if (isPaidPackage(packageTypeRaw)) {
      const amountGross = getPackagePrice(packageTypeRaw, billingCycleMonths);
      const [createdOrder] = await tx
        .insert(packageOrders)
        .values({
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
        })
        .returning({ id: packageOrders.id });

      return {
        companyId,
        orderId: createdOrder.id,
        status: "pending_review" as const,
        packageType: packageConfig.packageType,
      };
    }

    return {
      companyId,
      orderId: null,
      status: "pending_review" as const,
      packageType: packageConfig.packageType,
    };
  });

  return NextResponse.json({ ok: true, ...result });
}
