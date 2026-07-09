"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  Package,
  Clock,
  AlertTriangle,
  TrendingUp,
  Activity,
  PackageX,
  IndianRupee,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Truck,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import type { Order } from "./types";
import { statusStyles } from "./types";
import { useToast } from "@/components/Toast/ToastProvider";

type InventoryAlert = {
  id: string;
  name: string;
  stock: number | null;
  lowStockThreshold: number | null;
};

type ActivityLog = {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  resourceId: string | null;
  details: string | null;
  createdAt: string;
  user: { name: string | null; email: string } | null;
};

function formatCurrency(amount: number) {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getLast6Months() {
  const now = new Date();
  const months: { year: number; month: number; label: string }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ year: d.getFullYear(), month: d.getMonth(), label: `${monthNames[d.getMonth()]} ${d.getFullYear()}` });
  }
  return months;
}

function getActionIcon(action: string) {
  if (action.startsWith("ORDER_")) return { icon: ShoppingBag, color: "text-blue-500 bg-blue-50" };
  if (action.startsWith("PRODUCT_")) return { icon: Package, color: "text-emerald-500 bg-emerald-50" };
  if (action.startsWith("PAYMENT_")) return { icon: IndianRupee, color: "text-amber-500 bg-amber-50" };
  if (action.startsWith("LOW_STOCK")) return { icon: AlertTriangle, color: "text-red-500 bg-red-50" };
  return { icon: Activity, color: "text-stone-500 bg-stone-100" };
}

export default function DashboardTab({ orders, productsCount }: { orders: Order[]; productsCount: number }) {
  const { toast } = useToast();
  const [inventoryAlerts, setInventoryAlerts] = useState<InventoryAlert[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch("/api/inventory-alerts");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setInventoryAlerts(data);
      } catch {
        toast("Failed to load inventory alerts", "error");
      } finally {
        setLoadingAlerts(false);
      }
    };
    fetchAlerts();
  }, [toast]);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await fetch("/api/activity-logs?limit=10");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setActivityLogs(data.logs);
      } catch {
        toast("Failed to load activity logs", "error");
      } finally {
        setLoadingActivity(false);
      }
    };
    fetchActivity();
  }, [toast]);

  const totalRevenue = useMemo(
    () => orders.filter((o) => o.status !== "CANCELLED").reduce((sum, o) => sum + o.totalAmount, 0),
    [orders],
  );
  const totalOrders = orders.length;
  const pendingOrders = useMemo(() => orders.filter((o) => o.status === "PENDING").length, [orders]);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const monthlyRevenue = useMemo(() => {
    const months = getLast6Months();
    return months.map((m) => {
      const revenue = orders
        .filter((o) => {
          const d = new Date(o.createdAt);
          return d.getMonth() === m.month && d.getFullYear() === m.year && o.status !== "CANCELLED";
        })
        .reduce((sum, o) => sum + o.totalAmount, 0);
      return { ...m, revenue };
    });
  }, [orders]);

  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  const topProducts = useMemo(() => {
    const countMap: Record<string, { name: string; quantity: number }> = {};
    orders.forEach((o) => {
      o.orderitem?.forEach((item) => {
        if (!countMap[item.productId]) {
          countMap[item.productId] = { name: item.product.name, quantity: 0 };
        }
        countMap[item.productId].quantity += item.quantity;
      });
    });
    return Object.values(countMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }, [orders]);

  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  }, [orders]);

  const statusOrder = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

  const statCards = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: IndianRupee,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Orders",
      value: totalOrders,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Low Stock Items",
      value: inventoryAlerts.length,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50",
    },
    {
      label: "Avg Order Value",
      value: formatCurrency(avgOrderValue),
      icon: TrendingUp,
      color: "text-stone-600",
      bg: "bg-stone-100",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-stone-500 mt-0.5">Overview of your store</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl md:rounded-2xl border border-stone-200 p-4 md:p-6 shadow-sm">
            <div className={`p-2 rounded-lg md:p-2.5 md:rounded-xl inline-flex ${card.bg} mb-2 md:mb-3`}>
              <card.icon size={16} className={`${card.color} md:size-5`} strokeWidth={1.5} />
            </div>
            <p className="text-xl md:text-3xl font-bold text-stone-900">{card.value}</p>
            <p className="text-[11px] md:text-sm text-stone-500 mt-0.5 md:mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900 mb-5">Revenue (Last 6 Months)</h2>
            <div className="space-y-3">
              {monthlyRevenue.map((m) => {
                const pct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
                let barColor = "bg-emerald-200";
                if (pct > 80) barColor = "bg-emerald-800";
                else if (pct > 60) barColor = "bg-emerald-600";
                else if (pct > 40) barColor = "bg-emerald-500";
                else if (pct > 20) barColor = "bg-emerald-400";
                else barColor = "bg-emerald-300";
                return (
                  <div key={m.label} className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-stone-500 w-20 shrink-0 text-right">{m.label}</span>
                    <div className="flex-1 h-7 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-stone-700 w-24 shrink-0 text-right">{formatCurrency(m.revenue)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900 mb-5">Recent Orders</h2>
            {orders.slice(0, 5).length > 0 ? (
              <>
                <div className="overflow-x-auto hidden sm:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-stone-100">
                        <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Customer</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Total</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Status</th>
                        <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                          <td className="px-5 py-4">
                            <p className="font-medium text-stone-800">{order.fullName || "Guest"}</p>
                          </td>
                          <td className="px-5 py-4 font-medium text-stone-800">{formatCurrency(order.totalAmount)}</td>
                          <td className="px-5 py-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${statusStyles[order.status] || "bg-stone-100 text-stone-600"}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-stone-400 text-xs">
                            {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="sm:hidden space-y-2">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-stone-800 truncate">{order.fullName || "Guest"}</p>
                        <p className="text-xs text-stone-400 mt-0.5">{formatCurrency(order.totalAmount)}</p>
                      </div>
                      <span className={`shrink-0 ml-3 inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${statusStyles[order.status] || "bg-stone-100 text-stone-600"}`}>
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-14 text-stone-400 text-sm">No orders yet</div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Low Stock Alerts</h2>
            {loadingAlerts ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : inventoryAlerts.length > 0 ? (
              <div className="space-y-3">
                {inventoryAlerts.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-stone-800 truncate">{item.name}</p>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Threshold: {item.lowStockThreshold ?? 10}
                      </p>
                    </div>
                    {item.stock != null && item.stock <= 0 ? (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 ring-1 ring-red-200">
                        <PackageX size={12} />
                        OUT OF STOCK
                      </span>
                    ) : (
                      <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                        <AlertTriangle size={12} />
                        LOW ({item.stock} left)
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center size-10 rounded-full bg-emerald-50 text-emerald-500 mb-3">
                  <CheckCircle size={20} />
                </div>
                <p className="text-sm text-stone-500">All products are well-stocked ✓</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Top Products</h2>
            {topProducts.length > 0 ? (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-3">
                    <span className="shrink-0 size-6 rounded-full bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-800 truncate">{p.name}</p>
                    </div>
                    <span className="shrink-0 text-xs font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
                      {p.quantity} sold
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-stone-400">No product sales data yet.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Order Status</h2>
            <div className="grid grid-cols-2 gap-3">
              {statusOrder.map((status) => {
                const count = statusDistribution[status] || 0;
                const total = totalOrders || 1;
                const pct = Math.round((count / total) * 100);
                const dotColor = statusStyles[status]?.match(/bg-(\w+)-50/)?.[1] === "amber"
                  ? "bg-amber-500"
                  : statusStyles[status]?.match(/bg-(\w+)-50/)?.[1] === "emerald"
                    ? "bg-emerald-500"
                    : statusStyles[status]?.match(/bg-(\w+)-50/)?.[1] === "blue"
                      ? "bg-blue-500"
                      : statusStyles[status]?.match(/bg-(\w+)-50/)?.[1] === "red"
                        ? "bg-red-500"
                        : "bg-stone-400";
                return (
                  <div key={status} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-stone-50">
                    <div className={`size-2.5 rounded-full shrink-0 ${dotColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-700">{status}</p>
                      <p className="text-[11px] text-stone-400">{count} ({pct}%)</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-stone-900 mb-4">Recent Activity</h2>
            {loadingActivity ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activityLogs.length > 0 ? (
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
                {activityLogs.map((log) => {
                  const { icon: ActIcon, color } = getActionIcon(log.action);
                  return (
                    <div key={log.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-stone-50 transition-colors">
                      <div className={`shrink-0 size-8 rounded-lg flex items-center justify-center ${color}`}>
                        <ActIcon size={14} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-stone-800 leading-tight">
                          {log.user?.name || "System"}
                        </p>
                        <p className="text-xs text-stone-500 leading-tight mt-0.5 truncate">{log.action.replace(/_/g, " ")}</p>
                      </div>
                      <span className="shrink-0 text-[11px] text-stone-400 font-medium whitespace-nowrap">
                        {timeAgo(log.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center size-10 rounded-full bg-stone-100 text-stone-400 mb-3">
                  <Activity size={20} />
                </div>
                <p className="text-sm text-stone-400">No recent activity.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
