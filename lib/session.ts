import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const SESSION_NAME = "session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

const secretKey = process.env.SESSION_SECRET;

if (!secretKey) {
  throw new Error("SESSION_SECRET is not defined");
}

const encodedKey = new TextEncoder().encode(secretKey);

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

export async function encryptSession(
  payload: SessionPayload
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(new Date(payload.expiresAt))
    .sign(encodedKey);
}

export async function decryptSession(
  token: string | undefined
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });

    if (!payload.userId) return null;

    return {
      userId: String(payload.userId),
      expiresAt: Number(payload.expiresAt),
    };
  } catch {
    return null;
  }
}

export async function createSession(userId: string) {
  const expiresAt = Date.now() + SESSION_DURATION_MS;

  const session = await encryptSession({ userId, expiresAt });

  const cookieStore = await cookies();

  cookieStore.set(SESSION_NAME, session, {
    httpOnly: true,
    secure: process.env.SESSION_COOKIE_SECURE === "true",
    expires: new Date(expiresAt),
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_NAME);
}

export async function getSessionUserId(): Promise<string | null> {
  const cookieStore = await cookies();

  const session = await decryptSession(
    cookieStore.get(SESSION_NAME)?.value
  );

  if (!session || session.expiresAt < Date.now()) {
    return null;
  }

  return session.userId;
}