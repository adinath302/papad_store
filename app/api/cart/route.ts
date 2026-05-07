import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    console.log("USER ID:", userId);
    if (!userId) {
      return Response.json({ error: "Not logged in" }, { status: 401 });
    }

    const item = await prisma.cartItem.create({
      data: {
        productId,
        userId,
        quantity: 1,
      },
    });

    return Response.json(item);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return Response.json([], { status: 200 });
  }

  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
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
