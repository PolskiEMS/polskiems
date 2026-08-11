import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAdmin = pathname.startsWith("/admin");
  const isLogin = pathname.startsWith("/admin/login");

  const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

  if (isAdmin && !isLogin && !await verifyAdminSession(session)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
