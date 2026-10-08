"use client";

import { useEffect, useMemo, useState } from "react";
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

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i];
    next[i] = next[j];
    next[j] = current;
  }
  return next;
}

export default function AboutGallery() {
  const { getImage } = useSiteImages();
  const [order, setOrder] = useState(GALLERY_KEYS);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setOrder((prev) => shuffle(prev));
      setTick((n) => n + 1);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  const slides = useMemo(
    () =>
      order.map((key) => ({
        key,
        src: getImage(key),
      })),
    [order, getImage],
  );

  return (
    <section className="pb-16 px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-4">
          {slides.map((slide, index) => (
            <div
              key={`${slide.key}-${tick}`}
              className="relative aspect-[4/3] rounded-xl md:rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 animate-about-shuffle"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <Image
                src={slide.src}
                alt="Shivshambho craft"
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
