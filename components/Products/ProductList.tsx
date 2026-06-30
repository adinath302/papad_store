"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductCard from "./ProductCard";
import { isLoggedIn } from "@/lib/guest-cart";
import { getGuestWishlist } from "@/lib/guest-wishlist";

export default function ProductList({
  products,
  totalCount,
  currentPage,
  perPage,
}: {
  products: any[];
  totalCount: number;
  currentPage: number;
  perPage: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());
  const totalPages = Math.ceil(totalCount / perPage);

  useEffect(() => {
    if (isLoggedIn()) {
      fetch("/api/wishlist")
        .then((r) => r.json())
        .then((items) => {
          setWishlistedIds(new Set(items.map((i: any) => i.productId)));
        })
        .catch(() => {});
    } else {
      setWishlistedIds(new Set(getGuestWishlist()));
    }
  }, []);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
        {products.map((item: any) => (
          <li key={item.id}>
            <ProductCard product={item} wishlisted={wishlistedIds.has(item.id)} />
          </li>
        ))}
      </ul>

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
