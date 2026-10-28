import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import * as jose from "jose";
import { SessionUser } from "@/layers/policy/access-control";

const COOKIE_NAME = "auth_session";
const SESSION_SECRET = new TextEncoder().encode(
  process.env.SESSION_SECRET || "default-local-session-secret-32-chars-long"
);

export async function signSessionToken(user: SessionUser): Promise<string> {
  return await new jose.SignJWT({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    issuerId: user.issuerId || null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SESSION_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jose.jwtVerify(token, SESSION_SECRET, {
      algorithms: ["HS256"],
    });
    return {
      id: payload.id as string,
      email: payload.email as string,
      displayName: payload.displayName as string,
      role: payload.role as SessionUser["role"],
      issuerId: (payload.issuerId as string) || undefined,
    };
  } catch {
    return null;
  }
}

export async function getSessionUser(
  req?: NextRequest
): Promise<SessionUser | null> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;
  } else {
    const cookieStore = await cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  }

  if (!token) return null;
  return await verifySessionToken(token);
}

export async function setSessionCookie(user: SessionUser): Promise<string> {
  const token = await signSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
