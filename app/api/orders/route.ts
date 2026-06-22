import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        orderitem: {
          include: { product: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json(
        { error: "Missing id or status" },
        { status: 400 },
      );
    }
    const order = await prisma.order.update({
      where: { id },
      data: { status },
    });
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update order" },
      { status: 500 },
    );
  }
}
