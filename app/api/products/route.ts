import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET() {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const product = await prisma.product.create({
    data: body
  });

  revalidatePath("/products");
  revalidatePath("/product_List");

  return NextResponse.json(product);
}
