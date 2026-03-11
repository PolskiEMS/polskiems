import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const response = NextResponse.json({ success: true });

    response.cookies.set("admin-session", "true", {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 8, // 8 godzin
    });

    return response;
  }

  return NextResponse.json({ success: false }, { status: 401 });
<<<<<<< HEAD
}
=======
}
>>>>>>> 629b69b (Admin login + middleware security)
