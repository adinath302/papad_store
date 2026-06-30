import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isOwner } from "@/lib/permissions";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import { validateCsrfToken } from "@/lib/csrf";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  return user;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isOwner(currentUser.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const { permissions } = body;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        permissions: permissions || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        permissions: true,
      },
    });

    return NextResponse.json({ admin: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isOwner(currentUser.email)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (isOwner(target.email)) {
      return NextResponse.json(
        { error: "Cannot demote the owner" },
        { status: 403 },
      );
    }

    await prisma.user.update({
      where: { id },
      data: { role: "USER", permissions: Prisma.DbNull },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
