"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    id: 1,
    title: "Authentic Taste",
    subtitle: "Handcrafted Papads",
    desc: "Traditional sun-dried papads with premium spices — straight from our kitchen to yours.",
    img: "https://images.unsplash.com/photo-1599481238640-4c1288750d7a?q=80&w=1200",
    cta: "Shop Papads",
    href: "/products",
  },
  {
    id: 2,
    title: "Pure Ingredients",
    subtitle: "No Shortcuts",
    desc: "No preservatives. Just the goodness of organic lentils and time-honored recipes.",
    img: "https://images.unsplash.com/photo-1589113817223-14db18136244?q=80&w=1200",
    cta: "Explore Range",
    href: "/products",
  },
  {
    id: 3,
    title: "Festive Combos",
    subtitle: "Gift-Ready Boxes",
    desc: "Curated assortments perfect for celebrations, gifting, and family gatherings.",
    img: "https://images.unsplash.com/photo-1548943487-a2e4ef43b3f6?q=80&w=1200",
    cta: "View Combos",
    href: "/products",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[100vh] w-screen overflow-hidden">
      <style>{`
        .hero-char {
          display: inline-block;
          animation: heroFadeUp 0.7s ease-out both;
          animation-delay: calc(var(--char-index) * 0.04s);
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="relative h-full w-full"
        >
          <Image
            src={slides[index].img}
            alt={slides[index].title}
            fill
            priority
            sizes="100vw"
            className="object-cover brightness-[0.55]"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-900/50 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 lg:px-20 max-w-2xl">
            <p className="text-amber-400 text-[10px] md:text-xs font-bold tracking-[0.35em] uppercase mb-3">
              {slides[index].subtitle}
            </p>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif text-white tracking-tight leading-[1.05] mb-4">
              {(() => {
                let charIdx = 0;
                return slides[index].title.split(" ").map((word, wi) => (
                  <span key={wi} className="block overflow-hidden">
                    {word.split("").map((char, i) => {
                      const delay = charIdx++;
                      return (
                        <span
                          key={i}
                          className="hero-char inline-block"
                          style={{ "--char-index": delay } as React.CSSProperties}
                        >
                          {char}
                        </span>
                      );
                    })}
                  </span>
                ));
              })()}
            </h1>

            <p className="text-stone-200 text-sm md:text-base font-light leading-relaxed max-w-md mb-8">
              {slides[index].desc}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={slides[index].href}
                className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold text-xs tracking-[0.2em] uppercase rounded-full transition-colors"
              >
                {slides[index].cta}
              </Link>
              <Link
                href="/products"
                className="px-8 py-3.5 border border-white/40 text-white font-bold text-xs tracking-[0.2em] uppercase rounded-full hover:bg-white/10 transition-colors"
              >
                Learn More
              </Link>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide indicators */}
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
