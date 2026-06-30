import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    const rateCheck = await checkRateLimit(`logout:${ip}`, 10, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const cookieStore = await cookies();
    const cookiesToClear = ["userId", "isLoggedIn", "role", "csrf-token"];

    for (const name of cookiesToClear) {
      cookieStore.set(name, "", {
        httpOnly: name !== "isLoggedIn" && name !== "csrf-token",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
    }

    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error: any) {
    console.error("LOGOUT ERROR:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}
