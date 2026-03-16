import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { pageViews } from "@/db/schema";

export async function POST(req: Request) {
  try {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
  const page =
      typeof body.page === "string" && body.page.trim()
        ? body.page.trim()
        : "home";
  
    const referrer = req.headers.get("referer") ?? null;

    await db.insert(pageViews).values({
      page,
      referrer,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error recording page view:", error);
    return NextResponse.json({ ok: false, error: "Failed to record page view" }, { status: 500 });
  }

}