import { NextResponse } from "next/server";
import { getFeaturedReviews } from "@/lib/featured-reviews";

export async function GET() {
  const reviews = await getFeaturedReviews();
  return NextResponse.json(
    { reviews },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
