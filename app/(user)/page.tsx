import { prisma } from "@/lib/prisma";
import HeroCarousel from "@/components/Home/HeroCarousel";
import { motion } from "framer-motion";
import Image from "next/image";

export default async function Home() {
  // Fetch products with a fallback to empty array
  const products = (await prisma.product.findMany()) || [];

  return (
    <main className="w-full pt-28 pb-20 bg-zinc-50/50">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        
        {/* 1. Carousel Section */}
        <HeroCarousel />

        {/* 2. Heading Section */}
        <div className="mt-24 flex flex-col items-center text-center space-y-4">
          <h2 className="text-4xl md:text-5xl font-serif text-zinc-900">The Papad Gallery</h2>
          <div className="h-1 w-20 bg-amber-500 rounded-full" />
          <p className="text-zinc-500 max-w-md">Discover our range of sun-dried, traditional delicacies.</p>
        </div>

        {/* 3. Product Grid */}
        <div className="mt-16">
          {products.length > 0 ? (
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="group relative bg-white p-4 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  <div className="aspect-square w-full rounded-[1.5rem] bg-zinc-100 overflow-hidden relative">
                    <Image
                      src="https://images.unsplash.com/photo-1601050633647-8f8f2f3ee04e?q=80&w=800"
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                  
                  <div className="mt-6 px-2 pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-zinc-900">{p.name}</h3>
                        <p className="text-sm text-zinc-400 mt-1">Stock: {p.stock} units</p>
                      </div>
                      <p className="text-xl font-serif font-black text-amber-600">₹{p.price}</p>
                    </div>
                    
                    <button className="w-full mt-6 py-4 bg-zinc-900 text-white rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-amber-600 transition-colors">
                      Quick Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border-2 border-dashed border-zinc-200 rounded-[3rem]">
              <p className="text-zinc-400 font-serif italic">No products found in the kitchen yet.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}