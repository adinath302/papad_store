import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { cookies } from "next/headers";

async function requireAdmin(req: NextRequest): Promise<boolean> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return false;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.role === "ADMIN";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "productId query param is required" }, { status: 400 });
    }
    const images = await prisma.productimage.findMany({
      where: { productId },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(images);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const productId = formData.get("productId") as string;
    const files = formData.getAll("files") as File[];

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const maxSortOrder = await prisma.productimage.aggregate({
      where: { productId },
      _max: { sortOrder: true },
    });
    let nextSortOrder = (maxSortOrder._max.sortOrder ?? -1) + 1;

    const createdImages = [];
    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const base64 = buffer.toString("base64");
      const dataUri = `data:${file.type};base64,${base64}`;

      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "papad_store",
      });

      const image = await prisma.productimage.create({
        data: {
          productId,
          url: result.secure_url,
          sortOrder: nextSortOrder++,
        },
      });
      createdImages.push(image);
    }

    return NextResponse.json(createdImages);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { images } = body;

    if (!Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: "images array is required" }, { status: 400 });
    }

    await prisma.$transaction(
      images.map((img: { id: string; sortOrder: number }) =>
        prisma.productimage.update({
          where: { id: img.id },
          data: { sortOrder: img.sortOrder },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    if (!(await requireAdmin(req))) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id query param is required" }, { status: 400 });
    }

    const image = await prisma.productimage.findUnique({ where: { id } });
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    try {
      const urlParts = image.url.split("/");
      const publicIdWithExt = urlParts[urlParts.length - 1];
      const publicId = `papad_store/${publicIdWithExt.split(".")[0]}`;
      await cloudinary.uploader.destroy(publicId);
    } catch (cloudinaryError) {
      console.error("Cloudinary delete failed:", cloudinaryError);
    }

    await prisma.productimage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
