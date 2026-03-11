import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const validUser = username === process.env.ADMIN_USERNAME;
    const validPassword = await bcrypt.compare(
      password,
      process.env.ADMIN_PASSWORD_HASH || ""
    );

    if (!validUser || !validPassword) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set("admin-session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
