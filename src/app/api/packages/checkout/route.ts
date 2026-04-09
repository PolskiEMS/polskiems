import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { packageOrders, producenci } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const runtime = "nodejs";

const PACKAGE_PRICE: Record<"standard" | "premium", number> = {
  standard: 199,
  premium: 299,
};

function isPackageType(value: string): value is "standard" | "premium" {
  return value === "standard" || value === "premium";
}

function isProvider(value: string): value is "stripe" | "przelewy24" {
  return value === "stripe" || value === "przelewy24";
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const companyName = String(body?.companyName ?? "").trim();
  const companyEmail = String(body?.companyEmail ?? "").trim();
  const companyPhone = String(body?.companyPhone ?? "").trim();
  const companyDescription = String(body?.companyDescription ?? "").trim();
  const packageType = String(body?.packageType || "");
  const provider = String(body?.provider || "");

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
    isActive: true,
    featured: false,
    packageType: "free",
    monthlyInquiryLimit: 0,
    monthlyInquiryCount: 0,
  });

  const companyId = Number((companyInsertResult as any).insertId);

  const insertResult = await db.insert(packageOrders).values({
    companyId,
    packageType,
    provider,
    amountGross: PACKAGE_PRICE[packageType],
    status: "pending",
  });

  const orderId = Number((insertResult as any).insertId);

  return NextResponse.json({
    ok: true,
    orderId,
    companyId,
    companyName,
    amountGross: PACKAGE_PRICE[packageType],
    provider,
    packageType,
  });
}
