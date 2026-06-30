import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isOwner, OWNER_EMAIL } from "@/lib/permissions";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, permissions: true },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const isAdmin = user.role === "ADMIN";

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin,
        isOwner: isOwner(user.email),
        permissions: user.permissions,
        ...(isAdmin ? { ownerEmail: OWNER_EMAIL } : {}),
      },
    });
  } catch (error: any) {
    console.error("ME ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
