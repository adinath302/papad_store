import { prisma } from "@/lib/prisma";
import ProductList from "@/components/Products/ProductList";

const Page = async () => {
  const products = await prisma.product.findMany();

  return (
    <main className="min-h-screen bg-[#fdfdfd] pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header Section */}
        <header className="mb-16 border-b border-zinc-100 pb-12">
          <span className="text-amber-600 font-bold tracking-[0.3em] uppercase text-xs">Our Collection</span>
          <h1 className="text-5xl md:text-6xl font-serif text-zinc-900 mt-4">The Finest Papads</h1>
          <p className="text-zinc-500 mt-4 max-w-xl text-lg">
            Sourced from traditional recipes and sun-dried to maintain the authentic crunch and flavor.
          </p>
        </header>

        {/* Product Grid */}
        <ProductList products={products} />
      </div>
    </main>
  );
};

export default Page;