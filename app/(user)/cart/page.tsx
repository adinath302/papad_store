"use client";

import { useEffect, useState } from "react";
import CartItem from "@/components/Cart/CartItem";
import { getGuestCart, isLoggedIn } from "@/lib/guest-cart";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

interface CartItemType {
  id: string;
  product: {
    id: string;
    name: string;
    image?: string | null;
    description?: string | null;
    productvariant: Array<{ id: string; label: string; price: number }>;
  };
  quantity: number;
}

const getItemPrice = (item: CartItemType) => {
  const variants = item.product?.productvariant ?? [];
  if (variants.length > 0) {
    return Math.min(...variants.map((v) => v.price));
  }
  return 0;
};

const handleCheckout = () => {
  window.location.href = "/checkout";
};

export default function CartPage() {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchCart = async () => {
    try {
      if (!isLoggedIn()) {
        const guestItems = getGuestCart();
        const mapped: CartItemType[] = guestItems.map((gi) => ({
          id: `guest-${gi.productId}`,
          product: {
            id: gi.productId,
            name: gi.name,
            image: gi.image,
            productvariant: [{ id: "", label: "Default", price: gi.price }],
          },
          quantity: gi.quantity,
        }));
        setItems(mapped);
        setTotal(
          mapped.reduce(
            (sum, item) => sum + getItemPrice(item) * item.quantity,
            0,
          ),
        );
        setLoading(false);
        return;
      }

      const res = await fetch("/api/cart");
      const data = (await res.json()) as CartItemType[];
      setItems(data);
      const calculatedTotal = data.reduce(
        (sum, item) => sum + getItemPrice(item) * item.quantity,
        0,
      );
      setTotal(calculatedTotal);
    } catch (error) {
      console.error("Fetch cart error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = window.setTimeout(() => {
      fetchCart();
    }, 0);
    return () => {
      window.clearTimeout(t);
    };
  }, []);

  if (loading) return <div>Loading cart...</div>;

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
            <button
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-colors disabled:bg-stone-300 mt-2"
            >
              Proceed to Checkout
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
