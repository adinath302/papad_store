import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Invoice - Shivshambho" };
}

async function getOrder(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      orderitem: { include: { product: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const role = cookieStore.get("role")?.value;

  let order;
  try {
    order = await getOrder(id);
  } catch {
    order = null;
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-[#faf8f5] pt-28 pb-16 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Invoice Not Found</h1>
          <p className="text-stone-500 text-sm mb-6">
            The invoice you are looking for does not exist or could not be loaded.
          </p>
          <Link
            href="/orders"
            className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-all"
          >
            ← Back to Orders
          </Link>
        </div>
      </main>
    );
  }

  const isOwner = order.userId === userId;
  const isAdmin = role === "ADMIN";

  if (!isOwner && !isAdmin) {
    redirect("/");
  }

  const subtotal = order.totalAmount - order.shippingCost;

  return (
    <>
      <div className="print:hidden bg-[#faf8f5] min-h-screen pt-28 pb-16 px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <Link
            href={`/orders/${order.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-700 transition-colors mb-8"
          >
            ← Back to Order
          </Link>
          <div className="bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
            <p className="text-stone-500 text-sm mb-6">
              This page is optimized for printing. Click the button below to
              save or print your invoice.
            </p>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-8 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition-all"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 5V2h8v3" />
                <rect x="2.5" y="7.5" width="11" height="6" rx="1" />
                <path d="M11.5 10h1" />
              </svg>
              Print / Save PDF
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="bg-white min-h-screen print:min-h-0">
        <div className="max-w-[210mm] mx-auto px-8 py-12 print:px-6 print:py-8">
          {/* Header */}
          <div className="border-b-2 border-stone-900 pb-6 mb-8">
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Shivshambho
            </h1>
            <p className="text-sm text-stone-500 mt-1">
              Crafted with tradition since 1984
            </p>
          </div>

          {/* Invoice Title + Order Info */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 tracking-tight">
                INVOICE
              </h2>
              <p className="text-sm text-stone-500 mt-1">
                #{order.id.slice(0, 12).toUpperCase()}
              </p>
            </div>
            <div className="text-right text-sm text-stone-600">
              <p>
                <span className="text-stone-400">Date:</span>{" "}
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              <p className="mt-0.5">
                <span className="text-stone-400">Status:</span>{" "}
                <span
                  className={`font-semibold ${
                    order.status === "CANCELLED"
                      ? "text-red-600"
                      : "text-emerald-700"
                  }`}
                >
                  {order.status}
                </span>
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                Bill To
              </h3>
              <p className="font-semibold text-stone-900">{order.fullName}</p>
              <p className="text-stone-600 mt-0.5">{order.phone}</p>
              <p className="text-stone-600 mt-1">
                {order.address1}
                {order.address2 ? `, ${order.address2}` : ""}
                <br />
                {order.city}, {order.state} - {order.pincode}
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                Payment
              </h3>
              <p className="text-stone-900 font-semibold">
                {order.paymentType === "COD"
                  ? "Cash on Delivery"
                  : order.paymentType}
              </p>
              {order.razorpayPaymentId && (
                <p className="text-xs text-stone-400 font-mono mt-1 break-all">
                  {order.razorpayPaymentId}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-sm mb-8">
            <thead>
              <tr className="border-b-2 border-stone-900">
                <th className="text-left py-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Item
                </th>
                <th className="text-center py-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Qty
                </th>
                <th className="text-right py-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {order.orderitem.map((item: { id: string; quantity: number; price: number | null; product: { name: string } }) => (
                <tr
                  key={item.id}
                  className="border-b border-stone-100 last:border-0"
                >
                  <td className="py-3 text-stone-900">{item.product.name}</td>
                  <td className="py-3 text-center text-stone-600">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-right text-stone-900 font-mono">
                    —
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-1.5 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Subtotal</span>
                <span className="font-mono">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Shipping</span>
                <span className="font-mono">₹{order.shippingCost}</span>
              </div>
              <div className="flex justify-between text-stone-900 font-bold text-base pt-2 border-t-2 border-stone-900">
                <span>Total</span>
                <span className="font-mono">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Tracking */}
          {order.trackingId && order.trackingId !== "PENDING" && (
            <div className="border-t border-stone-200 pt-6 mb-8">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                Tracking Information
              </h3>
              <div className="text-sm text-stone-700">
                <p>
                  <span className="text-stone-400">Courier:</span>{" "}
                  {order.courierName || "—"}
                </p>
                <p className="font-mono text-xs text-stone-500 mt-0.5">
                  {order.trackingId}
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-stone-200 pt-6 text-center text-xs text-stone-400">
            <p className="font-semibold text-stone-600">
              Shivshambho — Crafted with tradition since 1984
            </p>
            <p className="mt-1">
              Thank you for your order! For inquiries, please contact our
              support team.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
