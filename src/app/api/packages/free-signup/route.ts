import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { producenci } from "@/db/schema";
import { eq, or } from "drizzle-orm";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const companyName = String(body?.companyName ?? "").trim();
  const companyEmail = String(body?.companyEmail ?? "").trim();
  const companyPhone = String(body?.companyPhone ?? "").trim();
  const companyWebsite = String(body?.companyWebsite ?? "").trim();
  const companyDescription = String(body?.companyDescription ?? "").trim();

  if (!companyName || !companyEmail) {
    return NextResponse.json(
      { ok: false, error: "Uzupełnij nazwę i e-mail firmy" },
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

  const insertResult = await db.insert(producenci).values({
    nazwa: companyName,
    email: companyEmail,
    telefon: companyPhone || null,
    www: companyWebsite || null,
    opis: companyDescription || null,
    isActive: false,
    featured: false,
    packageType: "free",
    monthlyInquiryLimit: 5,
    monthlyInquiryCount: 0,
  });

  const companyId = Number((insertResult as any).insertId);

  return NextResponse.json({
    ok: true,
    companyId,
    status: "pending_admin_approval",
  });
}
