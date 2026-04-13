import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { packageOrders, producenci } from "@/db/schema";

export const runtime = "nodejs";

const PACKAGE_LIMIT: Record<"standard" | "premium", number> = {
  standard: 10,
  premium: 999999,
};

function toSqlDateTime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function addMonths(baseDate: Date, months: number) {
  const d = new Date(baseDate);
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const orderId = Number(body?.orderId);

  if (!Number.isFinite(orderId) || orderId <= 0) {
    return NextResponse.json({ ok: false, error: "Nieprawidłowe ID zamówienia" }, { status: 400 });
  }

  const db = getDb();

  const orderRows = await db
    .select({
      id: packageOrders.id,
      companyId: packageOrders.companyId,
      packageType: packageOrders.packageType,
      status: packageOrders.status,
      billingCycleMonths: packageOrders.billingCycleMonths,
    })
    .from(packageOrders)
    .where(eq(packageOrders.id, orderId));

  const order = orderRows[0];
  if (!order) {
    return NextResponse.json({ ok: false, error: "Nie znaleziono zamówienia" }, { status: 404 });
  }

  if (order.status === "paid") {
    return NextResponse.json({ ok: true, alreadyPaid: true });
  }

  const nowDate = new Date();
  const now = toSqlDateTime(nowDate);

  let existingValidUntil: string | null = null;

  try {
    const companyRows = await db
      .select({
        id: producenci.id,
        packageValidUntil: producenci.packageValidUntil,
      })
      .from(producenci)
      .where(eq(producenci.id, order.companyId));

    const company = companyRows[0];
    if (!company) {
      return NextResponse.json({ ok: false, error: "Nie znaleziono firmy dla zamówienia" }, { status: 404 });
    }

    existingValidUntil = company.packageValidUntil ?? null;
  } catch {
    const companyRows = await db
      .select({ id: producenci.id })
      .from(producenci)
      .where(eq(producenci.id, order.companyId));

    if (!companyRows[0]) {
      return NextResponse.json({ ok: false, error: "Nie znaleziono firmy dla zamówienia" }, { status: 404 });
    }
  }

  const baseDate = existingValidUntil
    ? new Date(existingValidUntil.replace(" ", "T") + "Z")
    : nowDate;

  const validUntil = addMonths(baseDate > nowDate ? baseDate : nowDate, Number(order.billingCycleMonths || 1));
  const validUntilSql = toSqlDateTime(validUntil);

  await db
    .update(packageOrders)
    .set({ status: "paid", paidAt: now, activatedAt: now, accessValidUntil: validUntilSql })
    .where(and(eq(packageOrders.id, order.id), eq(packageOrders.status, "pending")));

  try {
    await db
      .update(producenci)
      .set({
        packageType: order.packageType,
        featured: true,
        monthlyInquiryLimit: PACKAGE_LIMIT[order.packageType],
        monthlyInquiryCount: 0,
        packageValidUntil: validUntilSql,
      })
      .where(eq(producenci.id, order.companyId));
  } catch {
    await db
      .update(producenci)
      .set({
        packageType: order.packageType,
        featured: true,
        monthlyInquiryLimit: PACKAGE_LIMIT[order.packageType],
        monthlyInquiryCount: 0,
      })
      .where(eq(producenci.id, order.companyId));
  }

  return NextResponse.json({
    ok: true,
    activatedPackage: order.packageType,
    billingCycleMonths: order.billingCycleMonths,
    packageValidUntil: validUntilSql,
  });
}
