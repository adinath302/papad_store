const CSRF_COOKIE = "csrf-token";

function getCsrfTokenFromCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CSRF_COOKIE}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

async function ensureCsrfToken(): Promise<string | null> {
  let token = getCsrfTokenFromCookie();
  if (token) return token;
  try {
    const res = await fetch("/api/csrf", { method: "GET" });
    const data = await res.json();
    token = data.token ?? null;
  } catch {}
  return token;
}

export async function fetchCsrf(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  const token = await ensureCsrfToken();
  const headers = new Headers(options.headers);
  if (token) headers.set("x-csrf-token", token);
  return fetch(url, { ...options, headers });
}
