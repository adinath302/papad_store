"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const CATEGORIES = [
  { value: "weight", label: "By Weight" },
  { value: "pieces", label: "By Pieces" },
];

export default function FilterSidebar({
  selectedCategory,
  inStock,
}: {
  selectedCategory?: string;
  inStock?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="bg-white p-5 md:p-6 rounded-xl border border-stone-200 shadow-sm space-y-8 sticky top-28">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-zinc-900">
          Availability
        </h3>
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-zinc-600 group-hover:text-zinc-900 transition-colors">
            In stock only
          </span>
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) =>
              updateParam("inStock", e.target.checked ? "true" : null)
            }
            className="w-4 h-4 accent-amber-600"
          />
        </label>
      </div>

      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider mb-4 text-zinc-900">
          Category
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="radio"
              name="category"
              checked={!selectedCategory}
              onChange={() => updateParam("category", null)}
              className="w-4 h-4 accent-amber-600"
            />
            <span className="text-zinc-600 group-hover:text-zinc-900 transition-colors">
              All
            </span>
          </label>
          {CATEGORIES.map((cat) => (
            <label
              key={cat.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="radio"
                name="category"
                checked={selectedCategory === cat.value}
                onChange={() => updateParam("category", cat.value)}
                className="w-4 h-4 accent-amber-600"
              />
              <span className="text-zinc-600 group-hover:text-zinc-900 transition-colors">
                {cat.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
