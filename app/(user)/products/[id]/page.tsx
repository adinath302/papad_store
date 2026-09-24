import { prisma } from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import ProductDetails from "@/components/Products/ProductDetails";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  let product: any = null;
  try {
    product = await prisma.product.findUnique({
      where: { id },
      select: {
        name: true,
        description: true,
        image: true,
        productvariant: { select: { price: true }, take: 1 },
      },
    });
  } catch {
    // Database may be unavailable during build
  }

  if (!product) {
    return { title: "Product Not Found" };
  }

  return {
    title: product.name,
    description: product.description || `${product.name} - Traditional Papad`,
    alternates: {
      canonical: `/products/${id}`,
    },
    openGraph: {
      title: product.name,
      description: product.description || `${product.name} - Traditional Papad`,
      ...(product.image ? { images: [{ url: product.image }] } : {}),
    },
  };
}

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product: any = null;
  try {
    product = await prisma.product.findUnique({
      where: { id },
      include: {
        productvariant: true,
        productimage: { orderBy: { sortOrder: "asc" } },
      },
    });
  } catch {
    // Database may be unavailable during build
  }

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

  let allProducts: any[] = [];
  try {
    allProducts = await prisma.product.findMany({
      where: { id: { not: id } },
      include: { productvariant: true },
      take: 8,
    });
  } catch {
    // Database may be unavailable during build
  }

  const firstVariant = product.productvariant?.[0];
  const price = firstVariant?.price ?? 0;
  const inStock = (product.stock ?? 0) > 0;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || "",
    image: product.image || undefined,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: "INR",
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  const jsonLdString = JSON.stringify(jsonLd);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdString }}
      />
      <ProductDetails product={product} relatedProducts={allProducts} />
    </>
  );
}
