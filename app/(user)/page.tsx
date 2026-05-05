import { prisma } from "@/lib/prisma";

const Home = async () => {
  const products = await prisma.product.findMany();
  return (
    <>
      <div>All Products</div>
      <div className="grid grid-cols-3 gap-3">
        {products.map((p: any) => (
          <div key={p.id}>
            <h3>{p.name}</h3>
            <p>Price: ₹{p.price}</p>
            <p>Stock: {p.stock}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default Home;
