import { prisma } from "@/lib/prisma";
import Link from "next/link";
import ProductDetails from "@/components/Products/ProductDetails";

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { productvariant: true },
  });

  if (!product) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center pt-24">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-stone-900 mb-2">
            Product not found
          </h1>
          <Link
            href="/products"
            className="text-emerald-700 hover:underline text-sm"
          >
            Browse all products →
          </Link>
        </div>
      </div>
    );
  }

  const allProducts = await prisma.product.findMany({
    where: { id: { not: id } },
    include: { productvariant: true },
    take: 8,
  });

  return (
    <ProductDetails product={product} relatedProducts={allProducts} />
  );
}
