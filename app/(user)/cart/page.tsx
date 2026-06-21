"use client";
import { useState, useEffect } from "react";
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

const getItemPrice = (item: CartItemType) => {
  if (item.product?.productvariant?.length > 0) {
    return Math.min(...item.product.productvariant.map((v: any) => v.price));
  }
  return 0;
};

const handleCheckout = async () => {
  const res = await fetch("/api/checkout", {
    method: "POST",
  });

  const data = await res.json();
  console.log("ORDER:", data);

  if (data.error) {
    alert("Error: " + data.error);
  } else {
    alert("Order placed successfully!");
    window.location.reload();
  }
};

export default function CartPage() {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setItems(data);
      const calculatedTotal = data.reduce((sum: number, item: CartItemType) => sum + getItemPrice(item) * item.quantity, 0);
      setTotal(calculatedTotal);
    } catch (error) {
      console.error("Fetch cart error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCart();
  }, []);

  if (loading) return <div>Loading cart...</div>;

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-32 pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-serif text-stone-900 mb-8">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-200">
            <p className="text-stone-500 italic text-lg">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-stone-200 p-4">
                <CartItem item={item} onUpdate={fetchCart} />
              </div>
            ))}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 flex items-center justify-between">
              <span className="text-lg font-medium text-stone-700">Grand Total</span>
              <span className="text-2xl font-bold text-stone-900">₹{total}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={items.length === 0}
              className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold hover:bg-stone-800 transition-colors disabled:bg-stone-300 mt-2"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
