import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and track your orders. Handcrafted papads and traditional Indian snacks.",
};

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
