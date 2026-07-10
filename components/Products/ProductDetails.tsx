"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Plus,
  Minus,
  Loader2,
  Star,
  ShoppingBag,
  Check,
  Heart,
  Share2,
  ShieldCheck,
  Truck,
  RefreshCw,
} from "lucide-react";
import { addToGuestCart, isLoggedIn, notifyCartUpdate } from "@/lib/guest-cart";
import { useToast } from "@/components/Toast/ToastProvider";
import ProductReviews from "./ProductReviews";
import ProductGallery from "@/components/ProductGallery";
import RecentlyViewed from "@/components/RecentlyViewed";
import StockNotificationForm from "@/components/StockNotificationForm";
import { useSiteImages } from "@/lib/useSiteImages";

export default function ProductDetails({
  product,
  relatedProducts,
}: {
  product: {
    id: string;
    name: string;
    nameMarathi?: string;
    image: string | null;
    stock: number | null;
    description?: string;
    productvariant: { id: string; price: number; label: string }[];
    productimage: { id: string; url: string; alt: string | null }[];
  };
  relatedProducts?: any[];
}) {
  const [selectedVariant, setSelectedVariant] = useState(
    product.productvariant?.[0] ?? null,
  );
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const { toast } = useToast();
  const { getImage } = useSiteImages();

  const hasVariants = product.productvariant?.length > 0;

  const addToCart = async () => {
    if (!selectedVariant) return;
    setLoading(true);
    try {
      if (!isLoggedIn()) {
        addToGuestCart({
          productId: product.id,
          variantId: selectedVariant?.id,
          name: product.name,
          image: product.image || null,
          quantity,
          price: selectedVariant.price,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          variantId: selectedVariant?.id,
          quantity,
        }),
      });
      const data = await res.json();
      if (data.error) {
        toast(data.error, "error");
      } else {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        notifyCartUpdate();
      }
    } catch {
      toast("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  const outOfStock = product.stock === 0;

  useEffect(() => {
    const loggedIn = document.cookie.includes("isLoggedIn=true");
    if (loggedIn) {
      fetch("/api/recently-viewed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id }),
      }).catch(() => {});
    } else {
      try {
        const raw = localStorage.getItem("papad_recently_viewed");
        let viewed: { id: string; name: string; image: string | null; price: number }[] = raw ? JSON.parse(raw) : [];
        viewed = viewed.filter((v) => v.id !== product.id);
        const prices = product.productvariant?.map((v: any) => v.price);
        viewed.unshift({
          id: product.id,
          name: product.name,
          image: product.image || null,
          price: prices?.length ? Math.min(...prices) : 0,
        });
        viewed = viewed.slice(0, 8);
        localStorage.setItem("papad_recently_viewed", JSON.stringify(viewed));
      } catch {}
    }
  }, [product.id]);

  return (
    <div className="min-h-screen bg-[#faf8f5]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-28 pb-20">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-stone-400 mb-8">
          <Link href="/" className="hover:text-stone-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/products"
            className="hover:text-stone-600 transition-colors"
          >
            Products
          </Link>
          <span>/</span>
          <span className="text-stone-600 truncate max-w-[200px]">
            {product.name}
          </span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Left: Image */}
          <div className="space-y-4">
            <div className="relative">
              {product.productimage?.length > 0 ? (
                <ProductGallery images={product.productimage} title={product.name} />
              ) : (
                <div className="relative aspect-square bg-stone-100 rounded-3xl overflow-hidden">
                  <Image
                    src={
                      product.image ||
                      getImage("product_fallback")
                    }
                    alt={product.name}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
              {outOfStock && (
                <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center rounded-2xl">
                  <span className="bg-white text-stone-900 text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-full">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Details */}
          <div className="flex flex-col">


            {/* Name */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-stone-900 leading-tight">
              {product.name}
            </h1>
            {product.nameMarathi && (
              <p className="text-lg text-stone-500 mt-1">
                {product.nameMarathi}
              </p>
            )}

            {/* Price */}
            <div className="mt-6 flex items-baseline gap-3">
              {selectedVariant ? (
                <>
                  <span className="text-4xl font-bold text-stone-900">
                    ₹{selectedVariant.price}
                  </span>
                  {product.productvariant.length > 1 && (
                    <span className="text-sm text-stone-400">
                      / {selectedVariant.label}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-4xl font-bold text-stone-900">
                  ₹{Math.min(
                    ...product.productvariant.map((v: any) => v.price),
                  )}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="mt-6 text-stone-500 leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Key highlights */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: ShieldCheck, text: "100% Natural" },
                { icon: Truck, text: "Free Shipping" },
                { icon: RefreshCw, text: "Easy Returns" },
                { icon: Heart, text: "Premium Quality" },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2 text-xs text-stone-500"
                >
                  <item.icon size={14} className="text-emerald-700 shrink-0" />
                  <span className="whitespace-nowrap">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Variant Selector */}
            {hasVariants && (
              <div className="mt-8">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
                  Select Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.productvariant.map((variant: any) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-5 py-3 rounded-xl border text-sm font-medium transition-all ${
                        selectedVariant?.id === variant.id
                          ? "bg-emerald-800 text-white border-emerald-800 shadow-md"
                          : "bg-white border-stone-200 text-stone-700 hover:border-stone-400"
                      }`}
                    >
                      {variant.label}
                      <span
                        className={`block text-xs mt-0.5 ${
                          selectedVariant?.id === variant.id
                            ? "text-emerald-200"
                            : "text-stone-400"
                        }`}
                      >
                        ₹{variant.price}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center self-start bg-white border border-stone-200 rounded-xl">
                <button
                  onClick={() =>
                    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
                  }
                  className="p-3 hover:bg-stone-50 rounded-xl transition-colors text-stone-500"
                >
                  <Minus size={18} />
                </button>
                <span className="w-12 text-center font-bold text-stone-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="p-3 hover:bg-stone-50 rounded-xl transition-colors text-stone-500"
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                onClick={addToCart}
                disabled={loading || outOfStock || !selectedVariant}
                className="flex-1 bg-emerald-800 hover:bg-emerald-700 text-white py-4 px-8 rounded-xl font-bold text-sm tracking-wide transition-all disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : outOfStock ? (
                  "Out of Stock"
                ) : added ? (
                  <>
                    <Check size={20} /> Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingBag size={20} /> Add to Cart
                  </>
                )}
              </button>
            </div>

            {/* Stock info */}
            {!outOfStock && product.stock != null && (
              <p className="mt-4 text-xs text-stone-400">
                {product.stock > 10
                  ? "In stock"
                  : product.stock > 0
                    ? `Only ${product.stock} left`
                    : "Out of stock"}
              </p>
            )}

            <StockNotificationForm productId={product.id} inStock={(product.stock ?? 0) > 0} />

            {/* Share */}
            <div className="mt-8 pt-8 border-t border-stone-200 flex flex-wrap items-center gap-4">
              <button className="flex items-center gap-2 text-xs text-stone-400 hover:text-stone-600 transition-colors">
                <Share2 size={14} />
                Share
              </button>
              <button className="flex items-center gap-2 text-xs text-stone-400 hover:text-red-500 transition-colors">
                <Heart size={14} />
                Wishlist
              </button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-800 mb-1">
                  You May Also Like
                </p>
                <h2 className="text-2xl font-serif text-stone-900">
                  Related Products
                </h2>
              </div>
              <Link
                href="/products"
                className="text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-stone-800 transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.slice(0, 4).map((rp: any) => (
                <RelatedProductCard key={rp.id} product={rp} />
              ))}
            </div>
          </section>
        )}

        <ProductReviews productId={product.id} />

        <RecentlyViewed />
      </div>
    </div>
  );
}

function RelatedProductCard({ product }: { product: any }) {
  const price = product.productvariant?.length
    ? Math.min(...product.productvariant.map((v: any) => v.price))
    : 0;
  const { getImage } = useSiteImages();

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-square bg-stone-100">
        <Image
          src={
            product.image ||
            getImage("product_fallback")
          }
          alt={product.name}
          fill
          loading="lazy"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-stone-900 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-base font-bold text-stone-900 mt-1">₹{price}</p>
      </div>
    </Link>
  );
}
