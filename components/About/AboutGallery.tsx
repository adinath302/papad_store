"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSiteImages } from "@/lib/useSiteImages";

const GALLERY_KEYS = [
  "about_gallery_1",
  "about_gallery_2",
  "about_gallery_3",
  "about_gallery_4",
  "about_gallery_5",
  "about_gallery_6",
];

export default function AboutGallery() {
  const { getImage } = useSiteImages();
  const [index, setIndex] = useState(0);
  const slides = GALLERY_KEYS.map((key) => ({ key, src: getImage(key) }));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 4500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="pb-16 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm">
          {slides.map((slide, i) => (
            <div
              key={slide.key}
              className={`absolute inset-0 transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <Image
                src={slide.src}
                alt="Shivshambho craft"
                fill
                priority={i === 0}
                sizes="(max-width: 768px) 100vw, 1024px"
                className="object-cover"
              />
            </div>
          ))}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to gallery image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-8 bg-amber-400"
                    : "w-3 bg-white/70 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
