import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const text = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 },
      );
    }

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 400 },
      );
    }

    const event = JSON.parse(text);

    // Handle payment captured event
    if (event.event === "payment.captured") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      const order = await prisma.order.findFirst({
        where: { razorpayOrderId },
      });
      if (order) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            razorpayPaymentId,
            status: "CONFIRMED",
          },
        });
      }

      console.log(
        `Order ${razorpayOrderId} confirmed via payment ${razorpayPaymentId}`,
      );
    }

    // Handle payment failed event
    if (event.event === "payment.failed") {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      const failedOrder = await prisma.order.findFirst({
        where: { razorpayOrderId },
        include: { orderitem: true },
      });

      if (failedOrder) {
        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: failedOrder.id },
            data: { status: "CANCELLED" },
          });

          // Restore stock
          for (const item of failedOrder.orderitem) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        });
      }

      console.log(
        `Order ${razorpayOrderId} cancelled due to payment failure`,
      );
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("WEBHOOK ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Webhook processing failed" },
      { status: 500 },
    );
  }
}
