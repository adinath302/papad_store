import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const adminEmails = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export async function middleware(req: NextRequest) {
  const userId = req.cookies.get("userId")?.value;

  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!userId) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const res = await fetch(
        `${req.nextUrl.origin}/api/auth/user?userId=${userId}`,
        { cache: "no-store" },
      );
      if (!res.ok) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
      const user = await res.json();

      const isAdminByRole = user.role === "ADMIN";
      const isAdminByEmail = adminEmails.includes(user.email?.toLowerCase());

      if (!isAdminByRole && !isAdminByEmail) {
        return NextResponse.redirect(new URL("/", req.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
