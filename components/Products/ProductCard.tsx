"use client";

import { useState, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Loader2, Plus, Minus } from "lucide-react";
import { addToGuestCart, isLoggedIn } from "@/lib/guest-cart";
import { useToast } from "@/components/Toast/ToastProvider";

const ProductCard = memo(function ProductCard({ product }: any) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(
    product.productvariant?.[0] ?? null,
  );
  const { toast } = useToast();

  const price = selectedVariant?.price ?? 0;

  const addToCart = async () => {
    setLoading(true);
    try {
      if (!isLoggedIn()) {
        addToGuestCart({
          productId: product.id,
          variantId: selectedVariant?.id,
          name: product.name,
          image: product.image || null,
          quantity,
          price,
        });
        toast(`${quantity}x ${product.name} added to cart!`, "success");
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
        toast(`${quantity}x ${product.name} added to cart!`, "success");
      }
    } catch {
      toast("Something went wrong while adding to cart.", "error");
    } finally {
      setLoading(false);
    }
  };

  const outOfStock = product.stock === 0;

  return (
    <div className="group flex flex-col bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full">
      <Link
        href={`/products/${product.id}`}
        className="relative aspect-square bg-stone-100 block overflow-hidden"
      >
        <Image
          src={
            product.image ||
            "https://images.unsplash.com/photo-1599481238640-4c1288750d7a?q=80&w=800"
          }
          alt={product.name}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {outOfStock && (
          <span className="absolute inset-0 bg-stone-900/50 flex items-center justify-center">
            <span className="bg-white text-stone-900 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full">
              Out of Stock
            </span>
          </span>
        )}
      </Link>

      <div className="flex flex-col flex-1 p-4 space-y-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 mb-1">
            Papad
          </p>
          <Link href={`/products/${product.id}`}>
            <h3 className="text-sm font-semibold text-stone-900 leading-snug line-clamp-2 hover:text-emerald-800 transition-colors">
              {product.name}
            </h3>
            {product.nameMarathi && (
              <p className="text-xs text-stone-500 mt-0.5">
                {product.nameMarathi}
              </p>
            )}
          </Link>
        </div>

        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={11}
              className={
                i < 4
                  ? "text-amber-400 fill-amber-400"
                  : "text-stone-200 fill-stone-200"
              }
            />
          ))}
          <span className="text-[10px] text-stone-400 ml-1">(4.8)</span>
        </div>

        <p className="text-base font-bold text-stone-900">
          ₹{price}
          {product.productvariant?.length > 1 && (
            <span className="text-[10px] font-normal text-stone-400 ml-1">
              / {selectedVariant?.label}
            </span>
          )}
        </p>

        {product.productvariant?.length > 1 && (
          <div className="flex flex-wrap gap-1">
            {product.productvariant.map((v: any) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                className={`text-[10px] px-2 py-1 rounded-md border transition-all ${
                  selectedVariant?.id === v.id
                    ? "bg-emerald-800 text-white border-emerald-800"
                    : "bg-white border-stone-200 text-stone-500 hover:border-stone-400"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2 space-y-2.5">
          <div className="flex items-center justify-between bg-stone-50 rounded-xl p-1 border border-stone-100">
            <button
              onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
              className="p-1.5 hover:bg-white rounded-lg transition-colors text-stone-500"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-bold text-stone-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              className="p-1.5 hover:bg-white rounded-lg transition-colors text-stone-500"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={addToCart}
            disabled={loading || outOfStock}
            className="w-full py-2.5 rounded-xl bg-stone-900 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 transition-colors disabled:bg-stone-200 disabled:text-stone-400 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : outOfStock ? (
              "Out of Stock"
            ) : (
              "Add to Cart"
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;
