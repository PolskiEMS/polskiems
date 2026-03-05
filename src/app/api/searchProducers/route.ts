import { NextRequest, NextResponse } from "next/server";
import { getFilteredProducers } from "@/lib/actions";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const filters = await req.json();
  const result = await getFilteredProducers(filters);
  return NextResponse.json(result);
}
