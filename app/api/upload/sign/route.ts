import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { validateCsrfToken } from "@/lib/csrf";

export const runtime = "nodejs";

const FOLDER = "papad_store";

export async function POST(req: Request) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary is not configured on this environment" },
        { status: 500 },
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const toSign = `folder=${FOLDER}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(toSign).digest("hex");

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder: FOLDER,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Could not sign upload" },
      { status: 500 },
    );
  }
}
