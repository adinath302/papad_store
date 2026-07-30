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
} from "lucide-react";
import { useToast } from "@/components/Toast/ToastProvider";
import { SkeletonCheckout } from "@/components/Skeleton/Skeleton";
import { fetchCsrf } from "@/lib/csrf-client";
import { getGuestCart, isLoggedIn, clearGuestCart } from "@/lib/guest-cart";
import { calculateShippingFee, FREE_SHIPPING_MIN } from "@/lib/shipping";

interface CartItemType {
  id: string;
  variantId?: string | null;
  product: {
    id: string;
    name: string;
    image?: string | null;
    stock?: number | null;
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
  const [outOfStockItems, setOutOfStockItems] = useState<string[]>([]);
  const [fetchError, setFetchError] = useState("");

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [discount, setDiscount] = useState(0);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

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
    setFieldErrors((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
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
        const oos: string[] = data
          .filter((item: CartItemType) => item.product.stock === 0 || (item.product.stock != null && item.product.stock < item.quantity))
          .map((item: CartItemType) => item.product.id);
        setOutOfStockItems([...new Set(oos)]);
      } else {
        setFetchError("Failed to load your cart. Please try again.");
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

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + getItemPrice(item) * item.quantity,
        0,
      ),
    [items],
  );

  const shippingCost = useMemo(
    () => calculateShippingFee(subtotal, form.state),
    [subtotal, form.state],
  );

  const applyCoupon = useCallback(async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetchCsrf("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, cartTotal: subtotal + shippingCost }),
      });
      const data = await res.json();
      if (data.error) {
        setCouponError(data.error);
        setAppliedCoupon(null);
        setDiscount(0);
      } else {
        setAppliedCoupon(data);
        if (data.type === "FREE_SHIPPING") {
          setDiscount(shippingCost);
        } else {
          setDiscount(data.discount);
        }
        setCouponError("");
      }
    } catch {
      setCouponError("Failed to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  }, [couponCode, subtotal, shippingCost]);

  const removeCoupon = () => {
    setCouponCode("");
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponError("");
  };

  const handleRazorpayPayment = useCallback(async () => {
    const currentForm = form;
    const currentItems = items;
    const currentCoupon = appliedCoupon;
    const currentIsGuest = isGuest;

    const body: any = { state: currentForm.state, items: currentItems.map((item) => ({
      productId: item.product.id,
      variantId: item.variantId || null,
      quantity: item.quantity,
    })) };
    if (currentCoupon) body.couponCode = currentCoupon.code;

    const initRes = await fetchCsrf("/api/payment/init", {
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

    const options = {
      key: initData.key,
      amount: initData.amount,
      currency: initData.currency,
      name: "The Papad Co.",
      description: `Order for ${currentForm.fullName}`,
      order_id: initData.razorpayOrderId,
      handler: async function (response: any) {
        const checkoutBody: any = {
          ...currentForm,
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        };
        if (currentCoupon) {
          checkoutBody.couponCode = currentCoupon.code;
        }
        checkoutBody.items = currentItems.map((item) => ({
          productId: item.product.id,
          variantId: item.variantId || null,
          quantity: item.quantity,
        }));

        const checkoutRes = await fetchCsrf("/api/checkout", {
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

        if (currentForm.saveAddress && !currentIsGuest) {
          await fetchCsrf("/api/address", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(currentForm),
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
        name: currentForm.fullName,
        email: "",
        contact: currentForm.phone,
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
  }, [form, items, appliedCoupon, isGuest, router, toast]);

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

    if (!/^\d{6}$/.test(form.pincode)) {
      toast("Invalid pincode format", "error");
      setPlacing(false);
      return;
    }
    if (!/^(\+91|0)?[6-9]\d{9}$/.test(form.phone.replace(/\s/g, ""))) {
      toast("Invalid phone number", "error");
      setPlacing(false);
      return;
    }

    setPlacing(true);

    if (form.paymentType === "Razorpay") {
      await handleRazorpayPayment();
      return;
    }

    try {
      const body: any = { ...form };
      if (appliedCoupon) {
        body.couponCode = appliedCoupon.code;
      }
      body.items = items.map((item) => ({
        productId: item.product.id,
        variantId: item.variantId || null,
        quantity: item.quantity,
      }));

      const res = await fetchCsrf("/api/checkout", {
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
        await fetchCsrf("/api/address", {
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

  if (fetchError) {
    return (
      <div className="min-h-screen bg-[#faf8f5] pt-32 pb-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag size={48} className="mx-auto text-stone-200 mb-4" />
          <h1 className="text-2xl font-serif text-stone-900 mb-2">
            {fetchError}
          </h1>
          <Link
            href="/cart"
            className="inline-block px-8 py-3 bg-emerald-800 text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all"
          >
            Back to Cart
          </Link>
        </div>
      </div>
    );
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
            <div className="bg-white rounded-xl border border-stone-200 p-4 md:p-8">
              <div className="flex items-center gap-3 mb-6 md:mb-8">
                <MapPin size={20} className="text-emerald-700" />
                <h2 className="text-lg font-serif text-stone-900">
                  Shipping Address
                </h2>
                {savedAddress && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Saved
                  </span>
                )}
              </div>

              <div className="space-y-4 md:space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
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
                    <label className="flex items-center gap-3 p-3 md:p-4 border border-stone-200 rounded-xl cursor-pointer has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 transition-all">
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

                    <label className="flex items-center gap-3 p-3 md:p-4 border border-stone-200 rounded-xl cursor-pointer has-[:checked]:border-emerald-600 has-[:checked]:bg-emerald-50 transition-all">
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
            <div className="bg-white rounded-xl border border-stone-200 p-4 md:p-8 sticky top-28">
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

                {/* Coupon */}
                <div className="pt-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
                      <div>
                        <span className="text-sm font-bold text-emerald-800">{appliedCoupon.code}</span>
                        <span className="text-xs text-emerald-600 ml-2">
                          {appliedCoupon.type === "FREE_SHIPPING" ? "Free Shipping" : `-₹${discount}`}
                        </span>
                      </div>
                      <button onClick={removeCoupon} className="text-xs text-red-500 hover:text-red-700 font-bold">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Coupon code"
                        className="flex-1 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:border-stone-400 text-sm" />
                      <button onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()}
                        className="px-4 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all disabled:opacity-40">
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-xs text-red-500 mt-1.5">{couponError}</p>}
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
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-emerald-700">
                      <span>Discount</span>
                      <span>-₹{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-stone-900 pt-2 border-t border-stone-100">
                    <span>Total</span>
                    <span>₹{Math.max(0, subtotal + shippingCost - discount)}</span>
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

                {outOfStockItems.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-xs font-bold text-red-700 mb-1">Some items are out of stock:</p>
                    {items
                      .filter((item) => outOfStockItems.includes(item.product.id))
                      .map((item) => (
                        <p key={item.id} className="text-xs text-red-600 ml-2">
                          • {item.product.name}
                        </p>
                      ))}
                    <p className="text-[11px] text-red-500 mt-2">Please go back and remove these items from your cart to proceed.</p>
                  </div>
                )}

          <button
            onClick={handleSubmit}
            disabled={placing || outOfStockItems.length > 0}
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
