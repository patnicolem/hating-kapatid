import { createRemoteJWKSet, jwtVerify } from "jose";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUER = "https://accounts.google.com";

function getClientConfig() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are not configured"
    );
  }

  return { clientId, clientSecret };
}

export function buildGoogleAuthUrl(params: {
  redirectUri: string;
  state: string;
}): string {
  const { clientId } = getClientConfig();

  const url = new URL(GOOGLE_AUTH_URL);

  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", params.state);
  url.searchParams.set("prompt", "select_account");

  return url.toString();
}

export async function exchangeCodeForTokens(params: {
  code: string;
  redirectUri: string;
}): Promise<{ idToken: string }> {
  const { clientId, clientSecret } = getClientConfig();

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code: params.code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: params.redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange Google authorization code");
  }

  const data = (await response.json()) as { id_token?: string };

  if (!data.id_token) {
    throw new Error("Google did not return an id_token");
  }

  return { idToken: data.id_token };
}

const googleKeys = createRemoteJWKSet(new URL(GOOGLE_JWKS_URL));

export async function verifyGoogleIdToken(
  idToken: string
): Promise<{
  email: string;
  emailVerified: boolean;
  name: string | null;
}> {
  const { payload } = await jwtVerify(idToken, googleKeys, {
    issuer: GOOGLE_ISSUER,
    algorithms: ["RS256"],
  });

  if (!payload.email || typeof payload.email !== "string") {
    throw new Error("Google id_token is missing an email");
  }

  return {
    email: payload.email,
    emailVerified: payload.email_verified === true,
    name: typeof payload.name === "string" ? payload.name : null,
  };
}