"use client";

import { Package, ShoppingBag, LayoutDashboard } from "lucide-react";
import type { Order } from "./types";
import { statusStyles } from "./types";

export default function DashboardTab({ orders, productsCount }: { orders: Order[]; productsCount: number }) {
  const statCards = [
    {
      label: "Total Products",
      value: productsCount,
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Pending Orders",
      value: orders.filter((o) => o.status === "PENDING").length,
      icon: LayoutDashboard,
      color: "text-stone-600",
      bg: "bg-stone-100",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-stone-500 mt-1">Overview of your store</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${card.bg}`}>
                <card.icon size={20} className={card.color} strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-3xl font-bold text-stone-900">{card.value}</p>
            <p className="text-sm text-stone-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold text-stone-900 mb-4">Recent Orders</h2>
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          {orders.slice(0, 5).length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Customer</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">Total</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                      <td className="px-5 py-4">
                        <p className="font-medium text-stone-800">{order.fullName || "Guest"}</p>
                      </td>
                      <td className="px-5 py-4 font-medium text-stone-800 hidden sm:table-cell">₹{order.totalAmount}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${statusStyles[order.status] || "bg-stone-100 text-stone-600"}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-stone-400 text-xs hidden sm:table-cell">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-14 text-stone-400 text-sm">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
