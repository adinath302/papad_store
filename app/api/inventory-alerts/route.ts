import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
  return user;
}

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: {
        stock: { not: null },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        lowStockThreshold: true,
      },
    });

    const alerts = products.filter(
      (p) => p.stock != null && p.stock <= (p.lowStockThreshold ?? 10),
    );

    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch inventory alerts" },
      { status: 500 },
    );
  }
}
