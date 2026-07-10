"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useSiteImages } from "@/lib/useSiteImages";

const COMBO_DATA = [
  { id: 1, name: "Family Feast Combo", tag: "Best Value", price: 449, original: 699, imgKey: "combo_family" },
  { id: 2, name: "Starter Taster Pack", tag: "New", price: 199, original: 299, imgKey: "combo_starter" },
  { id: 3, name: "Festive Celebration Box", tag: "Limited", price: 599, original: 899, imgKey: "combo_festive" },
  { id: 4, name: "Spice Lover's Bundle", tag: "Popular", price: 349, original: 520, imgKey: "combo_spice" },
];

export default function CombosSection() {
  const { getImage } = useSiteImages();
  const combos = COMBO_DATA.map((c) => ({ ...c, img: getImage(c.imgKey) }));

  return (
    <section className="py-16 md:py-24 bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 md:mb-14">
          <div>
            <p className="text-emerald-800 text-[10px] font-bold tracking-[0.35em] uppercase mb-2">
              Curated for You
            </p>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-900 tracking-tight">
              Ready-to-Buy Combos
            </h2>
            <p className="text-stone-500 mt-2 text-sm md:text-base max-w-md">
              Hand-picked assortments for gifting, festivals, and everyday meals.
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800 hover:text-amber-600 transition-colors shrink-0"
          >
            View All Combos →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {combos.map((combo) => {
            const discount = Math.round(
              ((combo.original - combo.price) / combo.original) * 100,
            );

            return (
              <div
                key={combo.id}
                className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="relative aspect-square bg-stone-100">
                  <Image
                    src={combo.img}
                    alt={combo.name}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {combo.tag}
                  </span>
                  <span className="absolute top-3 right-3 bg-emerald-800 text-white text-[10px] font-bold px-2 py-1 rounded-md">
                    -{discount}%
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-stone-900 leading-snug">
                    {combo.name}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-stone-900">
                      ₹{combo.price}
                    </span>
                    <span className="text-sm text-stone-400 line-through">
                      ₹{combo.original}
                    </span>
                  </div>
                  <Link
                    href="/products"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 transition-colors"
                  >
                    <ShoppingBag size={14} />
                    Shop Combo
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
