import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, variantId, quantity } = body;

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return Response.json({ error: "Not logged in" }, { status: 401 });
    }

    const existingItem = await prisma.cartitem.findFirst({
      where: {
        userId,
        productId,
        variantId: variantId || null,
      },
    });

    if (existingItem) {
      const updatedItem = await prisma.cartitem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      });
      return Response.json(updatedItem);
    }

    const item = await prisma.cartitem.create({
      data: {
        productId,
        variantId: variantId || null,
        userId,
        quantity,
      },
    });

    return Response.json(item);
  } catch (error: any) {
    console.log("CART POST ERROR:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return Response.json([], { status: 200 });
  }

  const items = await prisma.cartitem.findMany({
    where: { userId },
    include: {
      product: {
        include: { productvariant: true },
      },
    },
  });

  return Response.json(items);
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing ID" }, { status: 400 });
    }

    await prisma.cartitem.delete({ where: { id } });
    return Response.json({ message: "Deleted successfully" });
  } catch (error: any) {
    console.log("DELETE ERROR:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, action } = body;

    const item = await prisma.cartitem.findUnique({ where: { id } });

    if (!item) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    let newQuantity = item.quantity;

    if (action === "increase") {
      newQuantity += 1;
    } else if (action === "decrease") {
      newQuantity -= 1;
    }

    if (newQuantity <= 0) {
      await prisma.cartitem.delete({ where: { id } });
      return Response.json({ message: "Item removed" });
    }

    const updated = await prisma.cartitem.update({
      where: { id },
      data: { quantity: newQuantity },
    });

    return Response.json(updated);
  } catch (error: any) {
    console.log("PATCH ERROR:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
