import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Profile",
  description: "Manage your account, addresses, and order history.",
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
