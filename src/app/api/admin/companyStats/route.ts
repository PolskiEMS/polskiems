import { NextRequest, NextResponse } from "next/server";
import { getcompanyStats } from "@/lib/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const days = Number(req.nextUrl.searchParams.get("days") ?? "30");
  const data = await getcompanyStats(Number.isFinite(days) ? days : 30);
  return NextResponse.json(data);
}