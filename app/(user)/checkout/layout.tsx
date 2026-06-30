import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order. Secure checkout for papads, kurdai, and traditional Indian snacks.",
};

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
