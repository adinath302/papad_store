"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  CreditCard,
  X,
  Loader2,
  FileText,
} from "lucide-react";
import { fetchCsrf } from "@/lib/csrf-client";
import { useToast } from "@/components/Toast/ToastProvider";

type Product = { id: string; name: string; nameMarathi?: string | null };
type OrderItem = { id: string; quantity: number; product: Product };
type Refund = {
  id: string;
  amount: number;
  reason: string | null;
  status: string;
  razorpayRefundId: string | null;
  createdAt: string;
};

type Order = {
  id: string;
  userId: string | null;
  totalAmount: number;
  shippingCost: number;
  status: string;
  fullName: string;
  phone: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  pincode: string;
  paymentType: string;
  razorpayPaymentId: string | null;
  courierName: string | null;
  trackingId: string | null;
  createdAt: string;
  orderitem: OrderItem[];
  refund: Refund[];
  user: { id: string; name: string | null; email: string } | null;
};

const STEPS = [
  { key: "PENDING", label: "Order Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
];

const STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  SHIPPED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  DELIVERED: "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
  CANCELLED: "bg-red-50 text-red-600 ring-1 ring-red-200",
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/user/${id}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          toast(err.error || "Failed to load order", "error");
          return null;
        }
        return res.json();
      })
      .then((data) => setOrder(data))
      .catch(() => toast("Failed to load order", "error"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      const res = await fetchCsrf("/api/orders/user/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: id }),
      });
      if (!res.ok) {
        const err = await res.json();
        toast(err.error || "Failed to cancel order", "error");
        return;
      }
      const updated = await res.json();
      setOrder(updated);
      toast("Order cancelled successfully", "success");
    } catch {
      toast("Something went wrong", "error");
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] pt-28 pb-16 px-4 md:px-6 flex items-center justify-center">
        <Loader2 size={32} className="text-stone-300 animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#faf8f5] pt-28 pb-16 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center py-20">
          <Package size={48} className="mx-auto text-stone-200 mb-4" />
          <p className="text-stone-500 text-lg">Order not found</p>
          <Link
            href="/orders"
            className="inline-block mt-6 text-emerald-700 hover:text-emerald-600 text-sm font-bold"
          >
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  const isCancelled = order.status === "CANCELLED";
  const currentStepIndex = STEPS.findIndex((s) => s.key === order.status);
  const subtotal = order.totalAmount - order.shippingCost;
  const hasRefund = order.refund && order.refund.length > 0;

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-28 pb-16 px-4 md:px-6">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Orders
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl md:text-2xl font-serif text-stone-900">
                  Order #{order.id.slice(0, 8)}
                </h1>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${STATUS_STYLE[order.status] || "bg-stone-50 text-stone-600"}`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-sm text-stone-400 mt-1.5">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                at{" "}
                {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <Link
              href={`/order/${order.id}/invoice`}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-stone-700 bg-stone-50 hover:bg-stone-100 rounded-xl transition-colors"
            >
              <FileText size={16} /> Invoice
            </Link>
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4">
            Items
          </h2>
          <div className="divide-y divide-stone-100">
            {order.orderitem.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <span className="text-stone-800 font-medium">
                  {item.product.name}
                </span>
                <span className="text-stone-500 text-sm">x{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary + Address */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4">
              Order Summary
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span>₹{order.shippingCost}</span>
              </div>
              <div className="flex justify-between text-stone-900 font-bold text-base pt-2 border-t border-stone-200">
                <span>Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-2">
              <MapPin size={14} /> Shipping Address
            </h2>
            <div className="text-sm text-stone-700 space-y-1">
              <p className="font-semibold text-stone-900">{order.fullName}</p>
              <p>{order.phone}</p>
              <p>
                {order.address1}
                {order.address2 ? `, ${order.address2}` : ""}
              </p>
              <p>
                {order.city}, {order.state} - {order.pincode}
              </p>
            </div>
          </div>
        </div>

        {/* Payment + Tracking */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-2">
              <CreditCard size={14} /> Payment
            </h2>
            <div className="text-sm text-stone-700 space-y-1">
              <p>
                <span className="text-stone-400">Method:</span>{" "}
                {order.paymentType === "COD"
                  ? "Cash on Delivery"
                  : order.paymentType}
              </p>
              {order.razorpayPaymentId && (
                <p className="font-mono text-xs text-stone-400 break-all">
                  Payment ID: {order.razorpayPaymentId}
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4 flex items-center gap-2">
              <Truck size={14} /> Tracking
            </h2>
            {order.trackingId && order.trackingId !== "PENDING" ? (
              <div className="text-sm text-stone-700 space-y-1">
                <p>
                  <span className="text-stone-400">Courier:</span>{" "}
                  {order.courierName || "—"}
                </p>
                <p className="font-mono text-xs text-stone-500">
                  {order.trackingId}
                </p>
                <Link
                  href={`/track?order=${order.id}`}
                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-600 font-bold text-xs mt-2 transition-colors"
                >
                  <Truck size={14} /> Track Order
                </Link>
              </div>
            ) : (
              <p className="text-sm text-stone-400">
                {isCancelled
                  ? "Order was cancelled."
                  : "Tracking details will appear once shipped."}
              </p>
            )}
          </div>
        </div>

        {/* Refund Info */}
        {hasRefund && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mb-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-4">
              Refund
            </h2>
            {order.refund.map((r) => (
              <div key={r.id} className="text-sm text-stone-700 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-stone-400">Amount:</span>
                  <span className="font-semibold">₹{r.amount}</span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      r.status === "PROCESSED"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                {r.reason && (
                  <p>
                    <span className="text-stone-400">Reason:</span> {r.reason}
                  </p>
                )}
                {r.razorpayRefundId && (
                  <p className="font-mono text-xs text-stone-400 break-all">
                    Refund ID: {r.razorpayRefundId}
                  </p>
                )}
                <p className="text-xs text-stone-400">
                  {new Date(r.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-400 mb-6">
            Timeline
          </h2>
          <div className="relative">
            {STEPS.map((step, i) => {
              if (isCancelled && i > 0 && i > currentStepIndex) return null;

              const isCompleted = !isCancelled && i < currentStepIndex;
              const isCurrent = !isCancelled && i === currentStepIndex;
              const isCancelledStep = isCancelled && i === 0;

              const circleBg = isCompleted
                ? "bg-emerald-500"
                : isCancelledStep
                  ? "bg-red-500"
                  : isCurrent
                    ? "bg-emerald-500 ring-4 ring-emerald-100"
                    : "bg-stone-200";

              const textColor = isCompleted || isCurrent || isCancelledStep
                ? "text-stone-900"
                : "text-stone-400";

              return (
                <div key={step.key} className="flex gap-4 pb-8 last:pb-0 relative">
                  {i < STEPS.length - 1 && (!isCancelled || i === 0) && (
                    <div
                      className={`absolute left-[11px] top-6 w-0.5 h-full ${
                        isCompleted || (isCancelled && i === 0)
                          ? "bg-emerald-200"
                          : "bg-stone-200"
                      }`}
                    />
                  )}
                  <div
                    className={`size-6 rounded-full shrink-0 flex items-center justify-center ${circleBg} ${
                      isCurrent ? "animate-pulse" : ""
                    }`}
                  >
                    {isCompleted ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2.5 6l2.5 2.5 4.5-5" />
                      </svg>
                    ) : isCancelledStep ? (
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M3 3l6 6M9 3l-6 6" />
                      </svg>
                    ) : null}
                  </div>
                  <div className={`pt-0.5 ${textColor}`}>
                    <p
                      className={`text-sm font-semibold ${
                        isCurrent ? "text-emerald-700" : ""
                      }`}
                    >
                      {step.label}
                    </p>
                    {isCurrent && !isCancelled && (
                      <p className="text-xs text-emerald-600 mt-0.5">
                        {order.status === "PENDING"
                          ? "Awaiting confirmation"
                          : order.status === "CONFIRMED"
                            ? "Order confirmed"
                            : order.status === "SHIPPED"
                              ? "In transit"
                              : "Delivered"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
            {isCancelled && (
              <div className="flex gap-4">
                <div className="size-6 rounded-full shrink-0 bg-red-500 flex items-center justify-center">
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  >
                    <path d="M3 3l6 6M9 3l-6 6" />
                  </svg>
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-semibold text-red-600">
                    Cancelled
                  </p>
                  <p className="text-xs text-red-500 mt-0.5">
                    This order has been cancelled
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cancel Button */}
        {order.status === "PENDING" && (
          <>
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full py-3.5 bg-white border-2 border-red-200 text-red-600 rounded-2xl text-sm font-bold hover:bg-red-50 hover:border-red-300 transition-all flex items-center justify-center gap-2"
            >
              <X size={16} /> Cancel Order
            </button>

            {showCancelModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                  <h3 className="text-lg font-bold text-stone-900 mb-2">
                    Cancel this order?
                  </h3>
                  <p className="text-sm text-stone-500 mb-6">
                    This action cannot be undone. Your order will be cancelled
                    and any paid amount will be refunded.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowCancelModal(false)}
                      disabled={cancelling}
                      className="flex-1 py-2.5 border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-all"
                    >
                      Keep Order
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {cancelling ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : null}
                      {cancelling ? "Cancelling..." : "Yes, Cancel"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
