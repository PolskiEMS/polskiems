import { NextRequest, NextResponse } from "next/server";
import { deactivateExpiredPaidCompanies } from "@/lib/actions";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();
  const expectedToken = process.env.CRON_SECRET?.trim();

  if (!expectedToken || token !== expectedToken) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  await deactivateExpiredPaidCompanies();

  return NextResponse.json({ ok: true });
}
