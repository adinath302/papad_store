import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const CSRF_COOKIE = "csrf-token";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function csrfCookieOptions() {
  return {
    httpOnly: false,
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
  };
}

export function applyCsrfCookie(res: NextResponse) {
  const token = generateToken();
  res.cookies.set(CSRF_COOKIE, token, csrfCookieOptions());
  return token;
}

export async function setCsrfToken() {
  const token = generateToken();
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, token, csrfCookieOptions());
  return token;
}

export async function validateCsrfToken(headerToken?: string | null): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  if (!cookieToken) return false;
  if (!headerToken) return false;
  return headerToken === cookieToken;
}
