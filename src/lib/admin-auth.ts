import "server-only";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/admin-session";

export async function requireAdminSession() {
  const cookieStore = await cookies();
  if (!await verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    throw new Error("Unauthorized");
  }
}
