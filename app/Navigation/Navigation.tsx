import Link from "next/link";

const Navigation = () => {
  return (
    <nav className="flex justify-end gap-4 mx-5 mt-4">
      <Link href="/" className="hover:text-blue-600 font-semibold">
        Home
      </Link>
      <Link href="/products" className="hover:text-blue-600 font-semibold">
        Products
      </Link>
      <Link href="/cart" className="hover:text-blue-600 font-semibold">
        Cart
      </Link>
      <Link href="/orders" className="hover:text-blue-600 font-semibold">
        Orders
      </Link>
    </nav>
  );
};

export default Navigation;
