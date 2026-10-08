import type { NextConfig } from "next";

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://api.razorpay.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://res.cloudinary.com",
  "font-src 'self'",
  "connect-src 'self' https://res.cloudinary.com https://api.razorpay.com https://kjiqyjmnmmqjrkrkwimf.supabase.co",
  "frame-src https://api.razorpay.com",
  "base-uri 'self'",
].join("; ");

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  allowedDevOrigins: [".monkeycode-ai.live"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
