import { prisma } from "@/lib/prisma";
import ProductList from "@/components/Products/ProductList";
import FilterSidebar from "@/components/Products/FilterSidebar";
import SearchBar from "@/components/Products/SearchBar";

export default async function ProductPage() {
  const products = await prisma.product.findMany({ // Fetch all products with their variants
    include: {
      variants: true,
    },
  });

  return (
    <main className="min-h-screen bg-[#fdfdfd] pt-24 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Top Utility Bar */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-serif text-zinc-900">
              Our Collection
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              Showing all authentic varieties
            </p>
          </div>
          <div className="w-full md:w-96">
            <SearchBar />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <FilterSidebar />
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-100">
              <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">
                {products.length} Products Found
              </span>
              <select className="text-sm font-medium bg-transparent outline-none cursor-pointer text-zinc-900">
                <option>Sort by: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating</option>
              </select>
            </div>

            <ProductList products={products} />
          </div>
        </div>
      </div>
    </main>
  );
}
