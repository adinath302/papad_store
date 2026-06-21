"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "What makes your papads different from store-bought ones?",
    a: "Our papads are handmade using traditional recipes, sun-dried naturally, and made with premium lentils and spices — no artificial preservatives or shortcuts.",
  },
  {
    q: "How should I store papads after opening?",
    a: "Keep them in an airtight container in a cool, dry place. Avoid moisture to maintain their signature crunch for weeks.",
  },
  {
    q: "Do you ship across India?",
    a: "Yes! We ship pan-India via trusted courier partners. Metro cities typically receive orders in 3–5 days; other locations may take 5–10 business days.",
  },
  {
    q: "Is there a minimum order value?",
    a: "There is no minimum order. Orders above ₹499 qualify for free shipping across India.",
  },
  {
    q: "How do I roast or fry the papads?",
    a: "You can roast them directly on a flame for a smoky flavor, microwave for 30–40 seconds, or deep-fry for extra crispiness. Each pack includes simple preparation tips.",
  },
  {
    q: "Can I place bulk or wholesale orders?",
    a: "Absolutely. For restaurants, caterers, or large events, reach out via our contact page or email hello@papadcompany.com for custom pricing.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-16 md:py-24 bg-[#faf8f5]">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-emerald-800 text-[10px] font-bold tracking-[0.35em] uppercase mb-2">
            Got Questions?
          </p>
          <h2 className="text-3xl md:text-4xl font-serif text-stone-900 tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;

            return (
              <div
                key={i}
                className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 p-5 md:p-6 text-left"
                >
                  <span className="font-semibold text-stone-900 text-sm md:text-base leading-snug">
                    {faq.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-emerald-800 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 md:px-6 pb-5 md:pb-6 text-stone-600 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
