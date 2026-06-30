import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shopping Cart",
  description: "Review your cart and proceed to checkout. Handcrafted papads and traditional Indian snacks.",
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
