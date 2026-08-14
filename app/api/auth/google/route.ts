import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { buildGoogleAuthUrl } from "@/lib/google";

const STATE_COOKIE = "oauth_state";
const NEXT_COOKIE = "oauth_next";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;

  const redirectUri = `${origin}/api/auth/google/callback`;

  const state = randomBytes(24).toString("base64url");

  const cookieStore = await cookies();

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.SESSION_COOKIE_SECURE === "true",
    expires: new Date(Date.now() + 10 * 60 * 1000),
    sameSite: "lax" as const,
    path: "/",
  };

  cookieStore.set(STATE_COOKIE, state, cookieOptions);

  const next = new URL(request.url).searchParams.get("next");

  if (next && next.startsWith("/") && !next.startsWith("//")) {
    cookieStore.set(NEXT_COOKIE, next, cookieOptions);
  }

  return NextResponse.redirect(
    buildGoogleAuthUrl({ redirectUri, state })
  );
}