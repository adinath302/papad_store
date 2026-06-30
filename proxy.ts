import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    const userId = req.cookies.get("userId")?.value;
    const role = req.cookies.get("role")?.value;
    if (!userId || role !== "ADMIN") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("redirect", req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
