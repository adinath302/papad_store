"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard, Truck, ChevronDown } from "lucide-react";

export default function CheckoutPage() {
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    paymentType: "COD",
  });

  const handleSubmit = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    alert("Order placed successfully");
    window.location.href = "/orders";
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <Link href="/products" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors mb-6 text-sm font-medium">
            <ArrowLeft size={16} />
            Back to shopping
          </Link>
          <h1 className="text-4xl font-serif text-zinc-900">Shipping Details</h1>
          <p className="text-zinc-500 mt-2 font-light">Complete your purchase by providing your delivery information.</p>
        </div>

        {/* Form Grid */}
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
            
            {/* Full Name */}
            <div className="md:col-span-2 group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Full Name</label>
              <input
                className="w-full border-b border-zinc-200 py-3 outline-none focus:border-amber-600 bg-transparent transition-all text-zinc-900 placeholder:text-zinc-200"
                placeholder="Name as per records"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              />
            </div>

            {/* Phone */}
            <div className="md:col-span-2 group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Phone Number</label>
              <input
                className="w-full border-b border-zinc-200 py-3 outline-none focus:border-amber-600 bg-transparent transition-all text-zinc-900 placeholder:text-zinc-200"
                placeholder="+91"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2 group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Full Address</label>
              <textarea
                className="w-full border-b border-zinc-200 py-3 outline-none focus:border-amber-600 bg-transparent transition-all text-zinc-900 placeholder:text-zinc-200 resize-none"
                placeholder="House no, Building, Street..."
                rows={1}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>

            {/* City */}
            <div className="group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">City</label>
              <input
                className="w-full border-b border-zinc-200 py-3 outline-none focus:border-amber-600 bg-transparent transition-all text-zinc-900 placeholder:text-zinc-200"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>

            {/* State */}
            <div className="group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">State</label>
              <input
                className="w-full border-b border-zinc-200 py-3 outline-none focus:border-amber-600 bg-transparent transition-all text-zinc-900 placeholder:text-zinc-200"
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </div>

            {/* Pincode */}
            <div className="group">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Pincode</label>
              <input
                className="w-full border-b border-zinc-200 py-3 outline-none focus:border-amber-600 bg-transparent transition-all text-zinc-900 placeholder:text-zinc-200"
                placeholder="6 digits"
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </div>

            {/* Payment Type */}
            <div className="group relative">
              <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">Payment Method</label>
              <select
                className="w-full border-b border-zinc-200 py-3 outline-none focus:border-amber-600 bg-transparent transition-all text-zinc-900 appearance-none cursor-pointer"
                value={form.paymentType}
                onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
              >
                <option value="COD">Cash On Delivery</option>
                <option value="Razorpay">Razorpay (Online)</option>
              </select>
              <ChevronDown className="absolute right-0 bottom-3 text-zinc-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Footer Section */}
          <div className="pt-12 border-t border-zinc-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-8 text-zinc-400">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <Truck size={14} className="text-amber-600" />
                  Standard Delivery
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                  <CreditCard size={14} className="text-amber-600" />
                  Secure Payment
                </div>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full md:w-auto bg-zinc-900 text-white px-16 py-5 rounded-full font-bold hover:bg-zinc-800 transition-all shadow-2xl shadow-zinc-200 active:scale-95"
              >
                Place Order
              </button>
            </div>
            <p className="text-center md:text-right mt-6 text-[10px] text-zinc-300 font-bold uppercase tracking-[0.2em]">
              Confirming order for doorstep delivery
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}