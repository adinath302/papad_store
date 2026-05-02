import { prisma } from "@/lib/prisma";
import ProductList from "@/components/ProductList";

const Page = async () => {
  const products = await prisma.product.findMany();

  return (
    <div>
      <h1>Products</h1>
      <ProductList products={products} />
    </div>
  );
};

export default Page;
