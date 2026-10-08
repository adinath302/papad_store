import type { NextResponse } from "next/server";

const ONE_WEEK = 60 * 60 * 24 * 7;

function cookieBase() {
  return {
    path: "/",
    maxAge: ONE_WEEK,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };
}

export function setAuthCookies(
  res: NextResponse,
  user: { id: string; role: string },
) {
  const base = cookieBase();

  res.cookies.set("userId", user.id, {
    ...base,
    httpOnly: true,
  });

  res.cookies.set("isLoggedIn", "true", {
    ...base,
    httpOnly: false,
  });

  res.cookies.set("role", user.role, {
    ...base,
    httpOnly: true,
  });
}

export function clearAuthCookies(res: NextResponse) {
  const names = ["userId", "isLoggedIn", "role", "csrf-token"] as const;
  for (const name of names) {
    res.cookies.set(name, "", {
      httpOnly: name !== "isLoggedIn" && name !== "csrf-token",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      secure: process.env.NODE_ENV === "production",
    });
  }
}

export function normalizeEmail(email: unknown): string {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}
