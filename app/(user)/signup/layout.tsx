import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Create your Shivshambho account for faster checkout and order tracking.",
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
