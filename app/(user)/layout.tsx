"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import "../globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import CartSidebar from "@/components/Cart/CartSidebar";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="h-full antialiased">
      {!isAuthPage && <Navbar onCartToggle={() => setIsCartOpen(true)} />}
      <div className="min-h-full flex flex-col">{children}</div>
      {!isAuthPage && <Footer />}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
