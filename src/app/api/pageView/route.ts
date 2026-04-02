import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { pageViews } from "@/db/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, visitorId } = body;

    if (!page || !visitorId) {
      return NextResponse.json(
        { error: 'Missing page or visitorId' },
        { status: 400 }
      );
    }

    const db = getDb();
    await db.insert(pageViews).values({
      page,
      visitorId,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[pageView API Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
