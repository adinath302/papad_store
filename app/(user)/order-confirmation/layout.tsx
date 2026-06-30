import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your order has been placed successfully. Thank you for shopping at Shivshambho!",
};

export default function OrderConfirmationLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
