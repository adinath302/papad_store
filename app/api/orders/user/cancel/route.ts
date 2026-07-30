import { NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { logActivity, checkLowStock } from "@/lib/activity";
import { sendCustomerOrderStatusUpdate } from "@/lib/email";
import { razorpay } from "@/lib/razorpay";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderitem: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Only pending orders can be cancelled" },
        { status: 400 },
      );
    }

    // DB transaction: initiate refund + update order status + restore stock + create refund record
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // For online payments, attempt refund inside transaction
      let refundId: string | null = null;
      if (order.razorpayPaymentId && order.paymentType !== "COD") {
        if (!razorpay) {
          throw new Error("Payment gateway not configured. Cannot process refund.");
        }
        try {
          const refund = await razorpay.payments.refund(order.razorpayPaymentId, {
            amount: order.totalAmount,
          });
          refundId = refund.id;
        } catch (refundError: any) {
          console.error("Refund failed:", refundError);
          throw new Error("Refund failed. Please contact support.");
        }
      }

      const updated = await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
        include: {
          orderitem: { include: { product: true } },
          user: { select: { id: true, name: true, email: true } },
          refund: true,
        },
      });

      for (const item of order.orderitem) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      if (refundId) {
        await tx.refund.create({
          data: {
            orderId: order.id,
            amount: order.totalAmount,
            razorpayRefundId: refundId,
            status: "PROCESSED",
          },
        });
      }

      return updated;
    });

    // Check low stock for each restored product
    for (const item of order.orderitem) {
      await checkLowStock(item.productId);
    }

    // Log activity
    await logActivity(userId, "ORDER_CANCELLED", "order", orderId);

    // Send cancellation email
    if (order.user?.email) {
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
        status: "CANCELLED",
        items: order.orderitem.map((oi) => ({
          name: oi.product.name,
          quantity: oi.quantity,
        })),
      };
      sendCustomerOrderStatusUpdate(order.user.email, emailData).catch(
        (e) => console.error("Cancellation email error:", e),
      );
    }

    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to cancel order" },
      { status: 500 },
    );
  }
}
