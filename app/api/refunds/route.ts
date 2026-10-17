import { NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { getRazorpay, isRazorpayConfigured } from "@/lib/razorpay";
import { logActivity } from "@/lib/activity";
import { cookies } from "next/headers";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
  return user;
}

export async function POST(req: Request) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, amount, reason } = await req.json();
    if (!orderId || amount == null) {
      return NextResponse.json({ error: "orderId and amount are required" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { refund: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!order.razorpayPaymentId) {
      return NextResponse.json({ error: "Order has no Razorpay payment ID" }, { status: 400 });
    }

    if (!isRazorpayConfigured()) {
      return NextResponse.json(
        { error: "Online payments are not configured" },
        { status: 501 },
      );
    }

    if (order.refund.length > 0) {
      return NextResponse.json({ error: "Order already has a refund" }, { status: 400 });
    }

    const amountPaise = Math.round(Number(amount) * 100);
    if (!Number.isFinite(amountPaise) || amountPaise < 100) {
      return NextResponse.json({ error: "Invalid refund amount" }, { status: 400 });
    }
    const razorpayRefund = await getRazorpay().payments.refund(order.razorpayPaymentId, { amount: amountPaise });

    const refund = await prisma.refund.create({
      data: {
        orderId,
        amount,
        reason: reason || null,
        razorpayRefundId: razorpayRefund.id,
        status: "PROCESSED",
      },
    });

    await logActivity(currentUser.id, "REFUND", "order", orderId, `Refund of ₹${amount} processed${reason ? `: ${reason}` : ""}`);

    return NextResponse.json(refund);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to process refund" },
      { status: 500 },
    );
  }
}
