import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        productvariant: true,
      },
    })
    return NextResponse.json(products);
  } catch (error: any) {
    console.log("FULL PRODUCT ERROR:");
    console.dir(error, { depth: null });

    return NextResponse.json(
      {
        error: error?.message || "Database error",
        full: String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        nameMarathi: body.nameMarathi || null,
        description: body.description || null,

        stock: Number(body.stock) || 0,

        image: body.image || null,

        thumbnail: body.thumbnail || body.image || null,

        productType: body.productType || "weight",

        productvariant: {
          create: body.variants.map((v: any) => ({
            label: v.label,
            price: Number(v.price),
          })),
        },
      },

      include: {
        productvariant: true,
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    console.log(error);

    return NextResponse.json(
      {
        error: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
