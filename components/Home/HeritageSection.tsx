"use client";

import { motion } from "framer-motion";
import { Truck, Award, Leaf, ShieldCheck, Sun, HandHeart, Package } from "lucide-react";
import Image from "next/image";
import { useSiteImages } from "@/lib/useSiteImages";

const pillars = [
  {
    icon: Truck,
    title: "Pan-India Delivery",
    sub: "Fresh flavors delivered to your doorstep.",
  },
  {
    icon: Award,
    title: "Since 1984",
    sub: "Three generations of papad-making craft.",
  },
  {
    icon: Leaf,
    title: "Natural Ingredients",
    sub: "Premium lentils, spices — nothing artificial.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Sealed",
    sub: "Moisture-lock packaging for lasting crunch.",
  },
];

const processSteps = [
  {
    no: "01",
    icon: HandHeart,
    title: "Hand-Selected Ingredients",
    desc: "We source premium lentils and spices from trusted local farmers who share our commitment to purity.",
  },
  {
    no: "02",
    icon: Sun,
    title: "Sun-Drying Tradition",
    desc: "Each papad is cured naturally under the golden sun — preserving authentic crunch without artificial heat.",
  },
  {
    no: "03",
    icon: Package,
    title: "Careful Packaging",
    desc: "Every batch is quality-checked and sealed fresh, so you receive papads as crisp as the day they were made.",
  },
];

export default function HeritageSection() {
  const { getImage } = useSiteImages();
  return (
    <section className="py-10 md:py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Trust pillars - mobile: auto-scroll marquee */}
        <div className="md:hidden -mx-4 px-4 overflow-hidden mb-8">
          <div className="animate-heritage-scroll flex gap-3 w-max pb-2">
            {[...pillars, ...pillars].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-emerald-50/80 rounded-2xl px-4 py-3 min-w-[220px] border border-emerald-100/60"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                  <item.icon size={18} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-stone-900">
                    {item.title}
                  </h4>
                  <p className="text-[10px] text-stone-500 leading-tight truncate">
                    {item.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust pillars - desktop: grid */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-20 md:mb-28">
          {pillars.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08, ease: "easeOut" }}
              className="flex flex-col items-center text-center p-4 rounded-2xl hover:bg-[#faf8f5] transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-800 mb-4">
                <item.icon size={22} strokeWidth={1.5} />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 mb-1.5">
                {item.title}
              </h4>
              <p className="text-stone-500 text-xs leading-relaxed max-w-[180px]">
                {item.sub}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Story intro */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20 md:mb-28">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <p className="text-emerald-800 text-[10px] font-bold tracking-[0.35em] uppercase mb-3">
              Our Heritage
            </p>
            <h2 className="text-3xl md:text-5xl font-serif text-stone-900 leading-tight tracking-tight mb-6">
              The art of{" "}
              <span className="italic text-amber-600">patient craft</span>
            </h2>
            <p className="text-stone-600 leading-relaxed mb-4">
              In a world of mass production, we believe in the luxury of time.
              Our papads are shaped by hand, seasoned with recipes passed down
              through generations, and dried under the open sky — just as they
              have been for over four decades.
            </p>
            <p className="text-stone-500 leading-relaxed text-sm">
              From our sun-drying floors in Rajasthan to your kitchen table,
              every step honors the natural rhythm of traditional Indian
              food-making.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-lg"
          >
            <Image
              src={getImage("heritage")}
              alt="Traditional papad making"
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-white/90 text-sm font-light italic">
                &ldquo;Preserving taste, one sun-dried batch at a time.&rdquo;
              </p>
            </div>
          </motion.div>
        </div>

        {/* Process steps */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {processSteps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, duration: 0.6 }}
              className="relative bg-[#faf8f5] rounded-2xl p-6 md:p-8 border border-stone-200/60"
            >
              <span className="text-5xl font-serif text-stone-200 absolute top-4 right-6 select-none">
                {step.no}
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center mb-5">
                <step.icon size={20} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">
                {step.title}
              </h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
