"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import CartItem, { type CartItemData } from "@/components/Cart/CartItem";
import { getGuestCart, isLoggedIn } from "@/lib/guest-cart";
import Link from "next/link";
import { ShoppingBag, Loader2, ArrowRight, Truck } from "lucide-react";
import { FREE_SHIPPING_MIN } from "@/lib/shipping";
import { SkeletonCart } from "@/components/Skeleton/Skeleton";

const getItemPrice = (item: CartItemData) => {
  if (item.variantId) {
    const variant = item.product?.productvariant?.find(
      (v) => v.id === item.variantId,
    );
    if (variant) return variant.price;
  }
  return item.product?.productvariant?.[0]?.price ?? 0;
};

export const dynamic = "force-dynamic";

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      if (!isLoggedIn()) {
        const guestItems = getGuestCart();
        const mapped: CartItemData[] = guestItems.map((gi) => ({
          id: `guest-${gi.productId}-${gi.variantId || "default"}`,
          variantId: gi.variantId,
          product: {
            id: gi.productId,
            name: gi.name,
            image: gi.image,
            productvariant: gi.variantId
              ? [{ id: gi.variantId, label: "", price: gi.price }]
              : [{ id: "", label: "Default", price: gi.price }],
          },
          quantity: gi.quantity,
        }));
        setItems(mapped);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/cart");
      const data = (await res.json()) as CartItemData[];
      setItems(data);
    } catch (error) {
      console.error("Fetch cart error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => {
      fetchCart();
    }, 0);
    return () => {
      window.clearTimeout(t);
    };
  }, []);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + getItemPrice(item) * item.quantity, 0),
    [items],
  );

  if (loading) return <SkeletonCart />;

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-32 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif text-stone-900 mb-8">
          Shopping Cart
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-200">
            <ShoppingBag
              size={48}
              className="mx-auto text-stone-200 mb-4"
            />
            <p className="text-stone-500 italic text-lg mb-2">
              Your cart is empty
            </p>
            <Link
              href="/products"
              className="text-emerald-700 text-sm font-bold hover:underline"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-stone-200 p-4"
              >
                <CartItem item={item} onUpdate={fetchCart} />
              </div>
            ))}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 flex items-center justify-between">
              <span className="text-lg font-medium text-stone-700">
                Grand Total
              </span>
              <span className="text-2xl font-bold text-stone-900">
                ₹{total}
              </span>
            </div>

            {total > 0 && total < FREE_SHIPPING_MIN && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-sm text-amber-800 mb-2">
                  <Truck size={16} />
                  <span>Add ₹{FREE_SHIPPING_MIN - total} more for free shipping</span>
                </div>
                <div className="w-full bg-amber-200 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((total / FREE_SHIPPING_MIN) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {total >= FREE_SHIPPING_MIN && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-2 text-sm text-emerald-800">
                <Truck size={16} />
                <span>You qualify for free shipping!</span>
              </div>
            )}

            <button
              onClick={() => {
                setCheckingOut(true);
                router.push("/checkout");
              }}
              disabled={checkingOut}
              className="group relative w-full bg-stone-900 text-white py-4 rounded-2xl font-bold mt-2 text-center overflow-hidden transition-all duration-300 hover:bg-stone-800 disabled:bg-stone-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-white/10 skew-x-12" />
              {checkingOut ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Taking you to checkout...
                </>
              ) : (
                <>
                  Proceed to Checkout
                  <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                </>
              )}
            </button>
            {!isLoggedIn() && (
              <p className="text-center text-xs text-stone-400 mt-2">
                You&apos;re shopping as a guest.{" "}
                <Link
                  href="/login?redirect=/checkout"
                  className="text-emerald-700 underline underline-offset-2"
                >
                  Sign in
                </Link>{" "}
                to save your cart.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
