import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { packageOrders, producenci } from "@/db/schema";

export const runtime = "nodejs";

const PACKAGE_LIMIT: Record<"standard" | "premium", number> = {
  standard: 10,
  premium: 999999,
};

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

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");

  await db
    .update(packageOrders)
    .set({ status: "paid", paidAt: now })
    .where(and(eq(packageOrders.id, order.id), eq(packageOrders.status, "pending")));

  await db
    .update(producenci)
    .set({
      packageType: order.packageType,
      featured: true,
      monthlyInquiryLimit: PACKAGE_LIMIT[order.packageType],
      monthlyInquiryCount: 0,
    })
    .where(eq(producenci.id, order.companyId));

  return NextResponse.json({ ok: true, activatedPackage: order.packageType });
}
