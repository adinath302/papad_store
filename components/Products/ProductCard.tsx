"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, ShoppingCart, Loader2, Plus, Minus } from "lucide-react";

export default function ProductCard({ product }: any) {
  const [loading, setLoading] = useState(false);
  const [quantity, setQuantity] = useState(1); // Old logic style: default is 1

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  // --- OLD LOGIC with Quantity Variable ---
  const addToCart = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: quantity, // Uses the current state count
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
      } else {
        alert(`${quantity}x ${product.name} added to basket!`);
      }
    } catch (error) {
      console.error("Cart error:", error);
      alert("Something went wrong while adding to cart.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group space-y-4">
      {/* Image Container */}
      <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-zinc-100 shadow-sm transition-all duration-500 group-hover:shadow-xl">
        <Image
          src={
            product.image ||
            "https://images.unsplash.com/photo-1599481238640-4c1288750d7a?q=80&w=800"
          }
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
      </div>

      {/* Product Details */}
      <div className="space-y-3 px-1">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-medium text-zinc-900 leading-tight">
            {product.name}
          </h3>
          <div className="flex items-center gap-1 text-amber-500 shrink-0 mt-1">
            <Star size={12} fill="currentColor" />
            <span className="text-[11px] font-black text-zinc-900">4.8</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">
              Price
            </span>
            <p className="text-xl font-bold text-zinc-900">
              ₹{product.variants?.[0]?.price}
            </p>
          </div>

          {/* NEW QUANTITY UI */}
          <div className="flex items-center bg-zinc-100 rounded-xl p-1">
            <button
              onClick={decrement}
              className="p-2 hover:bg-white rounded-lg transition-colors text-zinc-500"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-bold text-zinc-900">
              {quantity}
            </span>
            <button
              onClick={increment}
              className="p-2 hover:bg-white rounded-lg transition-colors text-zinc-500"
            >
              <Plus size={14} />
            </button>
          </div>

          <button
            onClick={addToCart}
            disabled={loading || product.stock === 0}
            className="bg-zinc-900 text-white p-4 rounded-2xl hover:bg-amber-600 transition-all active:scale-95 disabled:bg-zinc-200"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <ShoppingCart size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
