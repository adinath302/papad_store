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
    const { id, status, courierName, trackingId } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing id" },
        { status: 400 },
      );
    }
    const data: any = {};
    if (status) data.status = status;
    if (courierName !== undefined) data.courierName = courierName;
    if (trackingId !== undefined) data.trackingId = trackingId;

    const order = await prisma.order.update({
      where: { id },
      data,
    });
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update order" },
      { status: 500 },
    );
  }
}
