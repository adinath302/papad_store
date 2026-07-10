"use client";
import PixelCard from "./PixelCard";
import { useSiteImages } from "@/lib/useSiteImages";

const CATEGORY_DATA = [
  { id: 1, title: "Moong Special", imgKey: "explorer_moong" },
  { id: 2, title: "Masala Punch", imgKey: "explorer_masala" },
  { id: 3, title: "Garlic Infusion", imgKey: "explorer_garlic" },
  { id: 4, title: "Udad Traditional", imgKey: "explorer_urad" },
];

export default function PapadExplorer() {
  const { getImage } = useSiteImages();
  const categories = CATEGORY_DATA.map((c) => ({ ...c, img: getImage(c.imgKey) }));
  const displayCategories = [...categories, ...categories];

  return (
    <section className="relative py-24 bg-[#fdfdfd] overflow-hidden">
      {/* Background Heading (Centered & Static) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <h2 className="text-zinc-900/[0.03] text-[20vw] font-serif font-black uppercase select-none">
          Varieties
        </h2>
      </div>

      <div className="relative flex overflow-hidden">
        {/* The Marquee Container */}
        <div className="flex gap-12 animate-marquee py-10 px-6">
          {displayCategories.map((cat, index) => (
            <div key={`${cat.id}-${index}`} className="flex-shrink-0 w-[300px] md:w-[450px]">
              <PixelCard title={cat.title} img={cat.img} />
            </div>
          ))}
        </div>
      </div>

      {/* Tailwind CSS for the animation logic */}
      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        /* Pause animation on hover for better UX */
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
