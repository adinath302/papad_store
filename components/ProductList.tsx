import ProductCard from "./ProductCard";

export default function ProductList({ products }: any) {
  return (
    <ul className="grid grid-cols-3 gap-4">
      {products.map((item: any) => (
        <ProductCard key={item.id} product={item} />
      ))}
    </ul>
  );
}
