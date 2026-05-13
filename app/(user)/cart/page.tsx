"use client";
import { useState, useEffect } from "react";
import CartItem from "@/components/Cart/CartItem";

interface CartItemType {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    description?: string;
    stock: number;
  };
  quantity: number;
}

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
    // reload to show empty cart
    window.location.reload();
  }
};

export default function CartPage() {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      const data = await res.json();
      setItems(data);
      
      const calculatedTotal = data.reduce((sum: number, item: CartItemType) => sum + (item.product?.price * item.quantity), 0);
      setTotal(calculatedTotal);
    } catch (error) {
      console.error("Fetch cart error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading cart...</div>;

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Cart</h1>

      {items.length === 0 && <p>No items in cart</p>}

      {items.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}

      <h2 className="text-xl font-bold mt-4">Grand Total: ₹{total}</h2>
      <button
        onClick={handleCheckout}
        disabled={items.length === 0}
        className="bg-green-500 text-white px-4 py-2 mt-4 disabled:bg-gray-400"
      >
        Checkout
      </button>
    </div>
  );
}
