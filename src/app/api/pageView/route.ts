import { NextResponse } from "next/server";
import { pageViews } from "@/db/schema";
import { getDb } from "@/lib/db";

function normalizePageKey(pageRaw: string) {
  const page = pageRaw.trim().toLowerCase();

  if (page === "home" || page === "/") return "home";
  if (page === "search" || page === "/wyszukaj") return "search";
  if (
    page === "all-producers" ||
    page === "all-producer" ||
    page === "/wszyscy-producenci" ||
    page === "wszyscy-producenci"
  ) {
    return "all-producers";
  }

  return pageRaw.trim();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const page = normalizePageKey(String(body?.page ?? ""));
    const visitorIdRaw = String(body?.visitorId ?? "").trim();
    const visitorId =
      visitorIdRaw ||
      `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const referrer = body?.referrer ? String(body.referrer) : null;

    if (!page) {
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
