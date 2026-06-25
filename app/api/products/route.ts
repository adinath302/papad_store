import { NextResponse, NextRequest } from "next/server";
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

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        productvariant: true,
      },
    })
    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
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
    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!can(currentUser.permissions, "products", "create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
