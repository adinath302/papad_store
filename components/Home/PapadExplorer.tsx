"use client";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import PixelCard from "./PixelCard";

const categories = [
  {
    id: 1,
    title: "Moong Special",
    img: "https://images.unsplash.com/photo-1589113817223-14db18136244?q=80&w=800",
  },
  {
    id: 2,
    title: "Masala Punch",
    img: "https://images.unsplash.com/photo-1599481238640-4c1288750d7a?q=80&w=800",
  },
  {
    id: 3,
    title: "Garlic Infusion",
    img: "https://images.unsplash.com/photo-1614707267537-b85acc00c4b7?q=80&w=800",
  },
  {
    id: 4,
    title: "Udad Traditional",
    img: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=800",
  },
];

export default function PapadExplorer() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef });

  // Desktop horizontal move: Locks vertical and moves X
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-65%"]);

  return (
    <section ref={targetRef} className="relative md:h-[300vh] bg-[#fdfdfd]">
      <div className="md:sticky md:top-0 md:h-screen flex flex-col md:flex-row items-center overflow-hidden py-20 md:py-0">
        {/* Background Decorative Text - Now in Light Mode */}
        <div className="absolute top-10 md:top-20 left-6 md:left-20 z-0">
          <h2 className="text-zinc-900/[0.03] text-7xl md:text-[15rem] font-serif font-black leading-none pointer-events-none select-none">
            HANDMADE
          </h2>
        </div>

        {/* The rest of the mapping logic remains the same, just ensure 
        the PixelCard gradient is also lightened if needed */}

        {/* Horizontal Container */}
        {/* On mobile, we use standard overflow-x-auto. On desktop, we use motion.div with x transform */}
        <div className="md:hidden flex overflow-x-auto w-full gap-6 px-6 no-scrollbar pb-10 z-10">
          {categories.map((cat) => (
            <PixelCard key={cat.id} title={cat.title} img={cat.img} />
          ))}
        </div>

        <motion.div
          style={{
            x: typeof window !== "undefined" && window.innerWidth > 768 ? x : 0,
          }}
          className="hidden md:flex gap-12 px-20 z-10"
        >
          {categories.map((cat) => (
            <PixelCard key={cat.id} title={cat.title} img={cat.img} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
