import { cookies } from "next/headers";

const CSRF_COOKIE = "csrf-token";

function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function setCsrfToken() {
  const token = generateToken();
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
    secure: process.env.NODE_ENV === "production",
  });
  return token;
}

export async function validateCsrfToken(headerToken?: string | null): Promise<boolean> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  if (!cookieToken) return true;
  if (!headerToken) return false;
  return headerToken === cookieToken;
}

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export async function fetchCsrf(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = getCsrfTokenFromCookie();
  const headers = new Headers(options.headers);
  if (token) headers.set("x-csrf-token", token);
  return fetch(url, { ...options, headers });
}
