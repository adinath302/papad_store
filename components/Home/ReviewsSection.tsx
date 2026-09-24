"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";
import type { FeaturedReview } from "@/lib/featured-reviews";

type Review = FeaturedReview;

function formatDate(dateStr: string | null) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function ReviewsSection({
  reviews = [],
}: {
  reviews?: Review[];
}) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const count = reviews.length;

  useEffect(() => {
    if (!count || isPaused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused, count]);

  if (!count) return null;

  const prev = () =>
    setIndex((i) => (i === 0 ? reviews.length - 1 : i - 1));
  const next = () =>
    setIndex((i) => (i === reviews.length - 1 ? 0 : i + 1));

  const review = reviews[index];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <p className="text-emerald-800 text-[10px] font-bold tracking-[0.35em] uppercase mb-2">
            Testimonials
          </p>
          <h2 className="text-3xl md:text-4xl font-serif text-stone-900 tracking-tight">
            What Our Customers Say
          </h2>
        </div>

        <div
          className="relative max-w-3xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="bg-[#faf8f5] rounded-3xl border border-stone-200/80 p-8 md:p-12 text-center shadow-sm">
            <Quote
              size={32}
              className="text-amber-400 mx-auto mb-6 opacity-80"
              strokeWidth={1.5}
            />

            <p className="text-stone-700 text-base md:text-lg leading-relaxed mb-8 min-h-[4.5rem]">
              &ldquo;{review.comment}&rdquo;
            </p>

            <div className="flex justify-center gap-0.5 mb-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < review.rating
                      ? "text-amber-500 fill-amber-500"
                      : "text-stone-300"
                  }
                />
              ))}
            </div>

            <p className="font-semibold text-stone-900">{review.name}</p>
            <p className="text-xs text-stone-500 mt-1">
              {review.product.name
                ? `Verified Buyer · ${review.product.name}`
                : "Verified Buyer"}
              {review.createdAt && ` · ${formatDate(review.createdAt)}`}
            </p>
          </div>

          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={prev}
              aria-label="Previous review"
              className="p-2.5 rounded-full border border-stone-200 text-stone-600 hover:bg-emerald-800 hover:text-white hover:border-emerald-800 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to review ${i + 1}`}
                  className={`h-2 rounded-full transition-all ${
                    i === index
                      ? "w-6 bg-emerald-800"
                      : "w-2 bg-stone-300 hover:bg-stone-400"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="Next review"
              className="p-2.5 rounded-full border border-stone-200 text-stone-600 hover:bg-emerald-800 hover:text-white hover:border-emerald-800 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
