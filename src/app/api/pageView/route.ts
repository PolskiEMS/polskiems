import { NextResponse } from "next/server";
import { pageViews } from "@/db/schema";
import { getDb } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const page = String(body?.page ?? "").trim();
    const visitorId = String(body?.visitorId ?? "").trim();
    const referrer = body?.referrer ? String(body.referrer) : null;

    if (!page || !visitorId) {
      return NextResponse.json(
        { ok: false, error: "Brak wymaganych danych." },
        { status: 400 }
      );
    }

    const db = getDb();

    await db.insert(pageViews).values({
      page,
      visitorId,
      referrer,
      createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("pageView POST error:", error);

    return NextResponse.json(
      { ok: false, error: "Nie udało się zapisać odsłony." },
      { status: 500 }
    );
  }
}