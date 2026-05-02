import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("BODY:", body);

    const { productId, quantity } = body;
    const newQuantity = quantity || 1;

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { productId },
    });

    let item;

    if (existingItem) {
      // Update quantity by adding to existing quantity
      item = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + newQuantity,
        },
      });
    } else {
      // Create new cart item
      item = await prisma.cartItem.create({
        data: {
          productId,
          quantity: newQuantity,
        },
      });
    }

    revalidatePath("/cart");

    return Response.json(item);
  } catch (error: any) {
    console.log("POST ERROR:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const cartItems = await prisma.cartItem.findMany({
      include: {
        product: true,
      },
    });
    return Response.json(cartItems);
  } catch (error: any) {
    console.log("GET ERROR:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "Missing ID" }, { status: 400 });
    }

    await prisma.cartItem.delete({
      where: { id },
    });

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

    const item = await prisma.cartItem.findUnique({
      where: { id },
    });

    if (!item) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    let newQuantity = item.quantity;

    if (action === "increase") {
      newQuantity += 1;
    } else if (action === "decrease") {
      newQuantity -= 1;
    }

    // ❗ if quantity becomes 0 → delete item
    if (newQuantity <= 0) {
      await prisma.cartItem.delete({
        where: { id },
      });

      return Response.json({ message: "Item removed" });
    }

    const updated = await prisma.cartItem.update({
      where: { id },
      data: {
        quantity: newQuantity,
      },
    });

    return Response.json(updated);
  } catch (error: any) {
    console.log("PATCH ERROR:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
}