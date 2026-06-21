"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import CartItem from "@/components/Cart/CartItem";

interface CartItemType {
  id: string;
  product: {
    id: string;
    name: string;
    image?: string;
    description?: string;
    productvariant: Array<{ id: string; label: string; price: number }>;
  };
  quantity: number;
}

export default function CartSidebar({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const getItemPrice = (item: any) => {
    if (item.product?.productvariant?.length > 0) {
      return Math.min(...item.product.productvariant.map((v: any) => v.price));
    }
    return 0;
  };

  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setItems(data);
      const calculatedTotal = data.reduce(
        (sum: number, item: any) => sum + getItemPrice(item) * item.quantity,
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
    if (!isOpen) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
  }, [isOpen]);

  const handleCheckout = async () => {
    const res = await fetch("/api/checkout", { method: "POST" });
    const data = await res.json();
    if (data.error) alert("Error: " + data.error);
    else {
      alert("Order placed successfully!");
      window.location.reload();
    }
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
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
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
                <div className="flex flex-col items-center justify-center h-40 space-y-4">
                  <div className="w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-zinc-400">Updating basket...</p>
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
                      window.location.href = "/products";
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
                <div className="flex justify-between items-end">
                  <span className="text-zinc-500 text-sm font-medium">
                    Subtotal
                  </span>
                  <span className="text-2xl font-serif text-zinc-900">
                    ₹{total}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest text-center">
                  Shipping & taxes calculated at checkout
                </p>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-zinc-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all group"
                >
                  Proceed to Checkout
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
