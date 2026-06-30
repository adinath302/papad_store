import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Panel | Papad Store",
  description: "Admin dashboard for managing products and orders",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-screen bg-[#faf8f5] antialiased">{children}</div>;
}
