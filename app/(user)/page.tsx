async function getProducts() {
  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-cache",
  });
  return res.json();
}

const Home = async () => {
  const products = await getProducts();
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
