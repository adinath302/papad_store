import { prisma } from "@/lib/prisma";
import CartItem from "@/components/CartItem";

export default async function CartPage() {
  const items = await prisma.cartItem.findMany({
    include: {
      product: true,
    },
  });

  const total = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Cart</h1>

      {items.length === 0 && <p>No items in cart</p>}

      {items.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}

      <h2 className="text-xl font-bold mt-4">Grand Total: ₹{total}</h2>
    </div>
  );
}
