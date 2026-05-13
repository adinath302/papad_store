"use client";
import PixelCard from "./PixelCard";

const categories = [
  { id: 1, title: "Moong Special", img: "https://images.unsplash.com/photo-1589113817223-14db18136244?q=80&w=800" },
  { id: 2, title: "Masala Punch", img: "https://images.unsplash.com/photo-1599481238640-4c1288750d7a?q=80&w=800" },
  { id: 3, title: "Garlic Infusion", img: "https://images.unsplash.com/photo-1614707267537-b85acc00c4b7?q=80&w=800" },
  { id: 4, title: "Udad Traditional", img: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=800" },
];

export default function PapadExplorer() {
  // We double the categories to create a seamless infinite loop
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