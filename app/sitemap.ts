import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

const staticPages = [
  { path: "", priority: 1, changefreq: "weekly" as const },
  { path: "/products", priority: 0.9, changefreq: "daily" as const },
  { path: "/about", priority: 0.7, changefreq: "monthly" as const },
  { path: "/faq", priority: 0.5, changefreq: "monthly" as const },
  { path: "/contact", priority: 0.4, changefreq: "monthly" as const },
  { path: "/cart", priority: 0.3, changefreq: "monthly" as const },
  { path: "/track", priority: 0.4, changefreq: "monthly" as const },
  { path: "/orders", priority: 0.3, changefreq: "monthly" as const },
  { path: "/terms", priority: 0.2, changefreq: "yearly" as const },
  { path: "/privacy", priority: 0.2, changefreq: "yearly" as const },
  { path: "/returns", priority: 0.3, changefreq: "monthly" as const },
  { path: "/shipping-policy", priority: 0.3, changefreq: "monthly" as const },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://papadcompany.com";

  let productUrls: { url: string; changeFrequency: "weekly"; priority: number }[] = [];
  try {
    const products = await prisma.product.findMany({ select: { id: true } });
    productUrls = products.map((product) => ({
      url: `${baseUrl}/products/${product.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {}

  const enUrls = staticPages.map((p) => ({
    url: `${baseUrl}${p.path}`,
    lastModified: new Date(),
    changeFrequency: p.changefreq,
    priority: p.priority,
  }));

  return [...enUrls, ...productUrls];
}
