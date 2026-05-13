import ProductCard from "./ProductCard";

export default function ProductList({ products }: any) {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
      {products.map((item: any) => (
        <li key={item.id}>
          <ProductCard product={item} />
        </li>
      ))}
    </ul>
  );
}