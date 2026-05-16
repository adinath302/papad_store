import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    console.error("Prisma Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products from database" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Incoming Payload:", body);

    // 1. Strict Validation: Enforce exact types for a real production project
    if (
      !body.name ||
      typeof body.name !== "string" ||
      body.name.trim() === ""
    ) {
      return NextResponse.json(
        { error: "Product name is required" },
        { status: 400 },
      );
    }
    if (
      typeof body.price !== "number" ||
      !Number.isFinite(body.price) ||
      body.price <= 0
    ) {
      return NextResponse.json(
        { error: "A valid positive price is required" },
        { status: 400 },
      );
    }

    // 2. Format fields so they don't break Prisma types
    const product = await prisma.product.create({
      data: {
        name: body.name.trim(),
        price: Math.round(body.price), // MySQL Int requires integers
        description: body.description?.trim() || null,
        stock: typeof body.stock === "number" ? body.stock : 0,
        image: body.image?.trim() || null,
        thumbnail: body.thumbnail?.trim() || null, // Matches schema field
      },
    });

    revalidatePath("/(user)");
    revalidatePath("/(user)/products");

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    // This logs the precise MySQL error block inside your terminal console
    console.error("CRITICAL DATABASE CRASH:", error);
    return NextResponse.json(
      { error: "Internal Server Database Exception", details: error.message },
      { status: 500 },
    );
  }
}
