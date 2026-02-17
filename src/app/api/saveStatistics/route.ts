import { NextResponse } from "next/server"
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await req.json();
  // TODO: zapis do bazy (MySQL)
  return NextResponse.json({ ok: true });
}