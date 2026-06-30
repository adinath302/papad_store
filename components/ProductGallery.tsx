"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryImage = {
  id: string;
  url: string;
  alt: string | null;
};

export default function ProductGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="relative aspect-square bg-stone-100 rounded-2xl border border-stone-200 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1599481238640-4c1288750d7a?q=80&w=800"
          alt={title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="relative aspect-square bg-stone-100 rounded-2xl border border-stone-200 overflow-hidden">
        <Image
          src={images[0].url}
          alt={images[0].alt || title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-stone-100 rounded-2xl border border-stone-200 overflow-hidden">
        <Image
          src={images[selectedIndex].url}
          alt={images[selectedIndex].alt || title}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {images.map((img, index) => (
          <button
            key={img.id}
            onClick={() => setSelectedIndex(index)}
            className={`shrink-0 size-16 rounded-xl border-2 overflow-hidden transition-all ${
              index === selectedIndex
                ? "border-emerald-700 ring-1 ring-emerald-700/30"
                : "border-stone-200 hover:border-stone-400"
            }`}
          >
            <div className="relative size-full bg-stone-100">
              <Image
                src={img.url}
                alt={img.alt || `${title} ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
