"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSiteImages } from "@/lib/useSiteImages";

const SLIDE_DATA = [
  {
    id: 1,
    title: "Authentic Taste",
    subtitle: "Handcrafted Papads",
    desc: "Traditional sun-dried papads with premium spices — straight from our kitchen to yours.",
    imgKey: "hero_slide_1",
    cta: "Shop Papads",
    href: "/products",
  },
  {
    id: 2,
    title: "Pure Ingredients",
    subtitle: "No Shortcuts",
    desc: "No preservatives. Just the goodness of organic lentils and time-honored recipes.",
    imgKey: "hero_slide_2",
    cta: "Explore Range",
    href: "/products",
  },
  {
    id: 3,
    title: "Festive Combos",
    subtitle: "Gift-Ready Boxes",
    desc: "Curated assortments perfect for celebrations, gifting, and family gatherings.",
    imgKey: "hero_slide_3",
    cta: "View Combos",
    href: "/products",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const { getImage } = useSiteImages();

  const slides = SLIDE_DATA.map((s) => ({ ...s, img: getImage(s.imgKey) }));

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev === SLIDE_DATA.length - 1 ? 0 : prev + 1));
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  const current = slides[index];

  return (
    <div className="relative h-[100vh] w-screen overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.img}
            alt={slide.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover brightness-[0.55]"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-900/50 to-transparent" />

      <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-20 max-w-2xl">
        <p className="text-amber-400 text-[10px] md:text-xs font-bold tracking-[0.35em] uppercase mb-3">
          {current.subtitle}
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white tracking-tight leading-[1.05] mb-4">
          {current.title}
        </h1>

        <p className="text-stone-200 text-sm md:text-base font-light leading-relaxed max-w-md mb-8">
          {current.desc}
        </p>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href={current.href}
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-xs tracking-[0.2em] uppercase rounded-full transition-colors"
          >
            {current.cta}
          </Link>
          <Link
            href="/products"
            className="px-8 py-3.5 border border-white/40 text-white font-bold text-xs tracking-[0.2em] uppercase rounded-full hover:bg-white/10 transition-colors"
          >
            Learn More
          </Link>
        </div>
      </div>

      <div className="absolute bottom-6 left-8 md:left-16 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-8 bg-amber-400" : "w-3 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
