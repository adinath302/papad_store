"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { isLoggedIn } from "@/lib/guest-cart";
import { getGuestWishlist } from "@/lib/guest-wishlist";

export default function ProductList({ products }: any) {
  const [wishlistedIds, setWishlistedIds] = useState<Set<string>>(new Set());

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

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
      {products.map((item: any) => (
        <li key={item.id}>
          <ProductCard product={item} wishlisted={wishlistedIds.has(item.id)} />
        </li>
      ))}
    </ul>
  );
}
