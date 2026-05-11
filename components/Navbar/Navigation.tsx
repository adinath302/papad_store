import Link from "next/link";

const Navigation = () => {
  // Using an array to map over links keeps the code clean and easy to maintain
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Products", path: "/products" },
    // { name: "Cart", path: "/cart" },
    // { name: "Orders", path: "/orders" },
  ];

  return (
    <nav className="flex items-center gap-8">
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.path}
          className="text-xs font-semibold tracking-widest uppercase transition-colors duration-300 text-zinc-800 hover:text-red-400"
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;
