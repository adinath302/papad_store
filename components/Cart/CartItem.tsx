"use client";

import Image from "next/image";
import { Trash2, Plus, Minus, Loader2 } from "lucide-react";
import { useState, memo, useMemo } from "react";
import { useToast } from "@/components/Toast/ToastProvider";
import {
  removeFromGuestCart,
  updateGuestCartQuantity,
  getGuestCart,
} from "@/lib/guest-cart";

export type CartItemData = {
  id: string;
  variantId?: string | null;
  product: {
    id: string;
    name: string;
    image?: string | null;
    description?: string | null;
    productvariant: Array<{ id: string; label: string; price: number }>;
  };
  quantity: number;
};

const CartItem = memo(function CartItem({
  item,
  onUpdate,
}: {
  item: CartItemData;
  onUpdate?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isGuest = item.id.startsWith("guest-");

  const variant = useMemo(() => {
    if (item.variantId) {
      return item.product?.productvariant?.find(
        (v) => v.id === item.variantId,
      );
    }
    return item.product?.productvariant?.[0];
  }, [item.variantId, item.product?.productvariant]);

  const price = variant?.price ?? 0;

  const handleQuantity = async (action: "increase" | "decrease") => {
    if (isGuest) {
      const guestCart = getGuestCart();
      const guestItem = guestCart.find(
        (i) => i.productId === item.product.id && i.variantId === (item.variantId ?? i.variantId),
      );
      if (!guestItem) return;
      const newQty =
        action === "increase"
          ? guestItem.quantity + 1
          : guestItem.quantity - 1;
      updateGuestCartQuantity(item.product.id, newQty, item.variantId ?? undefined);
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
        toast(data.error, "error");
      } else {
        onUpdate?.();
      }
    } catch {
      toast("Failed to update quantity", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isGuest) {
      removeFromGuestCart(item.product.id, item.variantId ?? undefined);
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
        toast(data.error, "error");
      } else {
        onUpdate?.();
      }
    } catch {
      toast("Failed to remove item", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-4 sm:gap-5 items-center py-2">
      <div className="w-24 h-28 sm:w-28 sm:h-32 bg-zinc-100 rounded-2xl overflow-hidden shrink-0">
        <Image
          src={item.product?.image || "/papad-placeholder.jpg"}
          alt={item.product?.name ?? "Cart item"}
          width={112}
          height={128}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-zinc-900 font-semibold truncate text-sm sm:text-base">
          {item.product?.name}
        </h4>

        {variant?.label && (
          <p className="text-xs text-zinc-400 mt-0.5">{variant.label}</p>
        )}

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
});

export default CartItem;
