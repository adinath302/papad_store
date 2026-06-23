"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Zap, Truck, Sparkles, Heart } from "lucide-react";

const promos = [
  { text: "Enjoy ₹50 OFF on your first order — Code: WELCOME50", icon: Zap },
  { text: "FREE shipping on orders above ₹499", icon: Truck },
  { text: "Handmade & sun-dried — authentic taste since 1984", icon: Sparkles },
  { text: "Trusted by 10,000+ happy customers across India", icon: Heart },
];

const STORAGE_KEY = "papad_promo_dismissed";

export default function PromoBar() {
  const [dismissed, setDismissed] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setDismissed(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % promos.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [dismissed]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    localStorage.setItem(STORAGE_KEY, "true");
  }, []);

  if (dismissed) return null;

  const { text, icon: Icon } = promos[current];

  return (
    <div className="relative bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-400/20">
            <Icon size={12} className="text-amber-400" />
          </span>
          <span
            key={current}
            className="animate-fade-in text-[11px] font-medium tracking-wide text-stone-300"
          >
            {text}
          </span>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-stone-500 hover:bg-white/10 hover:text-stone-300 transition-colors"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
