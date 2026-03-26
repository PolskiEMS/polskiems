import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { pageViews } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json();

    const page = String(body.page ?? "").trim();
    const visitorId = String(body.visitorId ?? "").trim();
    const referrer = req.headers.get("referer") || null;

    if (!page || !visitorId) {
      return NextResponse.json(
        { ok: false, error: "Missing page or visitorId" },
        { status: 400 }
      );
    }

    await db.insert(pageViews).values({
      page,
      visitorId,
      referrer,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("pageView error:", error);

    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
