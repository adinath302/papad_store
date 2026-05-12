"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function PixelCard({ title, img }: { title: string; img: string }) {
  const containerRef = useRef(null);
  
  // Track scroll specifically for this card to handle the pixel reveal
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"],
  });

  // Effect: Starts blurry/pixelated and clears up
  const blurValue = useTransform(scrollYProgress, [0, 1], ["12px", "0px"]);
  const scaleValue = useTransform(scrollYProgress, [0, 1], [0.8, 1]);
  const opacityValue = useTransform(scrollYProgress, [0, 0.5], [0, 1]);

  return (
    <motion.div
      ref={containerRef}
      style={{ 
        opacity: opacityValue,
        scale: scaleValue 
      }}
      className="relative flex-shrink-0 w-[85vw] md:w-[450px] aspect-[4/5] rounded-[2.5rem] overflow-hidden group shadow-2xl bg-zinc-800"
    >
      <motion.div 
        style={{ filter: `blur(${blurValue})` }}
        className="relative h-full w-full transition-all duration-300 ease-out"
      >
        <Image
          src={img}
          alt={title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700"
        />
      </motion.div>
      
      {/* Content Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
        <motion.span 
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          className="text-amber-500 font-black text-[10px] tracking-[0.4em] uppercase mb-2"
        >
          Signature Type
        </motion.span>
        <h3 className="text-3xl md:text-4xl font-serif text-white leading-tight">{title}</h3>
      </div>
    </motion.div>
  );
}