"use client";

import { useState } from "react";
import { Search, Package, Truck, ExternalLink, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type TrackedOrder = {
  id: string;
  status: string;
  courierName: string | null;
  trackingId: string | null;
  totalAmount: number;
  shippingCost: number;
  paymentType: string;
  fullName: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
  trackingUrl: string | null;
};

const statusDisplay: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Pending", color: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  CONFIRMED: { label: "Confirmed", color: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  SHIPPED: { label: "Shipped", color: "bg-blue-50 text-blue-700 ring-1 ring-blue-200" },
  DELIVERED: { label: "Delivered", color: "bg-stone-100 text-stone-600 ring-1 ring-stone-200" },
  CANCELLED: { label: "Cancelled", color: "bg-red-50 text-red-600 ring-1 ring-red-200" },
};

export default function TrackPage() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setOrders(null);
    try {
      const isOrderId = query.includes("-") || query.length > 12;
      const param = isOrderId ? `order=${query.trim()}` : `phone=${query.trim()}`;
      const res = await fetch(`/api/track?${param}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setOrders(data);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f5] pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 mb-6 transition-colors">
          <ArrowLeft size={14} /> Back to Home
        </Link>

        <div className="text-center mb-10">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Truck size={28} className="text-emerald-700" />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-2">Track Your Order</h1>
          <p className="text-stone-500 text-sm">Enter your Order ID or Phone number to check status</p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 p-6 mb-8 shadow-sm">
          <div className="flex gap-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Order ID or Phone number"
              className="flex-1 border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-emerald-600 text-sm"
            />
            <button onClick={handleSearch} disabled={loading || !query.trim()}
              className="px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-all disabled:opacity-40 flex items-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Search
            </button>
          </div>
          <p className="text-xs text-stone-400 mt-3">
            For example: <button onClick={() => setQuery("9876543210")} className="text-emerald-700 hover:underline">search by phone</button> or enter your full Order ID from the confirmation email.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-5 py-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {orders && orders.length === 0 && !error && (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
            <Package size={44} className="mx-auto text-stone-200 mb-4" strokeWidth={1} />
            <p className="text-stone-500 text-sm">No orders found matching your search.</p>
          </div>
        )}

        {orders && orders.map((order) => {
          const statusInfo = statusDisplay[order.status] || statusDisplay.PENDING;
          return (
            <div key={order.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden mb-4 shadow-sm">
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-stone-400 font-mono">#{order.id.slice(0, 12).toUpperCase()}</p>
                    <p className="text-sm text-stone-600 mt-0.5">{order.fullName}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${statusInfo.color}`}>{statusInfo.label}</span>
                </div>

                <div className="space-y-3 mb-6">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-stone-100 last:border-0">
                      <span className="text-stone-700">{item.name}</span>
                      <span className="text-stone-400 text-xs">x{item.quantity}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm bg-stone-50 rounded-xl p-4 mb-6">
                  <div>
                    <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Payment</p>
                    <p className="text-stone-800 font-medium mt-0.5">{order.paymentType === "COD" ? "Cash on Delivery" : order.paymentType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Total</p>
                    <p className="text-stone-800 font-bold mt-0.5">₹{order.totalAmount}</p>
                  </div>
                </div>

                {order.trackingId && order.trackingId !== "PENDING" && (
                  <div className="border border-stone-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-stone-400 uppercase tracking-wider font-bold">Courier</p>
                        <p className="text-sm font-medium text-stone-800 mt-0.5">{order.courierName || "—"}</p>
                        <p className="text-xs text-stone-500 font-mono mt-1">{order.trackingId}</p>
                      </div>
                      {order.trackingUrl ? (
                        <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all">
                          Track Now <ExternalLink size={13} />
                        </a>
                      ) : (
                        <span className="text-xs text-stone-400">No tracking URL available</span>
                      )}
                    </div>
                  </div>
                )}

                {(!order.trackingId || order.trackingId === "PENDING") && order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 rounded-xl px-4 py-3">
                    <Package size={14} />
                    Order is being processed. Tracking will appear here once shipped.
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
