import { prisma } from "@/lib/prisma";
import HeroCarousel from "@/components/Home/HeroCarousel";
import PapadExplorer from "@/components/Home/PapadExplorer";
import HeritageSection from "@/components/Home/HeritageSection";
import Footer from "@/components/Footer/Footer";

export default async function Home() {
  const products = (await prisma.product.findMany()) || [];

  return (
    <main className="relative w-full bg-[#fdfdfd] overflow-x-hidden">
      {/* 1. Hero Section */}
      <section className="pt-24 px-4 max-w-7xl mx-auto">
        <HeroCarousel />
      </section>

      {/* 2. Transition Label */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
        <p className="text-amber-600 font-bold tracking-[0.4em] uppercase text-[9px] mb-2">
          Our Craft
        </p>
        <h2 className="text-4xl md:text-6xl font-serif text-zinc-900 tracking-tight">
          The Explorer
        </h2>
      </div>

      {/* 3. Sticky Horizontal Explorer */}
      <PapadExplorer />

      {/* Heritage section */}
      <HeritageSection />

      {/* 4. Product List Section */}
      <section className="relative z-10 bg-white pt-24 pb-32">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div className="space-y-2">
              <h2 className="text-4xl md:text-5xl font-serif text-zinc-900 tracking-tighter">
                Shop the Kitchen
              </h2>
              <p className="text-zinc-400 font-light text-lg">
                Directly from our traditional sun-drying floors.
              </p>
            </div>
            <div className="h-px flex-1 bg-zinc-100 mx-8 hidden md:block" />
            <button className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-zinc-900 transition-colors">
              View All Products &rarr;
            </button>
          </div>

          {/* Product Grid logic remains here */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              {/* Reuse the product card mapping from previous step */}
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-50 rounded-[3rem] border border-dashed">
              <p className="text-zinc-400 italic">
                No products currently available.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      {/* <Footer/> */}
    </main>
  );
}
