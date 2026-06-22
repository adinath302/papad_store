import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
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
