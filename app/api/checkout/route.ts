import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { fullName, phone, address1, address2, city, state, pincode, paymentType } = body;

    if (!fullName || !phone || !address1 || !city || !state || !pincode) {
      return Response.json(
        { error: "Missing required shipping fields" },
        { status: 400 },
      );
    }

    const cartItems = await prisma.cartitem.findMany({
      where: { userId },
      include: {
        product: {
          include: { productvariant: true },
        },
      },
    });

    if (cartItems.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    const totalAmount = cartItems.reduce((sum, item) => {
      const variants = item.product.productvariant;
      const price =
        variants.length > 0
          ? Math.min(...variants.map((v) => v.price))
          : 0;
      return sum + price * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId,
        paymentType: paymentType || "COD",
        shippingCost: 0,
        totalAmount,
        fullName,
        phone,
        address1,
        address2: address2 || null,
        city,
        state,
        pincode,
      },
    });

    await prisma.orderitem.createMany({
      data: cartItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
      })),
    });

    await prisma.cartitem.deleteMany({ where: { userId } });

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderitem: { include: { product: true } },
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return Response.json(updatedOrder);
  } catch (error: any) {
    console.log("CHECKOUT ERROR:", error);
    return Response.json(
      { error: error?.message ?? "Checkout failed" },
      { status: 500 },
    );
  }
}
