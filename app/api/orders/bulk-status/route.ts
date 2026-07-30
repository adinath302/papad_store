import { NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { logActivity, checkLowStock } from "@/lib/activity";
import { cookies } from "next/headers";

const VALID_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

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

    const { orderIds, status } = await req.json();
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "orderIds must be a non-empty array" }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
    }

    let updatedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const orderId of orderIds) {
        const prevOrder = await tx.order.findUnique({
          where: { id: orderId },
          include: { orderitem: true },
        });
        if (!prevOrder) continue;
        updatedCount++;

        await tx.order.update({
          where: { id: orderId },
          data: { status },
        });

        if (status === "CANCELLED" && prevOrder.status !== "CANCELLED") {
          for (const item of prevOrder.orderitem) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }
        }
      }
    });

    // Log activity for each order
    for (const orderId of orderIds) {
      await logActivity(currentUser.id, "UPDATE_STATUS", "order", orderId, `Status changed to ${status}`);
    }

    // Check low stock for affected products
    const affectedProducts = await prisma.orderitem.findMany({
      where: { orderId: { in: orderIds } },
      select: { productId: true },
      distinct: ["productId"],
    });
    for (const { productId } of affectedProducts) {
      await checkLowStock(productId);
    }

    return NextResponse.json({ count: updatedCount });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update orders" },
      { status: 500 },
    );
  }
}
