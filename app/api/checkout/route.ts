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
    const body = await req.json().catch(() => ({}));
    const { fullName, phone, address, city, state, pincode, paymentType } = body;

    const cartItems = await prisma.cartitem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      return Response.json({ error: "Cart is empty" }, { status: 400 });
    }

    const totalAmount = cartItems.reduce(
      (sum: number, item: any) => sum + (item.product as any)?.price * item.quantity,
      0,
    );

    const order = await prisma.order.create({
      data: {
        userId,
        paymentType: paymentType || "COD",
        shippingCost: 0,
        totalAmount,
        fullName: fullName || cartItems[0]?.product?.name || "",
        phone: phone || "",
        address1: address || "",
        address2: null,
        city: city || "",
        state: state || "",
        pincode: pincode || "",
      },
      include: {
        orderitem: { include: { product: true } },
      },
    });

    await prisma.orderitem.createMany({
      data: cartItems.map((item: any) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: Number(item.quantity),
      })),
    });

    const updatedOrder = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        orderitem: { include: { product: true } },
        user: true,
      },
    });

    await prisma.cartitem.deleteMany({ where: { userId } });

    return Response.json(updatedOrder);
  } catch (error: any) {
    console.log("CHECKOUT ERROR:", error);
    return Response.json(
      { error: error?.message ?? "Checkout failed" },
      { status: 500 },
    );
  }
}
