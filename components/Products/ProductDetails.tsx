"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus, Loader2 } from "lucide-react";
import { addToGuestCart, isLoggedIn } from "@/lib/guest-cart";

export default function ProductDetails({ product }: { product: any }) {
  const [selectedVariant, setSelectedVariant] = useState(product.productvariant[0]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  const addToCart = async () => {
    setLoading(true);
    try {
      if (!isLoggedIn()) {
        addToGuestCart({
          productId: product.id,
          name: product.name,
          image: product.image || null,
          quantity,
          price: selectedVariant.price,
        });
        alert(`${quantity}x ${product.name} (${selectedVariant.label}) added to cart!`);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        alert(`${quantity}x ${product.name} (${selectedVariant.label}) added to basket!`);
      }
    } catch {
      alert("Something went wrong while adding to cart.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid lg:grid-cols-2 gap-16">
        <div className="relative aspect-square bg-zinc-100 rounded-3xl overflow-hidden">
          <Image
            src={
              product.image ||
              "https://images.unsplash.com/photo-1599481238640-4c1288750d7a?q=80&w=800"
            }
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="text-5xl font-serif text-zinc-900">{product.name}</h1>
          {product.nameMarathi && (
            <p className="text-lg text-stone-500 mt-1">{product.nameMarathi}</p>
          )}

          <p className="mt-6 text-zinc-500 leading-relaxed">
            {product.description}
          </p>

          <div className="mt-8">
            <p className="text-4xl font-bold text-zinc-900">
              ₹{selectedVariant.price}
            </p>
          </div>

          <div className="mt-10">
            <h3 className="font-semibold mb-4">Select Variant</h3>
            <div className="flex flex-wrap gap-3">
              {product.productvariant.map((variant: any) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`px-5 py-3 rounded-xl border transition-all ${
                    selectedVariant.id === variant.id
                      ? "bg-zinc-900 text-white border-zinc-900"
                      : "bg-white border-zinc-200"
                  }`}
                >
                  {variant.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <h3 className="font-semibold mb-4">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
                className="p-3 border rounded-xl"
              >
                <Minus size={18} />
              </button>
              <span className="text-xl font-bold">{quantity}</span>
              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="p-3 border rounded-xl"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <button
            onClick={addToCart}
            disabled={loading}
            className="mt-12 bg-zinc-900 text-white px-10 py-5 rounded-2xl hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Adding...
              </>
            ) : (
              "Add To Cart"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
