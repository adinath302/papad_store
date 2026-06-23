import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast/ToastProvider";
import Analytics from "@/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Shivshambho — crafted with tradition",
    template: "%s | Shivshambho",
  },
  description:
    "Shivshambho — crafted with tradition. Handcrafted papads, kurdai, and traditional Indian snacks. Authentic recipes since 1984. Free shipping across India.",
  keywords: [
    "papad",
    "kurdai",
    "Indian snacks",
    "traditional papad",
    "moong papad",
    "masala papad",
    "homemade snacks",
  ],
  openGraph: {
    title: "Shivshambho — crafted with tradition",
      description:
        "Shivshambho — crafted with tradition. Handcrafted papads, kurdai, and traditional Indian snacks since 1984.",
    type: "website",
    locale: "en_IN",
    siteName: "Shivshambho",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Analytics />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
