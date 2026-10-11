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

    const owner = isOwner(user.email);
    let role = user.role;
    if (owner && role !== "ADMIN") {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
        select: { role: true },
      });
      role = updated.role;
    }
    const isAdmin = role === "ADMIN" || owner;

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        isAdmin,
        isOwner: owner,
        permissions: user.permissions,
        ...(isAdmin ? { ownerEmail: OWNER_EMAIL } : {}),
      },
    });
  } catch (error) {
    console.error("ME ERROR:", error);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
