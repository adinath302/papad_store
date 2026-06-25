import "../globals.css";
import ClientLayoutShell from "@/components/ClientLayoutShell";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <ClientLayoutShell>{children}</ClientLayoutShell>;
}
