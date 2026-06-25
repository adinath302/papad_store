"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import type { Order } from "./types";
import { statusStyles } from "./types";

type OrdersTabProps = {
  orders: Order[];
  isOwner: boolean;
  hasPerm: (resource: string, action: string) => boolean;
  onOrderChange: () => void;
};

export default function OrdersTab({ orders, isOwner, hasPerm, onOrderChange }: OrdersTabProps) {
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [shipCourier, setShipCourier] = useState("IndiaPost - Speed Post");
  const [shipTracking, setShipTracking] = useState("");

  const updateOrderStatus = async (id: string, status: string) => {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    onOrderChange();
  };

  const markAsShipped = async (id: string) => {
    if (!shipTracking.trim()) return;
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "SHIPPED", courierName: shipCourier, trackingId: shipTracking.trim() }),
    });
    setShippingOrderId(null);
    setShipCourier("IndiaPost - Speed Post");
    setShipTracking("");
    onOrderChange();
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Orders</h1>
        <p className="text-sm text-stone-500 mt-1">{orders.length} order{orders.length !== 1 ? "s" : ""} • Track and manage</p>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden md:table-cell">Items</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">Subtotal</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Shipping</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Total</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">Payment</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                    <td className="px-5 py-4 max-w-[200px]">
                      <p className="font-semibold text-stone-800 text-sm">{order.fullName || "Guest"}</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">{order.phone}</p>
                      <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                        <p>{order.address1}</p>
                        {order.address2 && <p>{order.address2}</p>}
                        <p>{order.city}, {order.state} — {order.pincode}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1.5">
                        {order.orderitem.map((item) => (
                          <span key={item.id} className="inline-block px-2.5 py-1 bg-stone-100 text-stone-600 rounded-lg text-[11px] font-medium">
                            {item.product.name}<span className="text-stone-400 ml-1">x{item.quantity}</span>
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-stone-600 hidden sm:table-cell">₹{order.totalAmount - order.shippingCost}</td>
                    <td className="px-5 py-4 text-stone-600">
                      <div>
                        {order.shippingCost > 0 ? (
                          <span className="font-semibold">₹{order.shippingCost}</span>
                        ) : (
                          <span className="text-emerald-600 text-[11px] font-medium">Free</span>
                        )}
                      </div>
                      {order.courierName && (
                        <p className="text-[10px] text-stone-400 mt-0.5 truncate max-w-[130px]" title={order.courierName}>{order.courierName}</p>
                      )}
                    </td>
                    <td className="px-5 py-4 font-bold text-stone-800">₹{order.totalAmount}</td>
                    <td className="px-5 py-4 hidden sm:table-cell text-stone-500 text-xs font-medium uppercase">{order.paymentType}</td>
                    <td className="px-5 py-4">
                      {shippingOrderId === order.id ? (
                        <div className="space-y-2 min-w-[200px]">
                          <input value={shipCourier} onChange={(e) => setShipCourier(e.target.value)}
                            placeholder="Courier name"
                            className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-stone-400" />
                          <input value={shipTracking} onChange={(e) => setShipTracking(e.target.value)}
                            placeholder="Tracking number"
                            className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-stone-400" />
                          <div className="flex gap-1.5">
                            <button onClick={() => markAsShipped(order.id)} disabled={!shipTracking.trim()}
                              className="flex-1 px-3 py-1.5 bg-stone-900 text-white rounded-lg text-[11px] font-bold hover:bg-stone-800 transition-all disabled:opacity-40">Mark Shipped</button>
                            <button onClick={() => setShippingOrderId(null)}
                              className="px-3 py-1.5 text-stone-400 hover:text-stone-600 text-[11px]">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {(isOwner || hasPerm("orders", "update_status")) ? (
                            <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              className={`text-[11px] font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer outline-none ${statusStyles[order.status] || "bg-stone-100 text-stone-600"}`}>
                              <option value="PENDING">Pending</option>
                              <option value="CONFIRMED">Confirmed</option>
                              <option value="SHIPPED">Shipped</option>
                              <option value="DELIVERED">Delivered</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                          ) : (
                            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${statusStyles[order.status] || "bg-stone-100 text-stone-600"}`}>{order.status}</span>
                          )}
                          {(isOwner || hasPerm("orders", "add_tracking")) && (order.status === "PENDING" || order.status === "CONFIRMED") && !order.trackingId && (
                            <button onClick={() => { setShippingOrderId(order.id); setShipTracking(""); }}
                              className="block text-[10px] font-semibold text-emerald-700 hover:text-emerald-600 hover:underline mt-1">+ Add Shipping</button>
                          )}
                          {order.trackingId && order.trackingId !== "PENDING" && (
                            <p className="text-[10px] text-stone-400 font-mono truncate max-w-[120px]" title={`${order.courierName || ""} • ${order.trackingId}`}>
                              {order.courierName ? `${order.courierName} • ` : ""}{order.trackingId}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-stone-400 text-xs hidden sm:table-cell">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag size={44} className="mx-auto text-stone-200 mb-4" strokeWidth={1} />
            <p className="text-stone-400 text-sm">No orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
