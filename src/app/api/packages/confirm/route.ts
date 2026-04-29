import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      code: "FORBIDDEN",
      error:
        "Ręczna aktywacja pakietu przez użytkownika jest niedostępna. Aktywacja odbywa się po potwierdzeniu płatności lub przez administratora.",
    },
    { status: 403 }
  );
}
