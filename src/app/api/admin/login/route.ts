import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE, createAdminSession } from "@/lib/admin-session";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ success: false }, { status: 400 });
    const { username, password } = body as Record<string, unknown>;

    const validUser = username === process.env.ADMIN_USERNAME;
    const validPassword = password === process.env.ADMIN_PASSWORD;

    if (!validUser || !validPassword) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(ADMIN_SESSION_COOKIE, await createAdminSession(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    if (error instanceof SyntaxError) return NextResponse.json({ success: false }, { status: 400 });
    console.error("Admin login failed");
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
