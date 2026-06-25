import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIndiaPostOptions } from "@/lib/indiapost";

export async function POST(req: Request) {
  try {
    const { pincode, items } = await req.json();

    if (!pincode || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Missing pincode or items" },
        { status: 400 },
      );
    }

    let totalWeight = 0;
    let subtotal = 0;

    const productIds = [...new Set(items.map((gi: any) => gi.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { productvariant: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const gi of items) {
      const product = productMap.get(gi.productId);
      if (!product) continue;

      if (gi.variantId) {
        const variant = product.productvariant.find(
          (v) => v.id === gi.variantId,
        );
        if (variant) {
          totalWeight += (variant.weight || 500) * gi.quantity;
          subtotal += variant.price * gi.quantity;
        }
      } else if (product.productvariant.length > 0) {
        const v = product.productvariant[0];
        totalWeight += (v.weight || 500) * gi.quantity;
        subtotal += v.price * gi.quantity;
      }
    }

    const { options, pincodeInfo } = await getIndiaPostOptions({
      deliveryPincode: pincode,
      totalWeight: totalWeight || 500,
    });

    return NextResponse.json({
      subtotal,
      totalWeight,
      couriers: options,
      pincodeInfo,
    });
  } catch (error: any) {
    console.error("SHIPPING RATES ERROR:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch shipping rates" },
      { status: 500 },
    );
  }
}
