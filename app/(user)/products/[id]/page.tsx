import { prisma } from "@/lib/prisma";
import ProductDetails from "@/components/Products/ProductDetails";
export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id,
    },
    include: {
      productvariant: true,
    },
  });

  if (!product) {
    return <div className="p-10">Product not foundc</div>;
  }

  return <ProductDetails product={product} />;
}
