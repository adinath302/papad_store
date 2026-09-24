import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/Toast/ToastProvider";
import Analytics from "@/components/Analytics";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://papadcompany.com";

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
    "Shivshambho",
  ],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Shivshambho — crafted with tradition",
    description:
      "Handcrafted papads, kurdai, and traditional Indian snacks since 1984. Free shipping across India.",
    type: "website",
    locale: "en_IN",
    siteName: "Shivshambho",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shivshambho — crafted with tradition",
    description:
      "Handcrafted papads, kurdai, and traditional Indian snacks since 1984.",
  },
  robots: {
    index: true,
    follow: true,
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
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#065f46" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Papad Store" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Shivshambho",
              url: baseUrl,
              logo: `${baseUrl}/logo.png`,
              description:
                "Handcrafted papads, kurdai, and traditional Indian snacks. Authentic recipes since 1984.",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91-7822901803",
                contactType: "customer service",
                availableLanguage: ["English", "Marathi"],
              },
              sameAs: [`${baseUrl}/contact`],
            }),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <ServiceWorkerRegistration />
        <Analytics />
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
