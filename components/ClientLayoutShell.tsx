"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer/Footer";

const Navbar = dynamic(() => import("@/components/Navbar/Navbar"), {
  loading: () => (
    <div className="h-[72px] w-full animate-pulse bg-stone-100" />
  ),
});

export default function ClientLayoutShell({
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
