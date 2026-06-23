import Image from "next/image";
import Link from "next/link";

const categories = [
  {
    title: "Moong Special",
    slug: "moong",
    img: "https://images.unsplash.com/photo-1589113817223-14db18136244?q=80&w=600",
  },
  {
    title: "Masala Punch",
    slug: "masala",
    img: "https://images.unsplash.com/photo-1599481238640-4c1288750d7a?q=80&w=600",
  },
  {
    title: "Garlic Infusion",
    slug: "garlic",
    img: "https://images.unsplash.com/photo-1614707267537-b85acc00c4b7?q=80&w=600",
  },
  {
    title: "Urad Traditional",
    slug: "urad",
    img: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?q=80&w=600",
  },
  {
    title: "Pickles & Chutney",
    slug: "pickles",
    img: "https://images.unsplash.com/photo-1604908177525-4512a0f82278?q=80&w=600",
  },
  {
    title: "Spice Blends",
    slug: "spices",
    img: "https://images.unsplash.com/photo-1596040033229-a0b517a9c9a8?q=80&w=600",
  },
  {
    title: "Festival Combos",
    slug: "combos",
    img: "https://images.unsplash.com/photo-1548943487-a2e4ef43b3f6?q=80&w=600",
  },
  {
    title: "Snack Crunchies",
    slug: "snacks",
    img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?q=80&w=600",
  },
];

export default function CategoryGrid() {
  return (
    <section className="py-10 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-6 md:mb-14">
          <p className="text-emerald-800 text-[10px] font-bold tracking-[0.35em] uppercase mb-2">
            Shop by Category
          </p>
          <h2 className="text-xl md:text-4xl font-serif text-stone-900 tracking-tight">
            Explore Our Range
          </h2>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="md:hidden -mx-4 px-4 overflow-x-auto scrollbar-none">
          <div className="flex gap-3 w-max pb-2">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.slug}
                href="/products"
                className="group flex flex-col items-center gap-2 p-2 rounded-2xl hover:bg-[#faf8f5] transition-colors min-w-[80px]"
              >
                <div className="relative w-16 h-16 rounded-full overflow-hidden ring-2 ring-stone-100 group-hover:ring-amber-300 transition-all shadow-sm">
                  <Image
                    src={cat.img}
                    alt={cat.title}
                    fill
                    loading="lazy"
                    sizes="80px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <span className="text-[10px] font-semibold text-stone-700 text-center leading-tight group-hover:text-emerald-800 transition-colors line-clamp-2 max-w-[72px]">
                  {cat.title}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href="/products"
              className="group flex flex-col items-center gap-3 p-3 rounded-2xl hover:bg-[#faf8f5] transition-colors"
            >
              <div className="relative w-full aspect-square rounded-full overflow-hidden ring-2 ring-stone-100 group-hover:ring-amber-300 transition-all shadow-sm">
                <Image
                  src={cat.img}
                  alt={cat.title}
                  fill
                  loading="lazy"
                  sizes="12.5vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <span className="text-xs font-semibold text-stone-700 text-center leading-snug group-hover:text-emerald-800 transition-colors">
                {cat.title}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
