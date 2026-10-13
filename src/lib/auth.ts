import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

const SESSION_COOKIE_NAME = "organizer_session";
const SESSION_DURATION = 60 * 60 * 24; // 24 hours in seconds

function getSecretKey(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ||
    "silvestr-secret-fallback-key-prostejov-2025-at-least-32-chars";
  return new TextEncoder().encode(secret);
}

export function verifyOrganizerPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD || "silvestr-prostejov";
  return password.trim() === adminPassword.trim();
}

export async function createOrganizerToken(): Promise<string> {
  const secretKey = getSecretKey();
  return await new SignJWT({ role: "organizer" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(secretKey);
}

export async function verifyOrganizerToken(token: string): Promise<boolean> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return payload.role === "organizer";
  } catch {
    return false;
  }
}

export async function isOrganizerAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return false;
    return await verifyOrganizerToken(token);
  } catch {
    return false;
  }
}

export async function setOrganizerSessionCookie(): Promise<void> {
  const token = await createOrganizerToken();
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function clearOrganizerSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
