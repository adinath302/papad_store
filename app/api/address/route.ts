import { NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(addresses);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch addresses" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const body = await req.json();
    const { fullName, phone, address1, address2, city, state, pincode, saveAddress } = body;

    if (!fullName || !phone || !address1 || !city || !state || !pincode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    let saved;

    if (saveAddress) {
      const existing = await prisma.address.findFirst({
        where: { userId, saveAddress: true },
      });

      if (existing) {
        saved = await prisma.address.update({
          where: { id: existing.id },
          data: { fullName, phone, address1, address2, city, state, pincode },
        });
      } else {
        saved = await prisma.address.create({
          data: {
            userId,
            fullName,
            phone,
            address1,
            address2: address2 || null,
            city,
            state,
            pincode,
            saveAddress: true,
          },
        });
      }
    }

    return NextResponse.json(saved || null);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to save address" },
      { status: 500 },
    );
  }
}
