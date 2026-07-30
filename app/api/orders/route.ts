import { NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { can, isOwner } from "@/lib/permissions";
import { cookies } from "next/headers";
import { sendCustomerShippingNotification, sendCustomerOrderStatusUpdate } from "@/lib/email";
import { getTrackingUrl } from "@/lib/tracking";
import { calculateSpeedPostRate, estimateZone } from "@/lib/indiapost";

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

export async function GET(req: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isOwner(currentUser.email) && !can(currentUser.permissions, "orders", "view")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ];
    }
    if (status) where.status = status;

    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderitem: {
            include: { product: true },
          },
          user: {
            select: { id: true, name: true, email: true },
          },
          refund: true,
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const ordersWithActualCost = orders.map((order) => {
      const totalWeight = order.orderitem.reduce((sum, item) => {
        return sum + (item.product.weight || 200) * item.quantity;
      }, 0);
      const zone = estimateZone(order.state);
      const actualRate = calculateSpeedPostRate(totalWeight || 500, zone);
      return {
        ...order,
        actualShippingCost: actualRate,
        totalWeight,
      };
    });

    return NextResponse.json({
      orders: ordersWithActualCost,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

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

    const VALID_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
    if (status && !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
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

    const order = await prisma.$transaction(async (tx) => {
      const prev = await tx.order.findUnique({
        where: { id },
        include: { orderitem: true },
      });

      if (!prev) {
        throw new Error("Order not found");
      }

      const updated = await tx.order.update({
        where: { id },
        data,
        include: {
          orderitem: { include: { product: true } },
          user: { select: { id: true, name: true, email: true } },
        },
      });

      // Restore stock when cancelling
      if (status === "CANCELLED" && prev.status !== "CANCELLED") {
        for (const item of prev.orderitem) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }

      return updated;
    });

    if (order.user?.email) {
      // Send status update email for any status change
      if (status && order.status !== status) {
        // use order.status which now has the updated value
        const emailData = {
          orderId: order.id,
          fullName: order.fullName,
          phone: order.phone,
          address: order.address1 + (order.address2 ? `, ${order.address2}` : ""),
          city: order.city,
          state: order.state,
          pincode: order.pincode,
          totalAmount: order.totalAmount,
          paymentType: order.paymentType,
          status: order.status,
          items: order.orderitem.map((oi) => ({
            name: oi.product.name,
            quantity: oi.quantity,
          })),
        };
        sendCustomerOrderStatusUpdate(order.user.email, emailData).catch(
          (e) => console.error("Status email error:", e),
        );
      }

      // Send shipping notification when tracking is added
      const shouldNotify =
        order.trackingId &&
        order.trackingId !== "PENDING" &&
        (data.trackingId !== undefined || data.status === "SHIPPED");

      if (shouldNotify) {
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
    }

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update order" },
      { status: 500 },
    );
  }
}
