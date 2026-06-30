import cloudinary from "@/lib/cloudinary";
import { validateCsrfToken } from "@/lib/csrf";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return Response.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "ADMIN") {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const { image } = body;

    if (!image) {
      return Response.json(
        { error: "Image missing" },
        { status: 400 }
      );
    }

    const result = await cloudinary.uploader.upload(
      image,
      {
        folder: "papad_store",
      }
    );

    return Response.json({
      image: result.secure_url,
    });

  } catch (error: any) {
    console.error(error);

    return Response.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}