"use client";

import { Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { useState } from "react";

export default function CartItem({
  item,
  onUpdate,
}: {
  item: any;
  onUpdate?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const price =
    item.product?.productvariant?.length > 0
      ? Math.min(...item.product.productvariant.map((v: any) => v.price))
      : 0;

  const handleQuantity = async (action: "increase" | "decrease") => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, action }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        onUpdate?.();
      }
    } catch {
      alert("Failed to update quantity");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cart?id=${item.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        onUpdate?.();
      }
    } catch {
      alert("Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <div className="w-20 h-24 bg-zinc-100 rounded-xl overflow-hidden shrink-0">
        <img
          src={item.product?.image || "/papad-placeholder.jpg"}
          className="w-full h-full object-cover"
          alt={item.product?.name}
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-zinc-900 font-medium truncate">
          {item.product?.name}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={() => handleQuantity("decrease")}
            disabled={loading}
            className="p-1 hover:bg-zinc-100 rounded-md transition-colors disabled:opacity-50"
          >
            <Minus size={14} />
          </button>
          <span className="text-sm font-bold text-zinc-900 w-6 text-center">
            {loading ? <Loader2 size={12} className="animate-spin inline" /> : item.quantity}
          </span>
          <button
            onClick={() => handleQuantity("increase")}
            disabled={loading}
            className="p-1 hover:bg-zinc-100 rounded-md transition-colors disabled:opacity-50"
          >
            <Plus size={14} />
          </button>
        </div>
        <p className="text-sm font-bold text-zinc-900 mt-1">
          ₹{price * item.quantity}
        </p>
      </div>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="p-2 text-zinc-300 hover:text-red-500 transition-colors disabled:opacity-50"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
