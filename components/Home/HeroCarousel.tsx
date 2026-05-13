"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import Image from "next/image";

const slides = [
  {
    id: 1,
    title: "AUTHENTIC TASTE",
    desc: "Traditional handmade papads with premium spices.",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: 2,
    title: "PURE INGREDIENTS",
    desc: "No preservatives. Just the goodness of organic lentils.",
    img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cHJvZHVjdHN8ZW58MHx8MHx8fDA%3D",
  },
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const textRef = useRef(null);

  useEffect(() => {
    // GSAP Entrance Animation
    const ctx = gsap.context(() => {
      gsap.from(".char", {
        opacity: 0,
        y: 20,
        stagger: 0.05,
        duration: 0.8,
        ease: "power4.out",
      });
    }, textRef);

    const timer = setInterval(() => {
      setIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);

    return () => {
      clearInterval(timer);
      ctx.revert();
    };
  }, [index]);

  return (
    <div className="relative h-[450px] md:h-[600px] max-w-full overflow-hidden rounded-[2rem] shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="relative h-full w-full"
        >
          <Image
            src={slides[index].img}
            alt="Carousel"
            fill
            className="object-cover brightness-75 transition-transform duration-[10s] scale-110"
          />

          <div
            ref={textRef}
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-black/20"
          >
            <h1 className="text-5xl md:text-8xl font-serif text-white tracking-tighter flex overflow-hidden">
              {slides[index].title.split("").map((char, i) => (
                <span key={i} className="char inline-block">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </h1>
            <p className="mt-4 text-lg md:text-xl text-zinc-200 max-w-lg font-light tracking-wide uppercase italic">
              {slides[index].desc}
            </p>
            <button className="mt-10 px-10 py-4 bg-white text-black font-bold text-[10px] tracking-[0.3em] uppercase rounded-full hover:bg-zinc-200 transition-colors">
              Explore Collection
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
