import { Leaf, ShieldCheck, Truck, Award } from "lucide-react";

const badges = [
  { icon: Truck, text: "Ships Across India" },
  { icon: Leaf, text: "100% Natural Ingredients" },
  { icon: Award, text: "Traditional Recipes" },
  { icon: ShieldCheck, text: "Quality Sealed Packaging" },
];

export default function TrustMarquee() {
  const items = [...badges, ...badges, ...badges];

  return (
    <section className="border-y border-stone-200/80 bg-[#faf8f5] py-4 overflow-hidden">
      <div className="flex animate-trust-scroll">
        {items.map(({ icon: Icon, text }, i) => (
          <div
            key={`${text}-${i}`}
            className="flex shrink-0 items-center gap-2.5 px-10 text-stone-700"
          >
            <Icon size={16} className="text-emerald-700" strokeWidth={1.75} />
            <span className="text-xs font-semibold tracking-wide uppercase">
              {text}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
