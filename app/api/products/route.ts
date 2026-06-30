import { NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { can, isOwner } from "@/lib/permissions";
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
    console.error("FULL PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Database error",
        full: String(error),
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const currentUser = await getCurrentUser();
    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!isOwner(currentUser.email) && !can(currentUser.permissions, "products", "create")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const product = await prisma.product.create({
      data: {
        name: body.name,
        nameMarathi: body.nameMarathi || null,
        description: body.description || null,

        stock: Number(body.stock) || 0,
        weight: body.weight ? Number(body.weight) : 200,

        image: body.image || null,

        thumbnail: body.thumbnail || body.image || null,

        productType: body.productType || "weight",

        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,

        productvariant: {
          create: (body.variants || []).map((v: any) => ({
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
    console.error(error);

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
