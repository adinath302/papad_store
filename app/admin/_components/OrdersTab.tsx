"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ShoppingBag, Calculator, TrendingDown, TrendingUp, Search, Download, RefreshCw, X } from "lucide-react";
import type { Order } from "./types";
import { statusStyles } from "./types";
import { useToast } from "@/components/Toast/ToastProvider";

type OrdersTabProps = {
  orders: Order[];
  isOwner: boolean;
  hasPerm: (resource: string, action: string) => boolean;
  onOrderChange: () => void;
};

type PaginatedResponse = {
  orders: Order[];
  totalCount: number;
  page: number;
  totalPages: number;
};

const STATUSES = ["", "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];
const BULK_STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function OrdersTab({ isOwner, hasPerm, onOrderChange }: OrdersTabProps) {
  const { toast } = useToast();
  const [data, setData] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [shipCourier, setShipCourier] = useState("IndiaPost - Speed Post");
  const [shipTracking, setShipTracking] = useState("");
  const [exporting, setExporting] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState("");
  const [processingBulk, setProcessingBulk] = useState(false);
  const [processingRefund, setProcessingRefund] = useState<string | null>(null);
  const [refundModal, setRefundModal] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState("");

  const fetchOrders = useCallback(async (page: number, search: string, status: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`/api/orders?${params.toString()}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders(currentPage, searchQuery, statusFilter);
  }, [currentPage, searchQuery, statusFilter, fetchOrders]);

  const handleSearchChange = (value: string) => {
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setSearchQuery(value);
      setCurrentPage(1);
    }, 300);
    const input = document.getElementById("order-search") as HTMLInputElement;
    if (input) input.value = value;
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const updateOrderStatus = async (id: string, status: string) => {
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    onOrderChange();
    fetchOrders(currentPage, searchQuery, statusFilter);
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
    fetchOrders(currentPage, searchQuery, statusFilter);
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (statusFilter) params.set("status", statusFilter);
      params.set("limit", "9999");
      params.set("page", "1");
      const res = await fetch(`/api/orders?${params.toString()}`);
      if (!res.ok) return;
      const { orders: allOrders }: PaginatedResponse = await res.json();

      const headers = ["Order ID", "Date", "Customer", "Phone", "Address", "City", "State", "Pincode", "Payment", "Status", "Items", "Subtotal", "Shipping Charged", "Actual Shipping", "Total", "Courier", "Tracking ID"];
      const rows = allOrders.map((o) => {
        const subtotal = o.totalAmount - o.shippingCost;
        const items = o.orderitem.map((oi) => `${oi.product.name} x${oi.quantity}`).join("; ");
        return [
          o.id,
          new Date(o.createdAt).toISOString().split("T")[0],
          `"${o.fullName}"`,
          o.phone,
          `"${o.address1}${o.address2 ? ", " + o.address2 : ""}"`,
          o.city,
          o.state,
          o.pincode,
          o.paymentType,
          o.status,
          `"${items}"`,
          subtotal,
          o.shippingCost,
          o.actualShippingCost ?? 0,
          o.totalAmount,
          o.courierName || "",
          o.trackingId || "",
        ];
      });

      const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selectedIds.size === 0) return;
    setProcessingBulk(true);
    try {
      const res = await fetch("/api/orders/bulk-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderIds: Array.from(selectedIds), status: bulkStatus }),
      });
      if (res.ok) {
        toast(`Updated ${selectedIds.size} order(s) to ${bulkStatus}`, "success");
        setSelectedIds(new Set());
        setBulkStatus("");
        onOrderChange();
        fetchOrders(currentPage, searchQuery, statusFilter);
      } else {
        const err = await res.json();
        toast(err.error || "Failed to update orders", "error");
      }
    } catch {
      toast("Failed to update orders", "error");
    } finally {
      setProcessingBulk(false);
    }
  };

  const handleRefund = async (order: Order) => {
    if (!order.razorpayPaymentId) return;
    setProcessingRefund(order.id);
    try {
      const res = await fetch("/api/refunds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id, amount: order.totalAmount, reason: refundReason }),
      });
      if (res.ok) {
        toast("Refund processed successfully", "success");
        setRefundModal(null);
        setRefundReason("");
        onOrderChange();
        fetchOrders(currentPage, searchQuery, statusFilter);
      } else {
        const err = await res.json();
        toast(err.error || "Failed to process refund", "error");
      }
    } catch {
      toast("Failed to process refund", "error");
    } finally {
      setProcessingRefund(null);
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    const visibleIds = orders.map((o) => o.id);
    const allSelected = visibleIds.every((id) => selectedIds.has(id));
    if (allSelected) {
      const next = new Set(selectedIds);
      visibleIds.forEach((id) => next.delete(id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      visibleIds.forEach((id) => next.add(id));
      setSelectedIds(next);
    }
  };

  const orders = data?.orders ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const allVisibleSelected = orders.length > 0 && orders.every((o) => selectedIds.has(o.id));

  const getPageNumbers = () => {
    const pages: number[] = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Orders</h1>
          <p className="text-sm text-stone-500 mt-1">{totalCount} order{totalCount !== 1 ? "s" : ""} • Track and manage</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              id="order-search"
              type="text"
              placeholder="Search name or phone..."
              defaultValue={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9 pr-3 py-2 w-56 border border-stone-200 rounded-xl text-sm outline-none focus:border-stone-400 bg-white"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="px-3 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-stone-400 bg-white"
          >
            <option value="">All Status</option>
            {STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>
          <button onClick={exportCSV} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            <Download size={15} />
            {exporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="mb-4 flex items-center gap-3 px-4 py-3 bg-stone-100 rounded-2xl border border-stone-200">
          <span className="text-sm font-semibold text-stone-700">{selectedIds.size} selected</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="px-3 py-1.5 border border-stone-200 rounded-xl text-sm outline-none focus:border-stone-400 bg-white"
          >
            <option value="">Set status...</option>
            {BULK_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
            ))}
          </select>
          <button
            onClick={handleBulkUpdate}
            disabled={!bulkStatus || processingBulk}
            className="flex items-center gap-2 px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50"
          >
            {processingBulk && <RefreshCw size={14} className="animate-spin" />}
            Update Status
          </button>
          <button
            onClick={() => { setSelectedIds(new Set()); setBulkStatus(""); }}
            className="ml-auto text-stone-400 hover:text-stone-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="px-5 py-3.5 w-10">
                      <input
                        type="checkbox"
                        checked={allVisibleSelected}
                        onChange={toggleSelectAll}
                        className="rounded border-stone-300"
                      />
                    </th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Customer</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden md:table-cell">Items</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">Subtotal</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <span>Shipping</span>
                        <Calculator size={11} className="text-stone-400" />
                      </div>
                    </th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Total</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">Payment</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">Date</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const actualCost = order.actualShippingCost ?? 0;
                    const diff = order.shippingCost - actualCost;
                    const hasRefund = order.refund && order.refund.length > 0;
                    const canRefund = order.paymentType !== "COD" && order.razorpayPaymentId && (order.status === "DELIVERED" || order.status === "CANCELLED") && !hasRefund;
                    return (
                    <tr key={order.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(order.id)}
                          onChange={() => toggleSelect(order.id)}
                          className="rounded border-stone-300"
                        />
                      </td>
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
                      <td className="px-5 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            {order.shippingCost > 0 ? (
                              <span className="font-semibold text-stone-700">₹{order.shippingCost}</span>
                            ) : (
                              <span className="text-emerald-600 text-[11px] font-medium">Free</span>
                            )}
                            <span className="text-[10px] text-stone-300">→</span>
                            <span className="font-semibold text-stone-500">₹{actualCost}</span>
                            {diff !== 0 && (
                              <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${diff > 0 ? "text-emerald-600" : "text-red-500"}`}>
                                {diff > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                {diff > 0 ? "+" : ""}₹{diff}
                              </span>
                            )}
                          </div>
                          {order.totalWeight > 0 && (
                            <p className="text-[10px] text-stone-400">
                              {order.totalWeight >= 1000
                                ? `${(order.totalWeight / 1000).toFixed(1)}kg`
                                : `${order.totalWeight}g`}
                              {order.courierName && ` • ${order.courierName}`}
                            </p>
                          )}
                        </div>
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
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          {canRefund && (
                            <button
                              onClick={() => setRefundModal(order)}
                              className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all"
                            >
                              Refund
                            </button>
                          )}
                          {hasRefund && (
                            <span className="px-2.5 py-1 text-[11px] font-medium text-stone-400 bg-stone-100 rounded-lg">
                              Refunded
                            </span>
                          )}
                          <button
                            onClick={() => {
                              const params = new URLSearchParams();
                              params.set("resource", "order");
                              window.open(`/admin?tab=activity${order.id ? `&resourceId=${order.id}` : ""}`, "_blank");
                            }}
                            className="px-2.5 py-1 text-[11px] font-bold text-stone-500 bg-stone-100 rounded-lg hover:bg-stone-200 transition-all"
                          >
                            View Log
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-stone-100">
                <p className="text-xs text-stone-400">
                  Page {currentPage} of {totalPages} ({totalCount} total)
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Previous
                  </button>
                  {getPageNumbers().map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 text-xs font-bold rounded-lg transition-all ${
                        p === currentPage
                          ? "bg-stone-900 text-white"
                          : "text-stone-600 hover:bg-stone-100"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <ShoppingBag size={44} className="mx-auto text-stone-200 mb-4" strokeWidth={1} />
            <p className="text-stone-400 text-sm">No orders found.</p>
          </div>
        )}
      </div>

      {refundModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setRefundModal(null); setRefundReason(""); }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-stone-900 mb-2">Process Refund</h3>
            <p className="text-sm text-stone-500 mb-4">Order #{refundModal.id.slice(0, 8)}</p>
            <div className="mb-4">
              <span className="text-sm text-stone-600">Amount: </span>
              <span className="text-lg font-bold text-stone-900">₹{refundModal.totalAmount}</span>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold text-stone-700 mb-1">Reason (optional)</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Enter reason for refund..."
                rows={3}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-stone-400 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleRefund(refundModal)}
                disabled={processingRefund === refundModal.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-50"
              >
                {processingRefund === refundModal.id && <RefreshCw size={15} className="animate-spin" />}
                Process Refund
              </button>
              <button
                onClick={() => { setRefundModal(null); setRefundReason(""); }}
                className="px-4 py-2.5 text-stone-500 hover:text-stone-700 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
