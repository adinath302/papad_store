"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Minus } from "lucide-react";

export default function ProductDetails({ product }: { product: any }) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);

  const [quantity, setQuantity] = useState(1);

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid lg:grid-cols-2 gap-16">
        {/* Product Image */}
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

        {/* Product Details */}
        <div>
          <h1 className="text-5xl font-serif text-zinc-900">{product.name}</h1>

          <p className="mt-6 text-zinc-500 leading-relaxed">
            {product.description}
          </p>

          {/* Price */}
          <div className="mt-8">
            <p className="text-4xl font-bold text-zinc-900">
              ₹{selectedVariant.price}
            </p>
          </div>

          {/* Variants */}
          <div className="mt-10">
            <h3 className="font-semibold mb-4">Select Variant</h3>

            <div className="flex flex-wrap gap-3">
              {product.variants.map((variant: any) => (
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

          {/* Quantity */}
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

          {/* Add To Cart */}
          <button className="mt-12 bg-zinc-900 text-white px-10 py-5 rounded-2xl hover:bg-zinc-800 transition-all">
            Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
}
