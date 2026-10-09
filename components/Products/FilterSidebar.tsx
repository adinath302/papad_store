"use client";

import { useRouter } from "next/navigation";

const CATEGORIES = [
  { value: "weight", label: "By Weight" },
  { value: "pieces", label: "By Pieces" },
];

function buildQuery(opts: {
  search?: string;
  category?: string;
  sort?: string;
  inStock?: boolean;
}) {
  const params = new URLSearchParams();
  if (opts.search) params.set("search", opts.search);
  if (opts.category) params.set("category", opts.category);
  if (opts.sort && opts.sort !== "featured") params.set("sort", opts.sort);
  if (opts.inStock) params.set("inStock", "true");
  return params.toString();
}

export default function FilterSidebar({
  selectedCategory,
  inStock,
  search,
  sort,
}: {
  selectedCategory?: string;
  inStock?: boolean;
  search?: string;
  sort?: string;
}) {
  const router = useRouter();

  const go = (next: { category?: string; inStock?: boolean }) => {
    const qs = buildQuery({
      search,
      sort,
      category: next.category,
      inStock: next.inStock,
    });
    router.push(qs ? `/products?${qs}` : "/products");
  };

  return (
    <div className="bg-white p-5 md:p-6 rounded-xl border border-stone-200 shadow-sm space-y-8 lg:sticky lg:top-28">
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
            checked={!!inStock}
            onChange={(e) =>
              go({ category: selectedCategory || undefined, inStock: e.target.checked })
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
              onChange={() => go({ inStock })}
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
                onChange={() => go({ category: cat.value, inStock })}
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
