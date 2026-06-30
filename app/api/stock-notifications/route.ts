import { NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const { email, productId } = await req.json();

    if (email) {
      const { allowed } = await checkRateLimit(`stock-notif:${email}`, 10, 60_000);
      if (!allowed) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
      }
    }

    if (!email || !productId) {
      return NextResponse.json(
        { error: "Email and product ID required" },
        { status: 400 },
      );
    }

    const existing = await prisma.stocknotification.findFirst({
      where: { email, productId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You are already subscribed for this product" },
        { status: 409 },
      );
    }

    await prisma.stocknotification.create({
      data: { email, productId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 },
    );
  }
}
