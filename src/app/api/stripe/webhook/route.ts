import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { and, eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { getStripeClient } from "@/lib/stripe";
import { packageOrders, producenci } from "@/db/schema";

export const runtime = "nodejs";

function toSqlDateTime(date: Date) {
  return date.toISOString().slice(0, 19).replace("T", " ");
}

function addMonths(baseDate: Date, months: number) {
  const d = new Date(baseDate);
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const payload = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = Number(session.metadata?.orderId || 0);
  const packageType = session.metadata?.packageType;
  const billingCycleMonths = Number(session.metadata?.billingCycleMonths || 1);

  if (!orderId || !packageType || (packageType !== "standard" && packageType !== "premium")) {
    console.error("Stripe webhook missing critical metadata", session.id);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const db = getDb();
  const orderRows = await db
    .select({ id: packageOrders.id, companyId: packageOrders.companyId, paymentStatus: packageOrders.paymentStatus })
    .from(packageOrders)
    .where(eq(packageOrders.id, orderId));
  const order = orderRows[0];

  if (!order) {
    console.error("Stripe webhook order not found", orderId);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const now = new Date();
  const nowSql = toSqlDateTime(now);

  if (!order.companyId) {
    // TODO: finalize company creation flow when order has no company assigned before payment.
    await db
      .update(packageOrders)
      .set({
        paymentStatus: "paid_pending_activation",
        paidAt: nowSql,
        stripeSessionId: session.id,
      })
      .where(and(eq(packageOrders.id, orderId), eq(packageOrders.paymentStatus, "pending_payment")));

    console.error("Stripe webhook paid order without companyId", orderId);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const companyRows = await db
    .select({ id: producenci.id, packageValidUntil: producenci.packageValidUntil })
    .from(producenci)
    .where(eq(producenci.id, order.companyId));
  const company = companyRows[0];

  if (!company) {
    console.error("Stripe webhook company not found", order.companyId);
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const baseDate = company.packageValidUntil ? new Date(company.packageValidUntil.replace(" ", "T") + "Z") : now;
  const validUntil = addMonths(baseDate > now ? baseDate : now, billingCycleMonths);
  const validUntilSql = toSqlDateTime(validUntil);

  await db
    .update(packageOrders)
    .set({
      paymentStatus: "paid",
      paidAt: nowSql,
      activatedAt: nowSql,
      accessValidUntil: validUntilSql,
      stripeSessionId: session.id,
    })
    .where(eq(packageOrders.id, orderId));

  await db
    .update(producenci)
    .set({
      packageType,
      isActive: true,
      featured: true,
      packageValidUntil: validUntilSql,
      monthlyInquiryCount: 0,
      monthlyInquiryLimit: packageType === "standard" ? 20 : 999999,
    })
    .where(eq(producenci.id, order.companyId));

  return NextResponse.json({ ok: true }, { status: 200 });
}
