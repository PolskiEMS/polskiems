import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { pageViews } from "@/db/schema";
import { count, eq, sql } from "drizzle-orm"; // Zakładam Drizzle

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const db = getDb();
    const body = await req.json().catch(() => ({}));
    
    // Walidacja + defaults
    const page = (body.page as string)?.trim() || "home";
    const visitorId = (body.visitorId as string)?.trim() || null;
    const timestamp = body.timestamp ? new Date(body.timestamp) : new Date();
    const userAgent = (req.headers.get("user-agent") || "").slice(0, 500);
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || 
               req.headers.get("x-real-ip") || 
               "unknown";
    const referrer = req.headers.get("referer") || null;

    console.log(`[PageView] ${page} | Visitor: ${visitorId?.slice(0,8)} | IP: ${ip}`);

    // UPSERT - unikaj duplikatów (visitor + page + czas)
    await db.insert(pageViews).values({
      page,
      visitorId,
      timestamp,
      userAgent,
      ip: ip.slice(0, 45),
      referrer,
    }).onConflictDoNothing(); // Drizzle/Postgres

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (error) {
    console.error("PageView ERROR:", error);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}

// BONUS: GET endpoint do dashboardu monetyzacji
export async function GET(req: NextRequest) {
  try {
    const db = getDb();
    const { searchParams } = new URL(req.url);
    const days = Number(searchParams.get("days")) || 30;

    // Unikalne wizyty (visitorId per page)
    const uniqueViews = await db
      .select({ count: count() })
      .from(pageViews)
      .where(sql`date_trunc('day', timestamp) >= NOW() - INTERVAL '${days} days'`)
      .groupBy(sql`visitorId, page`);

    // Całkowite views per page
    const pageStats = await db
      .select({
        page: pageViews.page,
        views: count(),
      })
      .from(pageViews)
      .where(sql`timestamp >= NOW() - INTERVAL '${days} days'`)
      .groupBy(pageViews.page)
      .orderBy(sql`views desc`);

    return NextResponse.json({
      totalViews: await db.select({ count: count() }).from(pageViews).where(sql`timestamp >= NOW() - INTERVAL '${days} days'`),
      uniqueVisitors: uniqueViews.length,
      topPages: pageStats,
    });
  } catch (error) {
    console.error("Stats ERROR:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
