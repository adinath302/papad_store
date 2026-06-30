import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";
import { setCsrfToken } from "@/lib/csrf";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rateKey = `login:${ip}`;
    const { allowed } = await checkRateLimit(rateKey, 10, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const res = NextResponse.json({ message: "Login successful" });

    const cookieStore = await cookies();
    cookieStore.set("userId", user.id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    cookieStore.set("isLoggedIn", "true", {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    cookieStore.set("role", user.role, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      secure: process.env.NODE_ENV === "production",
    });

    await setCsrfToken();

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Login failed" },
      { status: 500 },
    );
  }
}
