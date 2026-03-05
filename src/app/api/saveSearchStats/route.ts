import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { statystyki } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const stats = (body?.stats ?? "").toString();
    if (!stats || stats.length < 3) {
      return NextResponse.json({ ok: false, error: "Invalid stats" }, { status: 400 });
    }

    const db = getDb();
    await db.insert(statystyki).values({ wynik: stats });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("saveSearchStats error:", err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}