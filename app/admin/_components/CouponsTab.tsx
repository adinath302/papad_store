"use client";

import { useState, useEffect } from "react";
import { Tag, Plus, Trash2, Check, X } from "lucide-react";
import { fetchCsrf } from "@/lib/csrf-client";

type Coupon = {
  id: string;
  code: string;
  type: string;
  value: number;
  minCartValue: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

type CouponsTabProps = {
  isOwner: boolean;
  toast: (msg: string, type: "success" | "error") => void;
};

export default function CouponsTab({ isOwner, toast }: CouponsTabProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: "", type: "PERCENTAGE", value: "", minCartValue: "",
    maxDiscount: "", usageLimit: "", expiresAt: "",
  });

  const fetchCoupons = async () => {
    const res = await fetch("/api/admin/coupons");
    if (res.ok) setCoupons(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      minCartValue: form.minCartValue ? Number(form.minCartValue) : null,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
      expiresAt: form.expiresAt || null,
    };
    const res = await fetchCsrf("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast("Coupon created!", "success");
      setShowForm(false);
      setForm({ code: "", type: "PERCENTAGE", value: "", minCartValue: "", maxDiscount: "", usageLimit: "", expiresAt: "" });
      fetchCoupons();
    } else {
      const err = await res.json();
      toast(`Error: ${err.error}`, "error");
    }
  };

  const toggleActive = async (coupon: Coupon) => {
    await fetchCsrf("/api/admin/coupons", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive }),
    });
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await fetchCsrf("/api/admin/coupons", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchCoupons();
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-3 mb-6 md:mb-8">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-stone-900 tracking-tight">Coupons</h1>
          <p className="text-xs md:text-sm text-stone-500 mt-0.5">{coupons.length} coupon{coupons.length !== 1 ? "s" : ""} • Manage discounts</p>
        </div>
        {isOwner && (
          <button onClick={() => setShowForm(!showForm)}
            className="shrink-0 flex items-center gap-1.5 px-3 md:px-5 py-2 md:py-2.5 bg-stone-900 text-white rounded-lg md:rounded-xl text-[11px] md:text-xs font-bold hover:bg-stone-800 transition-all shadow-sm">
            <Plus size={14} strokeWidth={2.5} /> {showForm ? "Cancel" : "Add Coupon"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mb-8 shadow-sm">
          <h2 className="text-lg font-bold text-stone-900 mb-6">New Coupon</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">Code</label>
                <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SAVE10"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-400 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">Type</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-400 text-sm bg-white">
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                  <option value="FREE_SHIPPING">Free Shipping</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">
                  {form.type === "PERCENTAGE" ? "Percentage Off" : form.type === "FIXED" ? "Amount Off (₹)" : "Value"}
                </label>
                <input required type="number" value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  placeholder={form.type === "PERCENTAGE" ? "10" : form.type === "FIXED" ? "50" : "0"}
                  disabled={form.type === "FREE_SHIPPING"}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-400 text-sm disabled:opacity-40" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">Min Cart Value (₹)</label>
                <input type="number" value={form.minCartValue} onChange={(e) => setForm({ ...form, minCartValue: e.target.value })}
                  placeholder="Optional"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-400 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">Max Discount (₹)</label>
                <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
                  placeholder="For percentage only"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-400 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">Usage Limit</label>
                <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  placeholder="Unlimited"
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-400 text-sm" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">Expiry Date</label>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-400 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)}
                className="px-6 py-2.5 text-xs font-bold text-stone-500 hover:text-stone-700">Cancel</button>
              <button type="submit"
                className="px-8 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 shadow-sm">Create Coupon</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-20 text-stone-400 text-sm">Loading...</div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-20">
            <Tag size={44} className="mx-auto text-stone-200 mb-4" strokeWidth={1} />
            <p className="text-stone-400 text-sm mb-4">No coupons yet</p>
            {isOwner && (
              <button onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 shadow-sm">
                <Plus size={15} /> Create Your First Coupon
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Code</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden md:table-cell">Type</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">Value</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">Used</th>
                    <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50">
                      <td className="px-5 py-4">
                        <span className="font-mono font-bold text-stone-800">{coupon.code}</span>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <span className="text-xs text-stone-500">{coupon.type === "PERCENTAGE" ? "Percentage" : coupon.type === "FIXED" ? "Fixed" : "Free Shipping"}</span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-stone-600">
                        {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : coupon.type === "FIXED" ? `₹${coupon.value}` : "—"}
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-stone-500 text-xs">
                        {coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${coupon.isActive ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                          {coupon.isActive ? <Check size={11} /> : <X size={11} />}
                          {coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        {isOwner && (
                          <>
                            <button onClick={() => toggleActive(coupon)}
                              className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all mr-1"
                              title={coupon.isActive ? "Deactivate" : "Activate"}>
                              {coupon.isActive ? <X size={15} /> : <Check size={15} />}
                            </button>
                            <button onClick={() => deleteCoupon(coupon.id)}
                              className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete coupon">
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sm:hidden divide-y divide-stone-100">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono font-bold text-stone-800 text-sm">{coupon.code}</p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                      <span>{coupon.type === "PERCENTAGE" ? `${coupon.value}%` : coupon.type === "FIXED" ? `₹${coupon.value}` : "Free Shipping"}</span>
                      <span>•</span>
                      <span>Used: {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ""}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${coupon.isActive ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"}`}>
                      {coupon.isActive ? "Active" : "Inactive"}
                    </span>
                    {isOwner && (
                      <>
                        <button onClick={() => toggleActive(coupon)} className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg" title={coupon.isActive ? "Deactivate" : "Activate"}>
                          {coupon.isActive ? <X size={13} /> : <Check size={13} />}
                        </button>
                        <button onClick={() => deleteCoupon(coupon.id)} className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete coupon">
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
            </div>
        ))}
            </div>
            </>
        )}
      </div>
    </div>
  );
}
