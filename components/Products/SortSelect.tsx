"use client";

import { useRouter } from "next/navigation";

export default function SortSelect({
  currentSort = "featured",
  search,
  category,
  inStock,
}: {
  currentSort?: string;
  search?: string;
  category?: string;
  inStock?: boolean;
}) {
  const router = useRouter();

  const handleChange = (value: string) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (inStock) params.set("inStock", "true");
    if (value && value !== "featured") params.set("sort", value);
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  return (
    <select
      value={currentSort}
      onChange={(e) => handleChange(e.target.value)}
      className="text-sm font-medium bg-transparent outline-none cursor-pointer text-zinc-900"
    >
      <option value="featured">Sort by: Featured</option>
      <option value="price_asc">Price: Low to High</option>
      <option value="price_desc">Price: High to Low</option>
    </select>
  );
}
