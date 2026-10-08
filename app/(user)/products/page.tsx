import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import ProductList from "@/components/Products/ProductList";
import FilterSidebar from "@/components/Products/FilterSidebar";
import SearchBar from "@/components/Products/SearchBar";
import SortSelect from "@/components/Products/SortSelect";

export const revalidate = 60;

const PER_PAGE = 12;

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
  const page = Math.max(1, parseInt(typeof params.page === "string" ? params.page : "1") || 1);

  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { nameMarathi: { contains: search } },
      { description: { contains: search } },
    ];
  }

  if (category) {
    where.productType = category;
  }

  if (inStock) {
    where.stock = { gt: 0 };
  }

  let products: any[] = [];
  let totalCount = 0;
  try {
    [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { productvariant: true },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
      }),
      prisma.product.count({ where }),
    ]);
  } catch {}

  const minPrice = (item: any) => {
    const prices = (item.productvariant || [])
      .map((v: any) => Number(v.price))
      .filter((n: number) => Number.isFinite(n));
    return prices.length ? Math.min(...prices) : 0;
  };

  if (sort === "price_asc") {
    products.sort((a: any, b: any) => minPrice(a) - minPrice(b));
  } else if (sort === "price_desc") {
    products.sort((a: any, b: any) => minPrice(b) - minPrice(a));
  }

  return (
    <main className="min-h-screen bg-[#fdfdfd] pt-24 pb-20">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl font-serif text-zinc-900">
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

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <aside className="w-full lg:w-64 shrink-0">
            <Suspense fallback={<div className="h-40 bg-white rounded-xl border border-stone-200" />}>
              <FilterSidebar
                selectedCategory={category}
                inStock={inStock}
              />
            </Suspense>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-zinc-100 gap-3">
              <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">
                {totalCount} Product{totalCount !== 1 ? "s" : ""} Found
              </span>
              <Suspense fallback={null}>
                <SortSelect currentSort={sort} />
              </Suspense>
            </div>

            <Suspense fallback={<div className="h-64 bg-white rounded-xl border border-stone-200" />}>
              <ProductList
              products={JSON.parse(JSON.stringify(products))}
              totalCount={totalCount}
              currentPage={page}
              perPage={PER_PAGE}
            />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
