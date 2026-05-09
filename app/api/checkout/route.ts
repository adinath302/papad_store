import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Create order first, then create order items separately.
    // This avoids any Prisma nested-write input naming mismatches.
    const order = await prisma.order.create({
      data: {
        userId,
      },
      include: {
        orderItems: { include: { product: true } },
      },
    });

    await prisma.orderItem.createMany({
      data: cartItems.map((item: any) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: Number(item.quantity),
      })),
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderItems: { include: { product: true } },
        user: true,
      },
    });

    await prisma.cartItem.deleteMany({ where: { userId } });

    return Response.json(updatedOrder);
  } catch (error: any) {
    console.log("CHECKOUT ERROR:", error);
    return Response.json(
      { error: error?.message ?? "Checkout failed" },
      { status: 500 },
    );
  }
}
