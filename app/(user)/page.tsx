import { prisma } from "@/lib/prisma";
import HeroCarousel from "@/components/Home/HeroCarousel";
import PromoBar from "@/components/Home/PromoBar";
import TrustMarquee from "@/components/Home/TrustMarquee";
import CategoryGrid from "@/components/Home/CategoryGrid";
import CombosSection from "@/components/Home/CombosSection";
import HeritageSection from "@/components/Home/HeritageSection";
import ReviewsSection from "@/components/Home/ReviewsSection";
import FAQSection from "@/components/Home/FAQSection";
import ProductCard from "@/components/Products/ProductCard";
import Link from "next/link";

export default async function Home() {
  const products = (await prisma.product.findMany({ include: { productvariant: true } })) || [];

  return (
    <main className="relative w-full bg-[#faf8f5] overflow-x-hidden">
      {/* Promo announcement strip */}
      <div className="pt-[72px] md:pt-[80px]">
        <PromoBar />
      </div>

      {/* Hero (fullscreen) */}
      <section className="w-full">
        <HeroCarousel />
      </section>

      {/* Scrolling trust badges */}
      <TrustMarquee />

      {/* Category shortcuts */}
      <CategoryGrid />

      {/* Heritage & story */}
      <HeritageSection />

      {/* Bestsellers from DB */}
      <section className="relative z-10 bg-white py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-14 gap-4">
            <div>
              <p className="text-emerald-800 text-[10px] font-bold tracking-[0.35em] uppercase mb-2">
                Customer Favorites
              </p>
              <h2 className="text-3xl md:text-4xl font-serif text-stone-900 tracking-tight">
                Bestsellers
              </h2>
              <p className="text-stone-500 mt-2 text-sm md:text-base">
                Directly from our traditional sun-drying floors.
              </p>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800 hover:text-amber-600 transition-colors shrink-0"
            >
              View All Products →
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-[#faf8f5] rounded-3xl border border-dashed border-stone-300">
              <p className="text-stone-500 italic">
                No products currently available.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Combos */}
      <CombosSection />

      {/* Reviews */}
      <ReviewsSection />

      {/* FAQ */}
      <FAQSection />
    </main>
  );
}
