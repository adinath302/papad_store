import cloudinary from "@/lib/cloudinary";
import { validateCsrfToken } from "@/lib/csrf";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const MAX_FILE_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

async function requireAdmin() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.role !== "ADMIN") return null;
  return user;
}

async function uploadBuffer(buffer: Buffer, mime: string) {
  const dataUri = `data:${mime};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "papad_store",
  });
  return result.secure_url;
}

export async function POST(req: Request) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return Response.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const user = await requireAdmin();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const files = [
        ...formData.getAll("files"),
        ...formData.getAll("file"),
      ].filter((item): item is File => item instanceof File && item.size > 0);

      if (files.length === 0) {
        return Response.json({ error: "No files provided" }, { status: 400 });
      }

      const urls: string[] = [];
      for (const file of files) {
        if (!ALLOWED_TYPES.has(file.type) && !file.type.startsWith("image/")) {
          return Response.json({ error: "Please select an image file" }, { status: 400 });
        }
        if (file.size > MAX_FILE_BYTES) {
          return Response.json({ error: "Image must be under 8MB" }, { status: 400 });
        }
        const buffer = Buffer.from(await file.arrayBuffer());
        urls.push(await uploadBuffer(buffer, file.type || "image/jpeg"));
      }

      return Response.json({
        image: urls[0],
        images: urls,
      });
    }

    const body = await req.json();
    const { image } = body;
    if (!image) {
      return Response.json({ error: "Image missing" }, { status: 400 });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: "papad_store",
    });

    return Response.json({ image: result.secure_url });
  } catch (error: any) {
    console.error(error);
    return Response.json(
      { error: error.message || "Upload failed" },
      { status: 500 },
    );
  }
}
