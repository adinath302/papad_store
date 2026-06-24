import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/permissions";
import { cookies } from "next/headers";

async function getCurrentUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true, permissions: true },
  });
  return user;
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!can(currentUser.permissions, "products", "edit")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    await prisma.productvariant.deleteMany({ where: { productId: id } });

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        nameMarathi: body.nameMarathi || null,
        description: body.description || null,
        stock: body.stock ? Number(body.stock) : null,
        image: body.image || null,
        thumbnail: body.image || null,
        productType: body.productType || "weight",
        productvariant: {
          create: (body.variants || []).map((v: any) => ({
            label: v.label,
            price: Number(v.price),
          })),
        },
      },
      include: { productvariant: true },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!can(currentUser.permissions, "products", "delete")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    await prisma.productvariant.deleteMany({ where: { productId: id } });
    await prisma.cartitem.deleteMany({ where: { productId: id } });
    await prisma.orderitem.deleteMany({ where: { productId: id } });
    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete product" },
      { status: 500 },
    );
  }
}
