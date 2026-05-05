import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    // 1. Get all cart items
    const cartItems = await prisma.cartItem.findMany({
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    // 2. Create Order
    const order = await prisma.order.create({
      data: {
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // 3. Clear cart
    await prisma.cartItem.deleteMany();

    return Response.json(order);
  } catch (error: any) {
    console.log("CHECKOUT ERROR:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}