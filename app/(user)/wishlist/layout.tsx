import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "Your saved products — handcrafted papads and traditional Indian snacks.",
};

export default function WishlistLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
