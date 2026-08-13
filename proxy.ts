import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decryptSession } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const session = await decryptSession(
    request.cookies.get("session")?.value
  );

  const isAuthed = Boolean(session?.userId);

  if (
    !isAuthed &&
    (pathname === "/" ||
      pathname.startsWith("/groups") ||
      pathname.startsWith("/friends") ||
      pathname.startsWith("/settings"))
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthed && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
};