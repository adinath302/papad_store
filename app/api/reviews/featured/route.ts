import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const fallbackReviews = [
  {
    name: "Priya Sharma",
    rating: 5,
    comment:
      "The moong papads are exactly like my grandmother used to make. Crispy, fresh, and perfectly spiced. Will definitely order again!",
  },
  {
    name: "Rajesh Kumar",
    rating: 5,
    comment:
      "Excellent packaging — not a single papad was broken. Delivery was quick and the masala variant is our new family favorite.",
  },
  {
    name: "Ananya Patel",
    rating: 5,
    comment:
      "Authentic taste that takes me back to Rajasthan. The garlic papads are incredible with evening chai. Highly recommended!",
  },
  {
    name: "Suresh Menon",
    rating: 4,
    comment:
      "Ordered the festive combo for Diwali — guests loved it. Quality is consistent and prices are very fair for handmade products.",
  },
];

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { rating: { gte: 4 } },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        name: true,
        rating: true,
        comment: true,
        createdAt: true,
        product: { select: { name: true } },
      },
    });

    const data = reviews.map((r) => ({
      id: r.id,
      name: r.name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      product: { name: r.product.name },
    }));

    if (data.length < 4) {
      const needed = 4 - data.length;
      const padding = fallbackReviews.slice(0, needed).map((f, i) => ({
        id: `fallback-${i}`,
        name: f.name,
        rating: f.rating,
        comment: f.comment,
        createdAt: new Date(0).toISOString(),
        product: { name: "" },
      }));
      data.push(...padding);
    }

    return NextResponse.json({ reviews: data });
  } catch (error) {
    console.error("FEATURED REVIEWS ERROR:", error);
    const fallback = fallbackReviews.map((f, i) => ({
      id: `fallback-${i}`,
      name: f.name,
      rating: f.rating,
      comment: f.comment,
      createdAt: new Date(0).toISOString(),
      product: { name: "" },
    }));
    return NextResponse.json({ reviews: fallback });
  }
}
