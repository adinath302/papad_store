import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";
import { setCsrfToken } from "@/lib/csrf";

export async function POST(req: Request) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const rateKey = `signup:${ip}`;
    const { allowed } = await checkRateLimit(rateKey, 5, 60_000);
    if (!allowed) {
      return Response.json(
        { error: "Too many sign-up attempts. Try again later." },
        { status: 429 },
      );
    }

    const { name, email, password } = await req.json();

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return Response.json(
        { error: "User already exists" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true, role: true },
    });

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

    await setCsrfToken();

    return Response.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.role === "ADMIN",
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
