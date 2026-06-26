"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  LogOut,
  MapPin,
  Package,
  Plus,
  ChevronRight,
  Edit3,
  Save,
  X,
  Phone,
  Home,
  Clock,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import { SkeletonProfile, SkeletonAddresses, SkeletonOrders } from "@/components/Skeleton/Skeleton";

type UserDetails = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
  isAdmin?: boolean;
};

type Address = {
  id: string;
  fullName: string;
  phone: string;
  address1: string;
  address2?: string | null;
  city: string;
  state: string;
  pincode: string;
  saveAddress: boolean;
};

type OrderItem = {
  id: string;
  quantity: number;
  product: { id: string; name: string };
};

type Order = {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  trackingId: string | null;
  orderitem: OrderItem[];
};

const tabs = ["Account", "Addresses", "Orders"] as const;
type Tab = (typeof tabs)[number];

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  SHIPPED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  DELIVERED: "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
  CANCELLED: "bg-red-50 text-red-600 ring-1 ring-red-200",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProfilePage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState<UserDetails | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Account");

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddAddress, setShowAddAddress] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) {
          router.push("/login");
          return;
        }
        setUser(data.user);
        setNewName(data.user.name || "");
        setChecking(false);
      })
      .catch(() => {
        router.push("/login");
      });
  }, [router]);

  const loadAddresses = async () => {
    setAddressesLoading(true);
    try {
      const res = await fetch("/api/address");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch {}
    setAddressesLoading(false);
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders/user");
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch {}
    setOrdersLoading(false);
  };

  useEffect(() => {
    if (!checking && user) {
      if (activeTab === "Addresses") loadAddresses();
      if (activeTab === "Orders") loadOrders();
    }
  }, [activeTab, checking, user]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  };

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      await fetch("/api/auth/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      setUser((prev) => (prev ? { ...prev, name: newName } : prev));
      setEditingName(false);
    } catch {}
    setSavingName(false);
  };

  const handleAddAddress = async () => {
    setSavingAddress(true);
    try {
      await fetch("/api/address", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...addressForm, saveAddress: true }),
      });
      setShowAddAddress(false);
      setAddressForm({
        fullName: "",
        phone: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        pincode: "",
      });
      loadAddresses();
    } catch {}
    setSavingAddress(false);
  };

  if (checking) {
    return <SkeletonProfile />;
  }

  return (
    <main className="min-h-screen bg-[#faf8f5] pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-emerald-800 flex items-center justify-center text-white text-3xl md:text-4xl font-serif font-bold shadow-sm">
                {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
              </div>
              {user?.isAdmin && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center shadow-sm">
                  <Shield size={12} className="text-stone-900" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-serif text-stone-900">
                {user?.name || "Your Account"}
              </h1>
              <div className="flex items-center gap-2 text-stone-400 text-sm mt-1">
                <Mail size={14} />
                <span className="truncate">{user?.email}</span>
              </div>
              {user?.isAdmin && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-700 text-[11px] font-bold uppercase tracking-wider">
                  <Shield size={11} />
                  Admin
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="self-start md:self-center flex items-center gap-2 px-5 py-2.5 bg-white border border-stone-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-stone-500 rounded-xl text-sm font-bold transition-all"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-8">
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
              <div className="flex items-center gap-2 text-stone-400 text-xs uppercase tracking-wider font-bold mb-1">
                <Package size={13} />
                Orders
              </div>
              <p className="text-2xl font-bold text-stone-900">{orders.length}</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
              <div className="flex items-center gap-2 text-stone-400 text-xs uppercase tracking-wider font-bold mb-1">
                <MapPin size={13} />
                Addresses
              </div>
              <p className="text-2xl font-bold text-stone-900">{addresses.length}</p>
            </div>
            <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-emerald-50 to-white rounded-xl p-4 border border-emerald-100">
              <div className="flex items-center gap-2 text-emerald-600 text-xs uppercase tracking-wider font-bold mb-1">
                <CreditCard size={13} />
                Member since
              </div>
              <p className="text-sm font-medium text-stone-600">
                {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-white text-stone-500 hover:text-stone-800 border border-stone-200 shadow-sm"
              }`}
            >
              {tab === "Account" && <User size={15} />}
              {tab === "Addresses" && <MapPin size={15} />}
              {tab === "Orders" && <Package size={15} />}
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "Account" && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Details */}
            <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                  <User size={20} className="text-stone-600" />
                </div>
                <h2 className="text-lg font-serif text-stone-900">
                  Profile Details
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold tracking-widest uppercase text-stone-400">
                    Full Name
                  </label>
                  {editingName ? (
                    <div className="mt-1.5 flex gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 border border-stone-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-stone-900"
                      />
                      <button
                        onClick={handleSaveName}
                        disabled={savingName}
                        className="p-2.5 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition disabled:opacity-50"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => {
                          setEditingName(false);
                          setNewName(user?.name || "");
                        }}
                        className="p-2.5 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1.5 flex items-center gap-2">
                      <p className="text-stone-900 font-semibold">
                        {user?.name || "Not set"}
                      </p>
                      <button
                        onClick={() => setEditingName(true)}
                        className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-bold tracking-widest uppercase text-stone-400">
                    Email
                  </label>
                  <div className="mt-1.5 flex items-center gap-2 text-stone-900">
                    <Mail size={15} className="text-stone-400" />
                    <span>{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-4">
              {user?.isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-4 p-5 bg-amber-50 border border-amber-200 rounded-2xl hover:shadow-sm transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                    <Shield size={22} className="text-amber-800" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-stone-800 text-sm">
                      Admin Panel
                    </p>
                    <p className="text-xs text-amber-700 mt-0.5">
                      Manage products, orders, and more
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-amber-500 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              )}

              <Link
                href="/orders"
                className="flex items-center gap-4 p-5 bg-white border border-stone-200 rounded-2xl hover:shadow-sm transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                  <ShoppingBag size={22} className="text-stone-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-stone-800 text-sm">
                    All Orders
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    View complete order history
                  </p>
                </div>
                <ChevronRight
                  size={18}
                  className="text-stone-400 group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>
        )}

        {activeTab === "Addresses" && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                  <MapPin size={20} className="text-stone-600" />
                </div>
                <h2 className="text-lg font-serif text-stone-900">
                  Saved Addresses
                </h2>
              </div>
              <button
                onClick={() => setShowAddAddress(!showAddAddress)}
                className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition shadow-sm"
              >
                <Plus size={14} strokeWidth={2.5} />
                {showAddAddress ? "Cancel" : "Add Address"}
              </button>
            </div>

            {showAddAddress && (
              <div className="mb-8 p-6 bg-stone-50 border border-stone-200 rounded-xl space-y-4">
                <h3 className="text-sm font-bold text-stone-800 mb-1">
                  New Address
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    placeholder="Full Name"
                    value={addressForm.fullName}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, fullName: e.target.value })
                    }
                    className="border border-stone-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                  <input
                    placeholder="Phone"
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, phone: e.target.value })
                    }
                    className="border border-stone-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                </div>
                <input
                  placeholder="Address Line 1"
                  value={addressForm.address1}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, address1: e.target.value })
                  }
                  className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
                <input
                  placeholder="Address Line 2 (optional)"
                  value={addressForm.address2}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, address2: e.target.value })
                  }
                  className="w-full border border-stone-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    placeholder="City"
                    value={addressForm.city}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, city: e.target.value })
                    }
                    className="border border-stone-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                  <input
                    placeholder="State"
                    value={addressForm.state}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, state: e.target.value })
                    }
                    className="border border-stone-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                  <input
                    placeholder="Pincode"
                    value={addressForm.pincode}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, pincode: e.target.value })
                    }
                    className="border border-stone-300 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                </div>
                <button
                  onClick={handleAddAddress}
                  disabled={savingAddress}
                  className="w-full bg-stone-900 text-white font-bold py-3 rounded-xl hover:bg-stone-800 transition text-sm disabled:opacity-50"
                >
                  {savingAddress ? "Saving..." : "Save Address"}
                </button>
              </div>
            )}

            {addressesLoading ? (
              <SkeletonAddresses />
            ) : addresses.length === 0 ? (
              <div className="text-center py-16">
                <MapPin size={40} className="mx-auto text-stone-200 mb-3" />
                <p className="text-stone-500 text-sm">
                  No saved addresses yet.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className="relative p-5 border border-stone-200 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all bg-white group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Home size={16} className="text-stone-500" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-stone-900 text-sm">
                          {addr.fullName}
                        </p>
                        <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                          {addr.address1}
                          {addr.address2 ? `, ${addr.address2}` : ""}
                          <br />
                          {addr.city}, {addr.state} &mdash; {addr.pincode}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 text-xs text-stone-400">
                          <Phone size={11} />
                          {addr.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "Orders" && (
          <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center">
                <Package size={20} className="text-stone-600" />
              </div>
              <h2 className="text-lg font-serif text-stone-900">
                Order History
              </h2>
            </div>

            {ordersLoading ? (
              <SkeletonOrders />
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <Package size={44} className="mx-auto text-stone-200 mb-3" />
                <p className="text-stone-500 text-sm mb-4">
                  No orders yet.
                </p>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl text-sm font-bold hover:bg-stone-800 transition shadow-sm"
                >
                  <ShoppingBag size={15} />
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/order-confirmation?id=${order.id}`}
                    className="block p-5 border border-stone-200 rounded-xl hover:border-emerald-200 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${
                              statusColors[order.status] || "bg-stone-100 text-stone-700"
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="text-[11px] text-stone-400 font-mono">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                          {order.orderitem.map((item, idx) => (
                            <span key={item.id} className="text-sm text-stone-600">
                              {item.product.name}
                              <span className="text-stone-400"> x{item.quantity}</span>
                              {idx < order.orderitem.length - 1 && <span className="text-stone-300 mx-1">,</span>}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-3 text-xs text-stone-400">
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {formatDate(order.createdAt)}
                          </span>
                          <span>
                            {order.orderitem.length} item{order.orderitem.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-lg font-bold text-stone-900">
                          ₹{order.totalAmount}
                        </p>
                        {order.trackingId && order.trackingId !== "PENDING" && (
                          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 justify-end mt-1">
                            <Package size={11} /> Shipped
                          </span>
                        )}
                        <ChevronRight
                          size={16}
                          className="text-stone-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all ml-auto mt-1"
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
