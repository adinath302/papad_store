"use client";

export default function CartItem({ item }: any) {

  const updateQuantity = async (action: "increase" | "decrease") => {
    await fetch("/api/cart", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: item.id,
        action,
      }),
    });

    location.reload(); // quick refresh (we'll improve later)
  };

  const removeItem = async () => {
    await fetch(`/api/cart?id=${item.id}`, {
      method: "DELETE",
    });

    location.reload();
  };

  return (
    <div className="border p-3 mb-3 rounded flex justify-between">
      <div>
        <h2>{item.product?.name}</h2>
        <p>₹{item.product.price}</p>
      </div>

      <div>
        <button onClick={() => updateQuantity("decrease")}>➖</button>
        <span className="mx-2">{item.quantity}</span>
        <button onClick={() => updateQuantity("increase")}>➕</button>

        <br />

        <button onClick={removeItem} className="text-red-500 mt-2">
          Remove
        </button>
      </div>
    </div>
  );
}