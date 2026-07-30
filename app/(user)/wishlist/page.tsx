"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { useSiteImages } from "@/lib/useSiteImages";
import Image from "next/image";
import { fetchCsrf } from "@/lib/csrf-client";
import { getGuestWishlist } from "@/lib/guest-wishlist";
import { isLoggedIn } from "@/lib/guest-cart";
import { useToast } from "@/components/Toast/ToastProvider";

type WishlistProduct = {
  id: string;
  name: string;
  image: string | null;
  productvariant: { id: string; label: string; price: number }[];
};

export default function WishlistPage() {
  const { toast } = useToast();
  const { getImage } = useSiteImages();
  const [items, setItems] = useState<WishlistProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    try {
      if (isLoggedIn()) {
        const res = await fetch("/api/wishlist");
        const data = await res.json();
        setItems(data.map((item: any) => item.product));
      } else {
        const guestIds = getGuestWishlist();
        if (guestIds.length === 0) {
          setItems([]);
          setLoading(false);
          return;
        }
        const res = await fetch("/api/products");
        const allProducts = await res.json();
        setItems(allProducts.filter((p: any) => guestIds.includes(p.id)));
      }
    } catch {
      toast("Failed to load wishlist", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const removeItem = async (productId: string) => {
    if (isLoggedIn()) {
      await fetchCsrf("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
    } else {
      const wishlist = getGuestWishlist();
      const filtered = wishlist.filter((id) => id !== productId);
      localStorage.setItem("papad_guest_wishlist", JSON.stringify(filtered));
    }
    setItems((prev) => prev.filter((p) => p.id !== productId));
    toast("Removed from wishlist", "success");
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] pt-32 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 mb-4 transition-colors">
              <ArrowLeft size={14} /> Continue Shopping
            </Link>
            <h1 className="text-4xl font-serif text-stone-900">My Wishlist</h1>
            <p className="text-stone-500 text-sm mt-1">{items.length} item{items.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-stone-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 shadow-sm">
            <Heart size={48} className="mx-auto text-stone-200 mb-4" strokeWidth={1.5} />
            <h2 className="text-xl font-serif text-stone-700 mb-2">Your wishlist is empty</h2>
            <p className="text-stone-400 text-sm mb-6">Save your favorite products here!</p>
            <Link href="/products" className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-all">
              <ShoppingBag size={16} /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all">
                <Link href={`/products/${product.id}`} className="relative aspect-square bg-stone-100 block overflow-hidden">
                  <Image
                    src={product.image || getImage("product_fallback")}
                    alt={product.name}
                    fill
                    loading="lazy"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="p-4">
                  <Link href={`/products/${product.id}`}>
                    <h3 className="text-sm font-semibold text-stone-900 line-clamp-1 hover:text-emerald-800 transition-colors">{product.name}</h3>
                  </Link>
                  {product.productvariant?.[0] && (
                    <p className="text-base font-bold text-stone-900 mt-2">₹{product.productvariant[0].price}</p>
                  )}
                  <button onClick={() => removeItem(product.id)}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-stone-100 text-stone-500 text-xs font-bold hover:bg-red-50 hover:text-red-600 transition-all">
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
