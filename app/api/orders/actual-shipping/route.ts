import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIndiaPostOptions } from "@/lib/indiapost";
import { calculateShippingFee } from "@/lib/shipping";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("id");
    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderitem: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const totalWeight = order.orderitem.reduce((sum, item) => {
      return sum + (item.product.weight || 200) * item.quantity;
    }, 0);

    const result = await getIndiaPostOptions({
      deliveryPincode: order.pincode,
      totalWeight,
    });

    if (!result.options || result.options.length === 0) {
      // Fallback: use flat-rate calculation when IndiaPost is unavailable
      const fallbackRate = calculateShippingFee(order.totalAmount, order.state);
      return NextResponse.json({
        service: "Standard Shipping",
        rate: fallbackRate,
        estimatedDelivery: "3-6 business days",
        weight: totalWeight,
        pincodeInfo: result.pincodeInfo,
        note: "Estimated rate (IndiaPost unavailable)",
      }, { status: 200 });
    }

    return NextResponse.json({
      service: result.options[0].service,
      rate: result.options[0].rate,
      estimatedDelivery: result.options[0].estimated_delivery,
      weight: totalWeight,
      pincodeInfo: result.pincodeInfo,
    });
  } catch (error: any) {
    console.error("ACTUAL SHIPPING ERROR:", error);
    return NextResponse.json({ error: "Failed to get shipping rates" }, { status: 500 });
  }
}
