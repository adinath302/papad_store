"use client";

import { useState } from "react";

export default function ProductCard({ product }: any) {
  const [quantity, setQuantity] = useState(1);

const addToCart = async () => {
    console.log("PRODUCT ID:", product.id, "Qty:", quantity);

    const response = await fetch("/api/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: product.id,
        quantity: quantity,
      }),
    });

    const item = await response.json();
    // alert(`Added to cart! Current quantity: ${item.quantity}`);
  };

  return (
    <li className="border p-4 bg-white">
      <h2>{product.name}</h2>
      <p>₹{product.price}</p>
      <p>Stock: {product.stock}</p>
      <div className="flex justify-between text-sm mt-2">
        <button
          onClick={addToCart}
          className="bg-blue-500 text-white py-1 px-4 rounded-xl"
        >
          Add to Cart
        </button>
        <button className="flex items-center gap-2 border-0 rounded-xl bg-white">
          Qty :
          <input 
            type="number" 
            className="w-10 bg-white border" 
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
          />
        </button>
      </div>
    </li>
  );
}
