"use client";
import { motion } from "motion/react";
import Image from "next/image";

export default function PixelCard({ title, img }: { title: string; img: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="relative w-full aspect-[4/5] rounded-[2.5rem] overflow-hidden group shadow-xl bg-zinc-800"
    >
      <Image
        src={img}
        alt={title}
        fill
        loading="lazy"
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
        <span className="text-amber-500 font-black text-[10px] tracking-[0.4em] uppercase mb-2">
          Signature Type
        </span>
        <h3 className="text-2xl md:text-3xl font-serif text-white">{title}</h3>
      </div>
    </motion.div>
  );
}