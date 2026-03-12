import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { companyEvents } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_EVENTS = new Set([
  "view",
  "phone_click",
  "email_click",
  "website_click",
  "doc_download",
]);

type Body = {
  company_id: number | string;
  event_type: string;
  referrer?: string | null;
  utm_source?: string | null;
  utm_campaign?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const companyId = Number(body.company_id);
    const eventType = body.event_type;

    if (!Number.isFinite(companyId) || companyId <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid company_id" }, { status: 400 });
    }

    if (!ALLOWED_EVENTS.has(eventType)) {
      return NextResponse.json({ ok: false, error: "Invalid event_type" }, { status: 400 });
    }

    const headerReferer = req.headers.get("referer") || req.headers.get("referrer");
    const referrer = (body.referrer ?? headerReferer ?? null)?.toString().slice(0, 255) ?? null;

    const utmSource = (body.utm_source ?? null)?.toString().slice(0, 100) ?? null;
    const utmCampaign = (body.utm_campaign ?? null)?.toString().slice(0, 100) ?? null;

    const db = getDb();

    await db.insert(companyEvents).values({
      companyId,
      eventType: eventType as any, // enum w Drizzle
      referrer
      utmSource,
      utmCampaign,
      // createdAt zostaje z default CURRENT_TIMESTAMP
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("saveStatistics error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
