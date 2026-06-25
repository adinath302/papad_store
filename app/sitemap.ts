import { prisma } from "@/lib/prisma";
import type { MetadataRoute } from "next";

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
  } catch {
    // Database may be unavailable during build
  }

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    ...productUrls,
  ];
}
