"use client";

const promos = [
  "Enjoy ₹50 OFF on your first order — Code: WELCOME50",
  "FREE shipping on orders above ₹499",
  "Handmade & sun-dried — authentic taste since 1984",
  "Trusted by 10,000+ happy customers across India",
];

export default function PromoBar() {
  const items = [...promos, ...promos];

  return (
    <div className="relative overflow-hidden bg-emerald-900 text-emerald-50 border-b border-emerald-800">
      <div className="flex animate-promo-scroll whitespace-nowrap py-2.5">
        {items.map((text, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-3 px-8 text-[11px] font-semibold tracking-wide uppercase"
          >
            <span className="h-1 w-1 rounded-full bg-amber-400 shrink-0" />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
