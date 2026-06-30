"use client";

import { useState } from "react";
import { Bell, Loader2, Check } from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";

export default function StockNotificationForm({
  productId,
  inStock,
}: {
  productId: string;
  inStock: boolean;
}) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { toast } = useToast();

  if (inStock) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stock-notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, productId }),
      });
      if (res.status === 409) {
        toast("You are already subscribed for this product", "warning");
        return;
      }
      if (!res.ok) {
        toast("Failed to subscribe. Please try again.", "error");
        return;
      }
      setSubscribed(true);
      toast("We'll notify you when this product is back in stock!", "success");
    } catch {
      toast("Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="mt-8 p-5 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-3">
        <Check size={20} className="text-emerald-700 shrink-0" />
        <p className="text-sm text-emerald-800 font-medium">
          You'll be notified when this product is back in stock.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 p-5 bg-white rounded-xl border border-stone-200"
    >
      <div className="flex items-center gap-2 mb-3">
        <Bell size={16} className="text-emerald-700" />
        <h3 className="text-sm font-bold text-stone-900">
          Notify me when back in stock
        </h3>
      </div>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          className="flex-1 px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-700/20 focus:border-emerald-700 bg-stone-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : "Notify"}
        </button>
      </div>
    </form>
  );
}
