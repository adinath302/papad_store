"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProductCard from "./ProductCard";
import { isLoggedIn } from "@/lib/guest-cart";
import { getGuestWishlist } from "@/lib/guest-wishlist";

export default function ProductList({
  products,
  totalCount,
  currentPage,
  perPage,
  search,
  category,
  sort,
  inStock,
}: {
  products: any[];
  totalCount: number;
  currentPage: number;
  perPage: number;
  search?: string;
  category?: string;
  sort?: string;
  inStock?: boolean;
}) {
  const router = useRouter();
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const totalPages = Math.ceil(totalCount / perPage);

  useEffect(() => {
    let cancelled = false;
    if (isLoggedIn()) {
      fetch("/api/wishlist")
        .then((r) => r.json())
        .then((items) => {
          if (!cancelled && Array.isArray(items)) {
            setWishlistedIds(items.map((i: any) => i.productId).filter(Boolean));
          }
        })
        .catch(() => {});
    } else {
      const ids = getGuestWishlist();
      queueMicrotask(() => {
        if (!cancelled) setWishlistedIds(ids);
      });
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const goToPage = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    if (sort && sort !== "featured") params.set("sort", sort);
    if (inStock) params.set("inStock", "true");
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  const wishlisted = new Set(wishlistedIds);

  return (
    <div>
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-stone-200">
          <p className="text-stone-500 text-sm">No products found.</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-8 md:gap-y-16">
          {products.map((item: any) => (
            <li key={item.id}>
              <ProductCard product={item} wishlisted={wishlisted.has(item.id)} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-16">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .map((p, idx, arr) => (
              <span key={p} className="flex items-center">
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="px-1 text-stone-300">...</span>
                )}
                <button
                  onClick={() => goToPage(p)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                    p === currentPage
                      ? "bg-stone-900 text-white"
                      : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-50"
                  }`}
                >
                  {p}
                </button>
              </span>
            ))}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
