export function serializeProduct(product: any) {
  return {
    id: String(product.id),
    name: String(product.name ?? ""),
    nameMarathi: product.nameMarathi ?? null,
    description: product.description ?? null,
    stock: product.stock == null ? null : Number(product.stock),
    image: product.image ?? null,
    thumbnail: product.thumbnail ?? null,
    productType: product.productType ?? "weight",
    productvariant: Array.isArray(product.productvariant)
      ? product.productvariant.map((v: any) => ({
          id: String(v.id),
          label: String(v.label ?? ""),
          price: Number(v.price?.toString?.() ?? v.price) || 0,
        }))
      : [],
    productimage: Array.isArray(product.productimage)
      ? product.productimage.map((img: any) => ({
          id: String(img.id),
          url: String(img.url ?? ""),
          alt: img.alt ?? null,
        }))
      : [],
  };
}

export function serializeProducts(products: any[]) {
  return Array.isArray(products) ? products.map(serializeProduct) : [];
}
