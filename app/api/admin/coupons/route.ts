import { NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, permissions: true },
  });
  return user;
}

export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(coupons);
}

export async function POST(req: Request) {
  const csrfToken = req.headers.get("x-csrf-token");
  if (!(await validateCsrfToken(csrfToken))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        type: body.type,
        value: Number(body.value),
        minCartValue: body.minCartValue ? Number(body.minCartValue) : null,
        maxDiscount: body.maxDiscount ? Number(body.maxDiscount) : null,
        usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        isActive: body.isActive !== false,
      },
    });
    return NextResponse.json(coupon);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const csrfToken = req.headers.get("x-csrf-token");
  if (!(await validateCsrfToken(csrfToken))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { code, type, value, minCartValue, maxDiscount, usageLimit, expiresAt, isActive, id } = body;
    const coupon = await prisma.coupon.update({
      where: { id },
      data: { code, type, value, minCartValue, maxDiscount, usageLimit, expiresAt, isActive },
    });
    return NextResponse.json(coupon);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const csrfToken = req.headers.get("x-csrf-token");
  if (!(await validateCsrfToken(csrfToken))) {
    return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
  }

  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
