import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json([]);
  }

  const items = await prisma.wishlistitem.findMany({
    where: { userId },
    include: {
      product: { include: { productvariant: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const { productId } = await req.json();

  if (!productId) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  if (!userId) {
    return NextResponse.json({ error: "Please log in to save wishlist items" }, { status: 401 });
  }

  const existing = await prisma.wishlistitem.findFirst({
    where: { userId, productId },
  });

  if (existing) {
    await prisma.wishlistitem.delete({ where: { id: existing.id } });
    return NextResponse.json({ added: false });
  }

  await prisma.wishlistitem.create({
    data: { userId, productId },
  });

  return NextResponse.json({ added: true });
}
