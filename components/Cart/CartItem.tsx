"use client";

import { Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  isLoggedIn,
  removeFromGuestCart,
  updateGuestCartQuantity,
  getGuestCart,
} from "@/lib/guest-cart";

type CartItem = {
  id: string;
  product: {
    id: string;
    name: string;
    image?: string | null;
    description?: string | null;
    productvariant: Array<{ id: string; label: string; price: number }>;
  };
  quantity: number;
};

export default function CartItem({
  item,
  onUpdate,
}: {
  item: CartItem;
  onUpdate?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const isGuest = item.id.startsWith("guest-");

  const variants = item.product?.productvariant ?? [];
  const price =
    variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0;

  const handleQuantity = async (action: "increase" | "decrease") => {
    if (isGuest) {
      const productId = item.id.replace("guest-", "");
      const guestCart = getGuestCart();
      const guestItem = guestCart.find((i) => i.productId === productId);
      if (!guestItem) return;
      const newQty =
        action === "increase"
          ? guestItem.quantity + 1
          : guestItem.quantity - 1;
      updateGuestCartQuantity(productId, newQty);
      onUpdate?.();
      return;
    }

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
    if (isGuest) {
      const productId = item.id.replace("guest-", "");
      removeFromGuestCart(productId);
      onUpdate?.();
      return;
    }

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
    <div className="flex gap-4 sm:gap-5 items-center py-2">
      <div className="w-24 h-28 sm:w-28 sm:h-32 bg-zinc-100 rounded-2xl overflow-hidden shrink-0">
        <img
          src={item.product?.image || "/papad-placeholder.jpg"}
          className="w-full h-full object-cover"
          alt={item.product?.name ?? "Cart item"}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-zinc-900 font-semibold truncate text-sm sm:text-base">
          {item.product?.name}
        </h4>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleQuantity("decrease")}
            disabled={loading}
            aria-label="Decrease quantity"
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Minus size={16} />
          </button>

          <span className="text-sm sm:text-base font-bold text-zinc-900 w-8 text-center">
            {loading ? (
              <Loader2
                size={16}
                className="animate-spin inline text-zinc-900"
              />
            ) : (
              item.quantity
            )}
          </span>

          <button
            onClick={() => handleQuantity("increase")}
            disabled={loading}
            aria-label="Increase quantity"
            className="p-2 hover:bg-zinc-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
        </div>

        <p className="text-sm sm:text-base font-bold text-zinc-900 mt-2">
          ₹{price * item.quantity}
        </p>
      </div>

      <button
        onClick={handleDelete}
        disabled={loading}
        aria-label="Remove item"
        className="p-2 text-zinc-400 hover:text-red-500 transition-colors disabled:opacity-50 rounded-lg"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}
