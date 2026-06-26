"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ArrowLeft, Truck } from "lucide-react";
import { SkeletonOrders } from "@/components/Skeleton/Skeleton";

type OrderItem = {
  id: string;
  quantity: number;
  product: { id: string; name: string };
};

type Order = {
  id: string;
  totalAmount: number;
  status: string;
  paymentType: string;
  createdAt: string;
  fullName: string;
  trackingId: string | null;
  orderitem: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders/user");
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch {
        console.error("Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return <SkeletonOrders />;
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-28 pb-16 px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-700 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Profile
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-10">
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-200">
            <Package size={48} className="mx-auto text-stone-200 mb-4" />
            <p className="text-stone-500 text-lg mb-2">No orders yet</p>
            <p className="text-stone-400 text-sm mb-6">
              Start shopping to see your orders here.
            </p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-emerald-800 text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl border border-stone-200 p-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <p className="text-xs text-stone-400 font-mono">
                      #{order.id.slice(0, 8)}
                    </p>
                    <p className="text-sm text-stone-500 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        order.status === "PENDING"
                          ? "bg-amber-50 text-amber-700"
                          : order.status === "CONFIRMED"
                            ? "bg-emerald-50 text-emerald-700"
                            : order.status === "SHIPPED"
                              ? "bg-blue-50 text-blue-700"
                              : order.status === "DELIVERED"
                                ? "bg-stone-100 text-stone-600"
                                : "bg-red-50 text-red-600"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-lg font-bold text-stone-900">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-4 space-y-2">
                  {order.orderitem.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-stone-700">{item.product.name}</span>
                      <span className="text-stone-500">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                  <span>{order.paymentType}</span>
                  <div className="flex items-center gap-3">
                    {order.trackingId && order.trackingId !== "PENDING" && (
                      <Link href={`/track?order=${order.id}`} className="inline-flex items-center gap-1.5 text-emerald-700 hover:text-emerald-600 font-bold transition-colors">
                        <Truck size={14} /> Track
                      </Link>
                    )}
                    <span>{order.fullName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
