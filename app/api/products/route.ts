import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Prisma Error:", error);
    return NextResponse.json({ error: "Failed to fetch products from database" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        price: body.price,
        description: body.description,
        stock: body.stock,
      }
    });

    revalidatePath("/(user)");
    revalidatePath("/(user)/products");

    return NextResponse.json(product);
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
