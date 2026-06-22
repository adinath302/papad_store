"use client";

import { usePathname } from "next/navigation";
import "../globals.css";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  return (
    <div className="h-full antialiased">
      {!isAuthPage && <Navbar />}
      <div className="min-h-full flex flex-col">{children}</div>
      {!isAuthPage && <Footer />}
    </div>
  );
}
