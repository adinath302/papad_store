import { prisma } from "@/lib/prisma";

const page = async () => {
  const products = await prisma.product.findMany();

  return (
    <>
      <div>Product List</div>

      <ul className="grid grid-cols-3 gap-4">
        {products.map((item: { name: string; price: number }) => (
          <li key={item.name}>
            <h2>{item.name}</h2>
            <p>{item.price}</p>
          </li>
        ))}
      </ul>
    </>
  );
};

export default page;
