import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { pageViews } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const db = getDb();

    await db.insert(pageViews).values({
      page: "home",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("pageView error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}