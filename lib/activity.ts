import { prisma } from "@/lib/prisma";

export async function logActivity(
  userId: string | undefined,
  action: string,
  resource: string,
  resourceId?: string,
  details?: string,
) {
  await prisma.activitylog.create({
    data: {
      userId: userId || null,
      action,
      resource,
      resourceId: resourceId || null,
      details: details || null,
    },
  });
}

export async function checkLowStock(productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, name: true, stock: true, lowStockThreshold: true },
  });
  if (!product) return;
  const threshold = product.lowStockThreshold ?? 10;
  if (product.stock != null && product.stock <= threshold) {
    await prisma.activitylog.create({
      data: {
        action: "LOW_STOCK",
        resource: "product",
        resourceId: product.id,
        details: `Product "${product.name}" has low stock: ${product.stock} (threshold: ${threshold})`,
      },
    });
  }
}
