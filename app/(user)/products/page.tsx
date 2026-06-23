import { prisma } from "@/lib/prisma";
import ProductList from "@/components/Products/ProductList";
import FilterSidebar from "@/components/Products/FilterSidebar";
import SearchBar from "@/components/Products/SearchBar";
import SortSelect from "@/components/Products/SortSelect";

export default async function ProductPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const search =
    typeof params.search === "string" ? params.search.trim() : "";
  const category =
    typeof params.category === "string" ? params.category.trim() : "";
  const sort =
    typeof params.sort === "string" ? params.sort.trim() : "featured";
  const inStock = params.inStock === "true";

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { nameMarathi: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.productType = category;
  }

  if (inStock) {
    where.stock = { gt: 0 };
  }

  const products = await prisma.product.findMany({
    where,
    include: { productvariant: true },
  });

  if (sort === "price_asc") {
    products.sort(
      (a, b) =>
        Math.min(...a.productvariant.map((v) => v.price)) -
        Math.min(...b.productvariant.map((v) => v.price)),
    );
  } else if (sort === "price_desc") {
    products.sort(
      (a, b) =>
        Math.min(...b.productvariant.map((v) => v.price)) -
        Math.min(...a.productvariant.map((v) => v.price)),
    );
  }

  return (
    <main className="min-h-screen bg-[#fdfdfd] pt-24 pb-20">
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-serif text-zinc-900">
              Our Collection
            </h1>
            <p className="text-zinc-500 text-sm mt-1">
              {search
                ? `Results for "${search}"`
                : "Showing all authentic varieties"}
            </p>
          </div>
          <div className="w-full md:w-96">
            <SearchBar initialSearch={search} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="w-full lg:w-64 shrink-0">
            <FilterSidebar
              selectedCategory={category}
              inStock={inStock}
            />
          </aside>

          <div className="flex-1">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-100">
              <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">
                {products.length} Products Found
              </span>
              <SortSelect currentSort={sort} />
            </div>

            <ProductList products={products} />
          </div>
        </div>
      </div>
    </main>
  );
}
