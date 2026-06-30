"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type RecentlyViewedItem = {
  id: string;
  name: string;
  image: string | null;
  price: number;
};

const STORAGE_KEY = "papad_recently_viewed";

export default function RecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    const isLoggedIn = document.cookie.includes("isLoggedIn=true");

    if (isLoggedIn) {
      fetch("/api/recently-viewed")
        .then((res) => res.json())
        .then((data) => {
          const mapped = data.map((item: any) => {
            const prices = item.product.productvariant?.map(
              (v: any) => v.price,
            );
            return {
              id: item.product.id,
              name: item.product.name,
              image: item.product.image || null,
              price: prices?.length ? Math.min(...prices) : 0,
            };
          });
          setItems(mapped);
        })
        .catch(() => {});
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          setItems(JSON.parse(raw));
        }
      } catch {}
    }
  }, []);

  if (items.length < 2) return null;

  return (
    <section className="mt-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-800 mb-1">
            Your History
          </p>
          <h2 className="text-2xl font-serif text-stone-900">
            Recently Viewed
          </h2>
        </div>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.id}`}
            className="group flex-shrink-0 w-48 bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
          >
            <div className="relative aspect-square bg-stone-100">
              <Image
                src={
                  item.image ||
                  "https://images.unsplash.com/photo-1599481238640-4c1288750d7a?q=80&w=800"
                }
                alt={item.name}
                fill
                loading="lazy"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold text-stone-900 line-clamp-1">
                {item.name}
              </h3>
              <p className="text-base font-bold text-stone-900 mt-1">
                ₹{item.price}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
