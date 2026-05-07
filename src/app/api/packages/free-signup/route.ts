import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import {
  producenci,
  producenciEmsDzialania,
  producenciEmsProdukcja,
} from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const runtime = "nodejs";

type PackageType = "free" | "standard" | "premium";

function isPackageType(value: string): value is PackageType {
  return value === "free" || value === "standard" || value === "premium";
}

function getPackageConfig(packageType: PackageType) {
  switch (packageType) {
    case "standard":
      return { packageType, featured: true, monthlyInquiryLimit: 20 };
    case "premium":
      return { packageType, featured: true, monthlyInquiryLimit: 999999 };
    case "free":
    default:
      return { packageType: "free" as const, featured: false, monthlyInquiryLimit: 5 };
  }
}

function parseIds(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => Number(item)).filter((item) => Number.isFinite(item) && item > 0)
    : [];
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const companyName = String(body?.companyName ?? "").trim();
  const companyEmail = String(body?.companyEmail ?? "").trim();
  const companyPhone = String(body?.companyPhone ?? "").trim();
  const companyWebsite = String(body?.companyWebsite ?? "").trim();
  const companyDescription = String(body?.companyDescription ?? "").trim();
  const companyAddress = String(body?.companyAddress ?? "").trim();
  const packageTypeRaw = String(body?.packageType ?? "free").trim();
  const regionIdRaw = Number(body?.regionId);
  const regionId = Number.isFinite(regionIdRaw) && regionIdRaw > 0 ? regionIdRaw : null;
  const dzialaniaIds = parseIds(body?.dzialaniaIds);
  const produkcjaIds = parseIds(body?.produkcjaIds);

  if (!companyName || !companyEmail || !isPackageType(packageTypeRaw)) {
    return NextResponse.json(
      { ok: false, code: "VALIDATION_ERROR", error: "Uzupełnij nazwę, e-mail firmy i poprawny pakiet." },
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

  const insertResult = await db.insert(producenci).values({
    nazwa: companyName,
    email: companyEmail,
    telefon: companyPhone || null,
    www: companyWebsite || null,
    opis: companyDescription || null,
    wojewodztwoId: regionId,
    adres: companyAddress || null,
    isActive: true,
    featured: packageConfig.featured,
    packageType: packageConfig.packageType,
    monthlyInquiryLimit: packageConfig.monthlyInquiryLimit,
    monthlyInquiryCount: 0,
  });

  const companyId = Number((insertResult as any).insertId);

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

  return NextResponse.json({
    ok: true,
    companyId,
    status: "active",
    packageType: packageConfig.packageType,
  });
}
