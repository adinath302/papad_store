"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, ShoppingBag, Truck, ShieldCheck, Loader2 } from "lucide-react";

interface CartItemType {
  id: string;
  product: {
    id: string;
    name: string;
    image?: string | null;
    productvariant: Array<{ id: string; label: string; price: number }>;
  };
  quantity: number;
}

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  pincode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    paymentType: "COD",
    saveAddress: true,
  });

  useEffect(() => {
    const fetchData = async () => {
      const [cartRes, addrRes] = await Promise.all([
        fetch("/api/cart"),
        fetch("/api/address"),
      ]);

      if (cartRes.ok) {
        const data = await cartRes.json();
        setItems(data);
      }

      if (addrRes.ok) {
        const addresses: SavedAddress[] = await addrRes.json();
        if (addresses.length > 0) {
          const addr = addresses[0];
          setSavedAddress(addr);
          setForm((prev) => ({
            ...prev,
            fullName: addr.fullName,
            phone: addr.phone,
            address1: addr.address1,
            address2: addr.address2 || "",
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
          }));
        }
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const getItemPrice = (item: CartItemType) => {
    const variants = item.product?.productvariant ?? [];
    return variants.length > 0 ? Math.min(...variants.map((v) => v.price)) : 0;
  };

  const subtotal = items.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0,
  );

  const handleSubmit = async () => {
    if (!form.fullName || !form.phone || !form.address1 || !form.city || !form.state || !form.pincode) {
      alert("Please fill in all required fields");
      return;
    }

    setPlacing(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.error) {
        alert(data.error);
        setPlacing(false);
        return;
      }

      if (form.saveAddress) {
        await fetch("/api/address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      router.push("/orders");
    } catch {
      alert("Something went wrong. Please try again.");
      setPlacing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-emerald-800" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf8f5] pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag size={48} className="mx-auto text-stone-200 mb-4" />
          <h1 className="text-2xl font-serif text-stone-900 mb-2">Your cart is empty</h1>
          <p className="text-stone-500 mb-6">Add some products before checking out.</p>
          <Link
            href="/products"
            className="inline-block px-8 py-3 bg-emerald-800 text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] pt-28 pb-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-stone-400 hover:text-stone-700 transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Cart
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-10">
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-stone-200 p-6 md:p-8">
              <div className="flex items-center gap-3 mb-8">
                <MapPin size={20} className="text-emerald-700" />
                <h2 className="text-lg font-serif text-stone-900">
                  Shipping Address
                </h2>
                {savedAddress && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Saved address loaded
                  </span>
                )}
              </div>

              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                      Full Name *
                    </label>
                    <input
                      value={form.fullName}
                      onChange={(e) =>
                        setForm({ ...form, fullName: e.target.value })
                      }
                      placeholder="Full Name"
                      className="w-full border border-stone-200 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-600 bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) =>
                        setForm({ ...form, phone: e.target.value })
                      }
                      placeholder="+91 98765 43210"
                      className="w-full border border-stone-200 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-600 bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                      Address Line 1 *
                    </label>
                    <input
                      value={form.address1}
                      onChange={(e) =>
                        setForm({ ...form, address1: e.target.value })
                      }
                      placeholder="House no, Building, Street"
                      className="w-full border border-stone-200 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-600 bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      value={form.address2}
                      onChange={(e) =>
                        setForm({ ...form, address2: e.target.value })
                      }
                      placeholder="Apartment, Landmark"
                      className="w-full border border-stone-200 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-600 bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                      City *
                    </label>
                    <input
                      value={form.city}
                      onChange={(e) =>
                        setForm({ ...form, city: e.target.value })
                      }
                      placeholder="City"
                      className="w-full border border-stone-200 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-600 bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                      State *
                    </label>
                    <input
                      value={form.state}
                      onChange={(e) =>
                        setForm({ ...form, state: e.target.value })
                      }
                      placeholder="State"
                      className="w-full border border-stone-200 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-600 bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                      Pincode *
                    </label>
                    <input
                      value={form.pincode}
                      onChange={(e) =>
                        setForm({ ...form, pincode: e.target.value })
                      }
                      placeholder="6-digit pincode"
                      className="w-full border border-stone-200 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-600 bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                    />
                  </div>
                </div>

                {/* Save address toggle */}
                <label className="flex items-center gap-3 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={form.saveAddress}
                    onChange={(e) =>
                      setForm({ ...form, saveAddress: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-500 accent-emerald-700"
                  />
                  <span className="text-sm text-stone-600">
                    Save this address for future orders
                  </span>
                </label>

                {/* Payment */}
                <div className="pt-6 border-t border-stone-100">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                    Payment Method *
                  </label>
                  <select
                    value={form.paymentType}
                    onChange={(e) =>
                      setForm({ ...form, paymentType: e.target.value })
                    }
                    className="w-full border border-stone-200 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-600 bg-transparent text-stone-900 text-sm transition-all"
                  >
                    <option value="COD">Cash on Delivery</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-stone-200 p-6 md:p-8 sticky top-28">
              <h2 className="text-lg font-serif text-stone-900 mb-6 flex items-center gap-2">
                <ShoppingBag size={18} className="text-emerald-700" />
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 pb-4 border-b border-stone-100 last:border-0"
                  >
                    <div className="w-14 h-14 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">
                          No img
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-stone-800 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-stone-400">
                        Qty: {item.quantity} × ₹{getItemPrice(item)}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-stone-800">
                      ₹{getItemPrice(item) * item.quantity}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-stone-100">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-stone-900 pt-2 border-t border-stone-100">
                  <span>Total</span>
                  <span>₹{subtotal}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-6 text-[10px] text-stone-400 uppercase tracking-wider font-bold">
                <span className="flex items-center gap-1.5">
                  <Truck size={14} className="text-emerald-600" /> Free Shipping
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" /> Secure
                </span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={placing}
                className="w-full mt-6 bg-emerald-800 text-white py-4 rounded-xl font-bold text-sm tracking-wide hover:bg-emerald-700 transition-all disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {placing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
