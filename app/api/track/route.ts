import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTrackingUrl } from "@/lib/tracking";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order");
    const phone = searchParams.get("phone");

    if (!orderId && !phone) {
      return NextResponse.json(
        { error: "Please provide an Order ID or Phone number" },
        { status: 400 },
      );
    }

    const where: any = {};
    if (orderId) where.id = orderId;
    if (phone) where.phone = phone;

    const orders = await prisma.order.findMany({
      where,
      include: {
        orderitem: {
          include: { product: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    if (orders.length === 0) {
      return NextResponse.json(
        { error: "No orders found" },
        { status: 404 },
      );
    }

    const result = orders.map((order) => ({
      id: order.id,
      status: order.status,
      courierName: order.courierName,
      trackingId: order.trackingId,
      totalAmount: order.totalAmount,
      shippingCost: order.shippingCost,
      paymentType: order.paymentType,
      fullName: order.fullName,
      createdAt: order.createdAt,
      items: order.orderitem.map((oi) => ({
        name: oi.product.name,
        quantity: oi.quantity,
      })),
      trackingUrl: getTrackingUrl(order.courierName, order.trackingId),
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
