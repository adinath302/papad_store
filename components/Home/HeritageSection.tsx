"use client";

import { motion } from "framer-motion";
import { Truck, Award, Leaf, ShieldCheck } from "lucide-react";

const pillars = [
  {
    icon: <Truck strokeWidth={1} />,
    title: "Quick Delivery",
    sub: "Fresh flavors, right on time.",
  },
  {
    icon: <Award strokeWidth={1} />,
    title: "Authentic Taste",
    sub: "Traditional recipes, true to roots.",
  },
  {
    icon: <Leaf strokeWidth={1} />,
    title: "Wide Range",
    sub: "Pickles, spices, snacks & more.",
  },
  {
    icon: <ShieldCheck strokeWidth={1} />,
    title: "Quality-Made",
    sub: "Clean, safe, and consistent.",
  },
];

const processSteps = [
  {
    no: "01",
    title: "Sourcing Excellence",
    desc: "We hand-select premium lentils and spices from local farmers who share our commitment to purity and traditional farming.",
  },
  {
    no: "02",
    title: "The Sun-Drying Ritual",
    desc: "Our papads are cured naturally under the golden sun, preserving the authentic crunch and nutrition without artificial heat.",
  },
  {
    no: "03",
    title: "Precision Packaging",
    desc: "Every batch undergoes rigorous quality checks before being sealed in our signature moisture-lock minimalist packaging.",
  },
];

export default function HeritageSection() {
  return (
    <section className="py-32 bg-[#fdfdfd] max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* 1. Minimalist Pillars (Black/Zinc) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-48">
          {pillars.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1, ease: "easeOut" }}
              className="flex flex-col items-center text-center"
            >
              <div className="text-zinc-900 mb-6 scale-125">{item.icon}</div>
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-900 mb-2">
                {item.title}
              </h4>
              <p className="text-zinc-400 text-[11px] font-light max-w-[160px] leading-relaxed">
                {item.sub}
              </p>
            </motion.div>
          ))}
        </div>

        {/* 2. Centered Story Intro */}
        {/* <div className="text-center max-w-2xl mx-auto mb-40">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-6xl font-serif text-zinc-900 leading-tight tracking-tight">
              The art of <br />
              <span className="italic text-zinc-400 font-light">patient craft.</span>
            </h2>
            <div className="h-10 w-px bg-zinc-200 mx-auto my-8" />
            <p className="text-zinc-500 text-lg font-light leading-relaxed">
              In a world of mass production, we believe in the luxury of time. 
              Our process respects the natural rhythm of the seasons.
            </p>
          </motion.div>
        </div> */}

        {/* 3. Centered Vertical Process Steps */}
        {/* <div className="space-y-48 flex flex-col items-center">
          {processSteps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-100px", once: true }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center text-center max-w-xl"
            >
              <span className="text-[8rem] md:text-[12rem] font-serif text-zinc-100 leading-none block select-none mb-[-2rem]">
                {step.no}
              </span>
              
              <div className="relative z-10 space-y-4">
                <h3 className="text-3xl font-serif text-zinc-900">{step.title}</h3>
                <p className="text-zinc-500 font-light leading-relaxed text-base">
                  {step.desc}
                </p>
              </div>

              <div className="mt-12 w-full aspect-[16/9] bg-zinc-50 rounded-[2.5rem] border border-zinc-100 overflow-hidden flex items-center justify-center">
                <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-300 italic">
                  Visual Representation {step.no}
                </span>
              </div>

              {idx !== processSteps.length - 1 && (
                <div className="h-24 w-px bg-gradient-to-b from-zinc-200 to-transparent mt-24" />
              )}
            </motion.div>
          ))}
        </div> */}
      </div>
    </section>
  );
}
