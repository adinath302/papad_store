"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  ShoppingBag,
  Truck,
  ShieldCheck,
  CreditCard,
  Loader2,
} from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";
import { SkeletonCheckout } from "@/components/Skeleton/Skeleton";
import { getGuestCart, isLoggedIn, clearGuestCart } from "@/lib/guest-cart";
import { calculateShippingFee, FREE_SHIPPING_MIN } from "@/lib/shipping";

interface CartItemType {
  id: string;
  variantId?: string | null;
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

const getItemPrice = (item: CartItemType) => {
  if (item.variantId) {
    const variant = item.product?.productvariant?.find(
      (v) => v.id === item.variantId,
    );
    if (variant) return variant.price;
  }
  return item.product?.productvariant?.[0]?.price ?? 0;
};

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [savedAddress, setSavedAddress] = useState<SavedAddress | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [couriers, setCouriers] = useState<any[]>([]);
  const [selectedCourier, setSelectedCourier] = useState<any | null>(null);
  const [courierLoading, setCourierLoading] = useState(false);
  const [courierError, setCourierError] = useState("");

  const { toast } = useToast();

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

  const [fieldErrors, setFieldErrors] = useState<Set<string>>(new Set());

  const updateField = (field: string, value: string | boolean) => {
    setFieldErrors((prev) => { prev.delete(field); return new Set(prev); });
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const requiredFields = ["fullName", "phone", "address1", "city", "state", "pincode"];

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn()) {
        setIsGuest(true);
        const guestItems = getGuestCart();
        const mapped: CartItemType[] = guestItems.map((gi) => ({
          id: `guest-${gi.productId}-${gi.variantId || "default"}`,
          variantId: gi.variantId,
          product: {
            id: gi.productId,
            name: gi.name,
            image: gi.image,
            productvariant: gi.variantId
              ? [{ id: gi.variantId, label: "", price: gi.price }]
              : [{ id: "", label: "Default", price: gi.price }],
          },
          quantity: gi.quantity,
        }));
        setItems(mapped);
        setLoading(false);
        return;
      }

      setIsGuest(false);
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

  useEffect(() => {
    if (form.pincode.length !== 6 || items.length === 0) {
      setCouriers([]);
      setSelectedCourier(null);
      return;
    }

    let cancelled = false;

    const fetchRates = async () => {
      setCourierLoading(true);
      setCourierError("");
      try {
        const body: any = {
          pincode: form.pincode,
          cod: form.paymentType === "COD",
          items: items.map((item) => ({
            productId: item.product.id,
            variantId: item.variantId || null,
            quantity: item.quantity,
          })),
        };

        const res = await fetch("/api/shipping/rates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (cancelled) return;

        if (data.error) {
          setCourierError(data.error);
          setCouriers([]);
        } else if (data.couriers && data.couriers.length > 0) {
          setCouriers(data.couriers);
          setSelectedCourier(null);
        } else {
          setCouriers([]);
          setCourierError("No courier available for this pincode");
        }
      } catch {
        if (!cancelled) setCourierError("Failed to check shipping rates");
      } finally {
        if (!cancelled) setCourierLoading(false);
      }
    };

    const t = setTimeout(fetchRates, 500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [form.pincode, form.paymentType, items]);


  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + getItemPrice(item) * item.quantity,
        0,
      ),
    [items],
  );

  const shippingCost = useMemo(() => {
    if (selectedCourier) return selectedCourier.rate;
    return calculateShippingFee(subtotal, form.state);
  }, [subtotal, form.state, selectedCourier]);

  const handleRazorpayPayment = useCallback(async () => {
    const body: any = { state: form.state };
    if (isGuest) {
      const guestItems = getGuestCart();
      body.guestItems = guestItems.map((gi) => ({
        productId: gi.productId,
        variantId: gi.variantId || null,
        quantity: gi.quantity,
      }));
    }

    const initRes = await fetch("/api/payment/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const initData = await initRes.json();

    if (initData.error) {
      toast(initData.error, "error");
      setPlacing(false);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      const options = {
        key: initData.key,
        amount: initData.amount,
        currency: initData.currency,
        name: "The Papad Co.",
        description: `Order for ${form.fullName}`,
        order_id: initData.razorpayOrderId,
          handler: async function (response: any) {
            const checkoutBody: any = {
              ...form,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            };
            if (selectedCourier) checkoutBody.shippingMethod = selectedCourier.service;
            if (isGuest) {
              const guestItems = getGuestCart();
              checkoutBody.guestItems = guestItems.map((gi) => ({
                productId: gi.productId,
                variantId: gi.variantId || null,
                quantity: gi.quantity,
              }));
            }

          const checkoutRes = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(checkoutBody),
          });

          const checkoutData = await checkoutRes.json();

          if (checkoutData.error) {
            toast(checkoutData.error, "error");
            setPlacing(false);
            return;
          }

          if (form.saveAddress && !isGuest) {
            await fetch("/api/address", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(form),
            });
          }

          clearGuestCart();
          router.push(`/order-confirmation?id=${checkoutData.id}`);
        },
        modal: {
          ondismiss: function () {
            setPlacing(false);
          },
        },
        prefill: {
          name: form.fullName,
          email: "",
          contact: form.phone,
        },
        theme: {
          color: "#065f46",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function () {
        toast("Payment failed. Please try again.", "error");
        setPlacing(false);
      });
      rzp.open();
    };
    document.body.appendChild(script);
  }, [form, router, isGuest]);

  const handleSubmit = async () => {
    const errors = new Set<string>();
    for (const field of requiredFields) {
      if (!(form as any)[field]?.trim()) errors.add(field);
    }
    if (errors.size > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors(new Set());

    setPlacing(true);

    if (form.paymentType === "Razorpay") {
      await handleRazorpayPayment();
      return;
    }

    try {
      const body: any = { ...form };
      if (selectedCourier) body.shippingMethod = selectedCourier.service;
      if (isGuest) {
        const guestItems = getGuestCart();
        body.guestItems = guestItems.map((gi) => ({
          productId: gi.productId,
          variantId: gi.variantId || null,
          quantity: gi.quantity,
        }));
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.error) {
        toast(data.error, "error");
        setPlacing(false);
        return;
      }

      if (form.saveAddress && !isGuest) {
        await fetch("/api/address", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      clearGuestCart();
      router.push(`/order-confirmation?id=${data.id}`);
    } catch {
      toast("Something went wrong. Please try again.", "error");
      setPlacing(false);
    }
  };

  if (loading) {
    return <SkeletonCheckout />;
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf8f5] pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag size={48} className="mx-auto text-stone-200 mb-4" />
          <h1 className="text-2xl font-serif text-stone-900 mb-2">
            Your cart is empty
          </h1>
          <p className="text-stone-500 mb-6">
            Add some products before checking out.
          </p>
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
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="Full Name"
                      className={`w-full rounded-lg px-4 py-2.5 outline-none bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all ${
                        fieldErrors.has("fullName")
                          ? "border-2 border-red-400 focus:border-red-500"
                          : "border border-stone-200 focus:border-emerald-600"
                      }`}
                    />
                    {fieldErrors.has("fullName") && (
                      <p className="text-[11px] text-red-500 mt-1 ml-1 font-medium">Required</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+91 98765 43210"
                      className={`w-full rounded-lg px-4 py-2.5 outline-none bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all ${
                        fieldErrors.has("phone")
                          ? "border-2 border-red-400 focus:border-red-500"
                          : "border border-stone-200 focus:border-emerald-600"
                      }`}
                    />
                    {fieldErrors.has("phone") && (
                      <p className="text-[11px] text-red-500 mt-1 ml-1 font-medium">Required</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                      Address Line 1 *
                    </label>
                    <input
                      value={form.address1}
                      onChange={(e) => updateField("address1", e.target.value)}
                      placeholder="House no, Building, Street"
                      className={`w-full rounded-lg px-4 py-2.5 outline-none bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all ${
                        fieldErrors.has("address1")
                          ? "border-2 border-red-400 focus:border-red-500"
                          : "border border-stone-200 focus:border-emerald-600"
                      }`}
                    />
                    {fieldErrors.has("address1") && (
                      <p className="text-[11px] text-red-500 mt-1 ml-1 font-medium">Required</p>
                    )}
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
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="City"
                      className={`w-full rounded-lg px-4 py-2.5 outline-none bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all ${
                        fieldErrors.has("city")
                          ? "border-2 border-red-400 focus:border-red-500"
                          : "border border-stone-200 focus:border-emerald-600"
                      }`}
                    />
                    {fieldErrors.has("city") && (
                      <p className="text-[11px] text-red-500 mt-1 ml-1 font-medium">Required</p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                      State *
                    </label>
                    <input
                      value={form.state}
                      onChange={(e) => updateField("state", e.target.value)}
                      placeholder="State"
                      className={`w-full rounded-lg px-4 py-2.5 outline-none bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all ${
                        fieldErrors.has("state")
                          ? "border-2 border-red-400 focus:border-red-500"
                          : "border border-stone-200 focus:border-emerald-600"
                      }`}
                    />
                    {fieldErrors.has("state") && (
                      <p className="text-[11px] text-red-500 mt-1 ml-1 font-medium">Required</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                      Pincode *
                    </label>
                    <input
                      value={form.pincode}
                      onChange={(e) => updateField("pincode", e.target.value)}
                      placeholder="6-digit pincode"
                      className={`w-full rounded-lg px-4 py-2.5 outline-none bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all ${
                        fieldErrors.has("pincode")
                          ? "border-2 border-red-400 focus:border-red-500"
                          : "border border-stone-200 focus:border-emerald-600"
                      }`}
                    />
                    {fieldErrors.has("pincode") && (
                      <p className="text-[11px] text-red-500 mt-1 ml-1 font-medium">Required</p>
                    )}
                  </div>
                </div>

                {form.pincode.length === 6 && (courierLoading || couriers.length > 0 || courierError) && (
                  <div className="pt-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Truck size={16} className="text-emerald-700" />
                      <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                        Shipping Options
                      </span>
                    </div>

                    {courierLoading && (
                      <div className="flex items-center gap-2 text-sm text-stone-400 py-2">
                        <Loader2 size={16} className="animate-spin" />
                        Checking available couriers...
                      </div>
                    )}

                    {courierError && !courierLoading && (
                      <p className="text-sm text-amber-600 py-2">{courierError}</p>
                    )}

                    {!courierLoading && couriers.length > 0 && (
                      <div className="space-y-2">
                        {couriers.map((c: any) => (
                          <label
                            key={c.service}
                            className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all ${
                              selectedCourier?.service === c.service
                                ? "border-emerald-600 bg-emerald-50"
                                : "border-stone-200 hover:border-stone-400"
                            }`}
                          >
                            <input
                              type="radio"
                              name="courier"
                              checked={selectedCourier?.service === c.service}
                              onChange={() => setSelectedCourier(c)}
                              className="accent-emerald-700"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-stone-800">
                                {c.service}
                              </p>
                              {c.estimated_delivery && (
                                <p className="text-xs text-stone-400">
                                  Estimated delivery: {c.estimated_delivery}
                                </p>
                              )}
                            </div>
                            <span className="text-sm font-bold text-stone-800">
                              ₹{c.rate}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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

                <div className="pt-6 border-t border-stone-100">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                    Payment Method *
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 border border-stone-200 rounded-xl cursor-pointer has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 transition-all">
                      <input
                        type="radio"
                        name="paymentType"
                        value="COD"
                        checked={form.paymentType === "COD"}
                        onChange={(e) =>
                          setForm({ ...form, paymentType: e.target.value })
                        }
                        className="accent-emerald-700"
                      />
                      <div>
                        <p className="text-sm font-medium text-stone-800">
                          Cash on Delivery
                        </p>
                        <p className="text-xs text-stone-400">
                          Pay when you receive
                        </p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-4 border border-stone-200 rounded-xl cursor-pointer has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 transition-all">
                      <input
                        type="radio"
                        name="paymentType"
                        value="Razorpay"
                        checked={form.paymentType === "Razorpay"}
                        onChange={(e) =>
                          setForm({ ...form, paymentType: e.target.value })
                        }
                        className="accent-emerald-700"
                      />
                      <div className="flex items-center gap-2">
                        <CreditCard size={18} className="text-emerald-700" />
                        <div>
                          <p className="text-sm font-medium text-stone-800">
                            Pay Online
                          </p>
                          <p className="text-xs text-stone-400">
                            UPI, Card, Net Banking
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-stone-200 p-6 md:p-8 sticky top-28">
              <h2 className="text-lg font-serif text-stone-900 mb-6 flex items-center gap-2">
                <ShoppingBag size={18} className="text-emerald-700" />
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {items.map((item) => {
                  const price = getItemPrice(item);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 pb-4 border-b border-stone-100 last:border-0"
                    >
                      <div className="w-14 h-14 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-cover"
                            loading="lazy"
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
                          Qty: {item.quantity} × ₹{price}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-stone-800">
                        ₹{price * item.quantity}
                      </p>
                    </div>
                  );
                })}
              </div>

                <div className="space-y-3 pt-4 border-t border-stone-100">
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-500">
                    <span>Shipping</span>
                    {shippingCost === 0 ? (
                      <span className="text-emerald-600 font-medium">Free</span>
                    ) : (
                      <span className="text-stone-600">₹{shippingCost}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-lg font-bold text-stone-900 pt-2 border-t border-stone-100">
                    <span>Total</span>
                    <span>₹{subtotal + shippingCost}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-6 text-[10px] text-stone-400 uppercase tracking-wider font-bold">
                  {shippingCost === 0 ? (
                    <span className="flex items-center gap-1.5">
                      <Truck size={14} className="text-emerald-600" /> Free
                      Shipping
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <Truck size={14} className="text-emerald-600" /> ₹
                      {shippingCost} Shipping
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-emerald-600" />{" "}
                    Secure
                  </span>
                </div>

                {subtotal > 0 && subtotal < FREE_SHIPPING_MIN && (
                  <p className="text-xs text-amber-600 text-center mt-2">
                    Add ₹{FREE_SHIPPING_MIN - subtotal} more for free shipping
                  </p>
                )}

          <button
            onClick={handleSubmit}
            disabled={placing}
            className="w-full mt-6 bg-emerald-800 text-white py-4 rounded-xl font-bold text-sm tracking-wide hover:bg-emerald-700 transition-all disabled:bg-stone-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {placing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
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
