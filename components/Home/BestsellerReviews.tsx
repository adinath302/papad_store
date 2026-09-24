import { Star } from "lucide-react";
import type { FeaturedReview } from "@/lib/featured-reviews";

export default function BestsellerReviews({
  reviews,
}: {
  reviews: FeaturedReview[];
}) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <div className="mt-10 md:mt-14">
      <p className="text-emerald-800 text-[10px] font-bold tracking-[0.35em] uppercase mb-4 text-center">
        Featured Reviews
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="bg-[#faf8f5] rounded-2xl border border-stone-200/80 p-5 md:p-6 text-center shadow-sm"
          >
            <div className="flex justify-center gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, j) => (
                <Star
                  key={j}
                  size={12}
                  className={
                    j < review.rating
                      ? "text-amber-500 fill-amber-500"
                      : "text-stone-300"
                  }
                />
              ))}
            </div>
            <p className="text-sm text-stone-600 leading-relaxed mb-3 line-clamp-3">
              &ldquo;{review.comment}&rdquo;
            </p>
            <p className="font-semibold text-stone-900 text-sm">
              {review.name}
            </p>
            {review.product?.name && (
              <p className="text-xs text-stone-500 mt-0.5">
                on {review.product.name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
