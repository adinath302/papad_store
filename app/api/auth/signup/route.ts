import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
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
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

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
