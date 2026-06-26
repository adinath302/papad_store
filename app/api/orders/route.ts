import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can, isOwner } from "@/lib/permissions";
import { cookies } from "next/headers";
import { sendCustomerShippingNotification } from "@/lib/email";
import { getTrackingUrl } from "@/lib/tracking";

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
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isOwner(currentUser.email) && !can(currentUser.permissions, "orders", "view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status, courierName, trackingId } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "Missing id" },
        { status: 400 },
      );
    }

    if (status && !isOwner(currentUser.email) && !can(currentUser.permissions, "orders", "update_status")) {
      return NextResponse.json({ error: "Forbidden: cannot update order status" }, { status: 403 });
    }

    if ((courierName !== undefined || trackingId !== undefined) && !isOwner(currentUser.email) && !can(currentUser.permissions, "orders", "add_tracking")) {
      return NextResponse.json({ error: "Forbidden: cannot add tracking info" }, { status: 403 });
    }

    const data: any = {};
    if (status) data.status = status;
    if (courierName !== undefined) data.courierName = courierName;
    if (trackingId !== undefined) data.trackingId = trackingId;

    const order = await prisma.order.update({
      where: { id },
      data,
      include: {
        orderitem: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    const shouldNotify =
      order.trackingId &&
      order.trackingId !== "PENDING" &&
      (data.trackingId !== undefined || data.status === "SHIPPED");

    if (shouldNotify && order.user?.email) {
      const trackingUrl = getTrackingUrl(order.courierName, order.trackingId);
      sendCustomerShippingNotification(order.user.email, {
        orderId: order.id,
        fullName: order.fullName,
        courierName: order.courierName || "",
        trackingId: order.trackingId || "",
        trackingUrl,
        items: order.orderitem.map((oi) => ({
          name: oi.product.name,
          quantity: oi.quantity,
        })),
      }).catch((e) => console.error("Shipping email error:", e));
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update order" },
      { status: 500 },
    );
  }
}
