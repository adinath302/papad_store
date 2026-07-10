"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { CartCountProvider } from "@/lib/cart-context";

const Navbar = dynamic(() => import("@/components/Navbar/Navbar"), {
  loading: () => (
    <div className="h-[80px] w-full animate-pulse bg-stone-100" />
  ),
});

const Footer = dynamic(() => import("@/components/Footer/Footer"));

const CartSidebar = dynamic(
  () => import("@/components/Cart/CartSidebar"),
);

export default function ClientLayoutShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <CartCountProvider>
      <div className="h-full antialiased">
        {!isAuthPage && <Navbar onCartToggle={() => setIsCartOpen(true)} />}
        <div className="min-h-full flex flex-col">{children}</div>
        {!isAuthPage && <Footer />}
        <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </div>
    </CartCountProvider>
  );
}
