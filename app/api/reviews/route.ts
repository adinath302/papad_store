import { NextResponse } from "next/server";
import { validateCsrfToken } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    if (!productId) {
      return NextResponse.json({ error: "Missing productId" }, { status: 400 });
    }
    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    const avg = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: true,
    });
    return NextResponse.json({ reviews, avgRating: avg._avg.rating || 0, total: avg._count });
  } catch (error: any) {
    console.error("REVIEWS GET ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const csrfToken = req.headers.get("x-csrf-token");
    if (!(await validateCsrfToken(csrfToken))) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
    }

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (userId) {
      const { allowed } = await checkRateLimit(`review:${userId}`, 5, 60_000);
      if (!allowed) {
        return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
      }
    }

    const body = await req.json();
    const { productId, rating, comment, name, email } = body;
    if (!productId || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }
    const review = await prisma.review.create({
      data: {
        productId,
        userId: userId || null,
        name: name || "Anonymous",
        email: email || null,
        rating,
        comment,
      },
    });
    return NextResponse.json(review);
  } catch (error: any) {
    console.error("REVIEW ERROR:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
