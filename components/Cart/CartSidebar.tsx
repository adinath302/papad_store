"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight, Loader2, Truck } from "lucide-react";
import { FREE_SHIPPING_MIN } from "@/lib/shipping";
import { useRouter } from "next/navigation";
import CartItem, { type CartItemData } from "@/components/Cart/CartItem";
import { getGuestCart, isLoggedIn } from "@/lib/guest-cart";
import Shimmer from "@/components/Skeleton/Skeleton";

const getItemPrice = (item: CartItemData) => {
  if (item.variantId) {
    const variant = item.product?.productvariant?.find(
      (v) => v.id === item.variantId,
    );
    if (variant) return variant.price;
  }
  return item.product?.productvariant?.[0]?.price ?? 0;
};

export default function CartSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [items, setItems] = useState<CartItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      if (!isLoggedIn()) {
        const guestItems = getGuestCart();
        const mapped: CartItemData[] = guestItems.map((gi) => ({
          id: `guest-${gi.productId}-${gi.variantId || "default"}`,
          variantId: gi.variantId,
          product: {
            id: gi.productId,
            name: gi.name,
            image: gi.image || undefined,
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
      if (!res.ok) {
        console.error("Cart fetch failed:", res.status, res.statusText);
        setItems([]);
        setLoading(false);
        return;
      }
      const text = await res.text();
      const data = (text ? JSON.parse(text) : []) as CartItemData[];
      setItems(data);
    } catch (error) {
      console.error("Fetch cart error:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    fetchCart();
  }, [isOpen]);

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + getItemPrice(item) * item.quantity,
        0,
      ),
    [items],
  );

  const handleCheckout = () => {
    setCheckingOut(true);
    onClose();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 inset-y-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-amber-600" />
                <h2 className="text-xl font-serif text-zinc-900">
                  Your Basket
                </h2>
                <span className="bg-zinc-100 text-zinc-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {loading ? (
                <div className="space-y-4 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <Shimmer className="w-20 h-24 rounded-2xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Shimmer className="h-4 w-3/4" />
                        <Shimmer className="h-3 w-1/3" />
                        <Shimmer className="h-4 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag
                    size={48}
                    className="mx-auto text-zinc-200 mb-4"
                  />
                  <p className="text-zinc-500 font-serif italic text-lg">
                    Your basket is empty
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      router.push("/products");
                    }}
                    className="text-amber-600 text-sm font-bold mt-2 hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="group relative">
                    <CartItem item={item} onUpdate={fetchCart} />
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 bg-zinc-50 border-t border-zinc-100 space-y-4">
                {total > 0 && total < FREE_SHIPPING_MIN && (
                  <div className="flex items-center gap-2 text-[11px] text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
                    <Truck size={14} />
                    <span>Add ₹{FREE_SHIPPING_MIN - total} more for free shipping</span>
                  </div>
                )}

                {total >= FREE_SHIPPING_MIN && (
                  <div className="flex items-center gap-2 text-[11px] text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
                    <Truck size={14} />
                    <span>Free shipping applied!</span>
                  </div>
                )}

                <div className="flex justify-between items-end">
                  <span className="text-zinc-500 text-sm font-medium">
                    Subtotal
                  </span>
                  <span className="text-2xl font-serif text-zinc-900">
                    ₹{total}
                  </span>
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="group relative w-full bg-zinc-900 disabled:bg-zinc-500 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 overflow-hidden transition-all duration-300 hover:bg-zinc-800 disabled:cursor-not-allowed"
                >
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-white/10 skew-x-12" />
                  <span className="relative flex items-center gap-3">
                    {checkingOut ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ArrowRight
                        size={18}
                        className="group-hover:translate-x-1.5 transition-transform"
                      />
                    )}
                    {checkingOut ? "Redirecting..." : "Proceed to Checkout"}
                  </span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
