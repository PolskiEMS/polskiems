import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { pageViews } from "@/db/schema";

export async function POST(req: Request) {
  const db = getDb();

  const body = await req.json().catch(() => ({}));

  const page = body.page ?? "home";
  const referrer = req.headers.get("referer") ?? null;

  await db.insert(pageViews).values({
    page,
    referrer,
  });

  return NextResponse.json({ ok: true });
}