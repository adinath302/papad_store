"use client";

import { useEffect, useState } from "react";
export const dynamic = "force-dynamic";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Package,
  MapPin,
  CreditCard,
  Truck,
} from "lucide-react";
import { SkeletonOrderConfirmation } from "@/components/Skeleton/Skeleton";

type Order = {
  id: string;
  totalAmount: number;
  trackingId: string | null;
  courierName: string | null;
  status: string;
  paymentType: string;
  fullName: string;
  phone: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  pincode: string;
  createdAt: string;
  orderitem: {
    id: string;
    quantity: number;
    product: { id: string; name: string };
  }[];
};

export default function OrderConfirmationPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    fetch(`/api/orders/${orderId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return <SkeletonOrderConfirmation />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#faf8f5] pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-stone-900 mb-2">
            Order not found
          </h1>
          <Link
            href="/orders"
            className="text-emerald-700 hover:underline text-sm"
          >
            View your orders →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-28 pb-16 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Success Banner */}
        <div className="bg-white rounded-2xl border border-stone-200 p-8 md:p-12 text-center mb-8">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif text-stone-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-stone-500">
            Thank you for your order, {order.fullName}!
          </p>
          <p className="text-xs text-stone-400 font-mono mt-4">
            Order #{order.id.slice(0, 12).toUpperCase()}
          </p>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Package size={20} className="text-emerald-700" />
            <h2 className="text-lg font-serif text-stone-900">
              Items Ordered
            </h2>
          </div>

          <div className="space-y-4">
            {order.orderitem.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between pb-4 border-b border-stone-100 last:border-0 last:pb-0"
              >
                <span className="text-stone-700 text-sm">
                  {item.product.name}
                </span>
                <span className="text-stone-500 text-sm">x{item.quantity}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-stone-100 space-y-2">
            <div className="flex items-center justify-between font-semibold text-stone-900">
              <span>Total Paid</span>
              <span className="text-2xl font-bold">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin size={20} className="text-emerald-700" />
            <h2 className="text-lg font-serif text-stone-900">
              Shipping Address
            </h2>
          </div>
          <div className="text-sm text-stone-600 space-y-1">
            <p className="font-medium text-stone-800">{order.fullName}</p>
            <p>{order.phone}</p>
            <p>
              {order.address1}
              {order.address2 && `, ${order.address2}`}
            </p>
            <p>
              {order.city}, {order.state} - {order.pincode}
            </p>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard size={20} className="text-emerald-700" />
            <h2 className="text-lg font-serif text-stone-900">Payment</h2>
          </div>
          <p className="text-sm text-stone-600">
            {order.paymentType === "COD"
              ? "Cash on Delivery"
              : order.paymentType}
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-stone-500 bg-stone-50 rounded-xl p-4">
            <span className="w-2 h-2 bg-amber-500 rounded-full shrink-0" />
            Your order is{" "}
            <span className="font-bold uppercase tracking-wider text-amber-700">
              {order.status}
            </span>
            . We&apos;ll notify you when it ships.
          </div>
        </div>

        {/* Tracking */}
        {order.trackingId && order.trackingId !== "PENDING" && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Truck size={20} className="text-emerald-700" />
              <h2 className="text-lg font-serif text-stone-900">Tracking</h2>
            </div>
            <div className="text-sm text-stone-600 space-y-2">
              <div className="flex items-center justify-between bg-stone-50 rounded-xl p-4">
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">
                    Courier
                  </p>
                  <p className="font-medium text-stone-800 mt-0.5">
                    {order.courierName || "Shiprocket"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone-400 uppercase tracking-wider font-medium">
                    Tracking ID
                  </p>
                  <p className="font-mono font-bold text-stone-800 mt-0.5 text-sm">
                    {order.trackingId}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/orders"
            className="flex-1 text-center px-8 py-4 bg-stone-900 text-white rounded-xl font-bold text-sm tracking-wide hover:bg-stone-800 transition-all"
          >
            View All Orders
          </Link>
          <Link
            href="/products"
            className="flex-1 text-center px-8 py-4 bg-white text-stone-900 rounded-xl font-bold text-sm tracking-wide border border-stone-200 hover:bg-stone-50 transition-all"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
