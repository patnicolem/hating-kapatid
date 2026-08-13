import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { exchangeCodeForTokens, verifyGoogleIdToken } from "@/lib/google";

const STATE_COOKIE = "oauth_state";

function redirectError(request: Request, reason: string) {
  return NextResponse.redirect(
    new URL(`/login?error=${reason}`, request.url)
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const code = searchParams.get("code");
    const state = searchParams.get("state");

    if (searchParams.has("error") || !code || !state) {
      return redirectError(request, "google");
    }

    const cookieStore = await cookies();

    const expectedState = cookieStore.get(STATE_COOKIE)?.value;

    if (!expectedState || expectedState !== state) {
      return redirectError(request, "invalid_state");
    }

    cookieStore.delete(STATE_COOKIE);

    const origin = new URL(request.url).origin;

    const redirectUri = `${origin}/api/auth/google/callback`;

    const { idToken } = await exchangeCodeForTokens({
      code,
      redirectUri,
    });

    const googleUser = await verifyGoogleIdToken(idToken);

    if (!googleUser.emailVerified) {
      return redirectError(request, "email_not_verified");
    }

    const email = googleUser.email.toLowerCase();

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    const user = existing
      ? existing
      : await prisma.user.create({
          data: {
            email,
            username: googleUser.name?.trim() || email.split("@")[0],
            passwordHash: null,
          },
        });

    await createSession(user.id);

    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("Google sign-in failed:", error);

    return redirectError(request, "google");
  }
}