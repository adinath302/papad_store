import { prisma } from "@/lib/prisma";

const OrdersPage = async () => {
  const orders = await prisma.order.findMany({
    include: {
      orderitem: {
        include: { product: true },
      },
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  console.log(orders);

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      {orders.length === 0 && <p>No orders yet</p>}

      {orders.map((order) => (
        <div key={order.id} className="border p-4 mb-4 rounded">
          <h2 className="font-bold">Order ID: {order.id}</h2>

          {(order as any).orderitem?.map((item: any) => (
            <div key={item.id} className="ml-4 mt-2">
              <p>{item.product.name}</p>
              <p>
                ₹{item.product.price} × {item.quantity}
              </p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default OrdersPage;
