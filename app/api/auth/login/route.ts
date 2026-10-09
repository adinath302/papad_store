import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "@/lib/rate-limit";
import { applyCsrfCookie } from "@/lib/csrf";
import { normalizeEmail, setAuthCookies } from "@/lib/auth-cookies";
import { isOwner } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = normalizeEmail(body?.email);
    const password = typeof body?.password === "string" ? body.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const { allowed } = await checkRateLimit(`login:${ip}`, 10, 60_000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user?.password) {
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

    let role = user.role;
    if (isOwner(user.email) && role !== "ADMIN") {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
        select: { role: true },
      });
      role = updated.role;
    }

    const res = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        isAdmin: role === "ADMIN",
      },
    });

    setAuthCookies(res, { id: user.id, role });
    applyCsrfCookie(res);

    return res;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
