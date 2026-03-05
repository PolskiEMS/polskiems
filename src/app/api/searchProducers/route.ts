import { NextRequest, NextResponse } from "next/server";
import { saveCompanyEvent } from "@/lib/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const result = await saveCompanyEvent(payload);
    return NextResponse.json(result);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
