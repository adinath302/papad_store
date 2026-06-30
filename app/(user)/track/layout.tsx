import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track Order",
  description: "Track your order status by order ID or phone number.",
};

export default function TrackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
