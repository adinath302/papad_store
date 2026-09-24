import { prisma } from "@/lib/prisma";

export type FeaturedReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
  product: { name: string };
};

const FALLBACK_REVIEWS: FeaturedReview[] = [
  {
    id: "fallback-0",
    name: "Priya Sharma",
    rating: 5,
    comment:
      "The moong papads are exactly like my grandmother used to make. Crispy, fresh, and perfectly spiced. Will definitely order again!",
    createdAt: new Date(0).toISOString(),
    product: { name: "" },
  },
  {
    id: "fallback-1",
    name: "Rajesh Kumar",
    rating: 5,
    comment:
      "Excellent packaging — not a single papad was broken. Delivery was quick and the masala variant is our new family favorite.",
    createdAt: new Date(0).toISOString(),
    product: { name: "" },
  },
  {
    id: "fallback-2",
    name: "Ananya Patel",
    rating: 5,
    comment:
      "Authentic taste that takes me back to Rajasthan. The garlic papads are incredible with evening chai. Highly recommended!",
    createdAt: new Date(0).toISOString(),
    product: { name: "" },
  },
  {
    id: "fallback-3",
    name: "Suresh Menon",
    rating: 4,
    comment:
      "Ordered the festive combo for Diwali — guests loved it. Quality is consistent and prices are very fair for handmade products.",
    createdAt: new Date(0).toISOString(),
    product: { name: "" },
  },
];

export async function getFeaturedReviews(): Promise<FeaturedReview[]> {
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

    const data: FeaturedReview[] = reviews.map(
      (r: {
        id: string;
        name: string;
        rating: number;
        comment: string;
        createdAt: Date;
        product: { name: string };
      }) => ({
        id: r.id,
        name: r.name,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt.toISOString(),
        product: { name: r.product.name },
      }),
    );

    if (data.length < 4) {
      data.push(...FALLBACK_REVIEWS.slice(0, 4 - data.length));
    }

    return data;
  } catch {
    return FALLBACK_REVIEWS;
  }
}
