import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { validateCsrfToken } from "@/lib/csrf";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json([]);
    }

    const items = await prisma.recentlyviewed.findMany({
      where: { userId },
      orderBy: { viewedAt: "desc" },
      take: 8,
      include: {
        product: {
          include: { productvariant: true },
        },
      },
    });

    return NextResponse.json(items);
  } catch (error: any) {
    console.error("RECENTLY VIEWED GET ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch recently viewed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    if (userId) {
      const existing = await prisma.recentlyviewed.findFirst({
        where: { userId, productId },
      });

      if (existing) {
        await prisma.recentlyviewed.update({
          where: { id: existing.id },
          data: { viewedAt: new Date() },
        });
      } else {
        await prisma.recentlyviewed.create({
          data: { userId, productId },
        });
      }
    } else {
      const existing = await prisma.recentlyviewed.findFirst({
        where: { userId: null, productId },
      });

      if (existing) {
        await prisma.recentlyviewed.update({
          where: { id: existing.id },
          data: { viewedAt: new Date() },
        });
      } else {
        const count = await prisma.recentlyviewed.count({
          where: { userId: null },
        });
        if (count >= 8) {
          const oldest = await prisma.recentlyviewed.findFirst({
            where: { userId: null },
            orderBy: { viewedAt: "asc" },
          });
          if (oldest) {
            await prisma.recentlyviewed.delete({ where: { id: oldest.id } });
          }
        }
        await prisma.recentlyviewed.create({
          data: { productId },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("RECENTLY VIEWED POST ERROR:", error);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
