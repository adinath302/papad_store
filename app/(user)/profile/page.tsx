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
  orderitem: OrderItem[];
};

const tabs = ["Account", "Addresses", "Orders"] as const;
type Tab = (typeof tabs)[number];

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatPrice(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
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
    <div className="min-h-screen pt-28 pb-16 px-6 bg-[#faf8f5]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-full bg-emerald-800 flex items-center justify-center text-white text-xl font-bold">
            {(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-serif text-stone-900">
              {user?.name || "Your Account"}
            </h1>
            <p className="text-stone-500 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 border-b border-stone-200">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold tracking-wide transition-all rounded-t-xl cursor-pointer ${
                activeTab === tab
                  ? "bg-white text-emerald-800 border border-b-0 border-stone-200 shadow-sm"
                  : "text-stone-500 hover:text-stone-800 hover:bg-stone-100"
              }`}
            >
              {tab === "Account" && <User size={14} className="inline mr-1.5 -mt-0.5" />}
              {tab === "Addresses" && <MapPin size={14} className="inline mr-1.5 -mt-0.5" />}
              {tab === "Orders" && <Package size={14} className="inline mr-1.5 -mt-0.5" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-t-0 border-stone-200 rounded-b-xl shadow-sm p-6 md:p-8">
          {activeTab === "Account" && (
            <div className="space-y-6 max-w-lg">
              {/* Name */}
              <div>
                <label className="text-xs font-bold tracking-widest uppercase text-stone-500">
                  Full Name
                </label>
                {editingName ? (
                  <div className="mt-1.5 flex gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                    <button
                      onClick={handleSaveName}
                      disabled={savingName}
                      className="p-2 bg-emerald-800 text-white rounded-lg hover:bg-emerald-700 transition cursor-pointer disabled:opacity-50"
                    >
                      <Save size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setEditingName(false);
                        setNewName(user?.name || "");
                      }}
                      className="p-2 bg-stone-100 text-stone-600 rounded-lg hover:bg-stone-200 transition cursor-pointer"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="mt-1.5 flex items-center gap-2">
                    <p className="text-stone-900 font-medium">
                      {user?.name || "Not set"}
                    </p>
                    <button
                      onClick={() => setEditingName(true)}
                      className="p-1.5 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-bold tracking-widest uppercase text-stone-500">
                  Email
                </label>
                <p className="mt-1.5 text-stone-900">{user?.email}</p>
              </div>

              {/* Admin Link */}
              {user?.isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 hover:bg-amber-100 transition group"
                >
                  <Shield size={20} />
                  <div className="flex-1">
                    <p className="font-bold text-sm">Admin Panel</p>
                    <p className="text-xs text-amber-600">
                      Manage products, orders, and more
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-stone-100 text-stone-700 font-semibold text-sm border border-stone-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition cursor-pointer"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}

          {activeTab === "Addresses" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-stone-900">
                  Saved Addresses
                </h2>
                <button
                  onClick={() => setShowAddAddress(!showAddAddress)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-emerald-800 hover:text-emerald-700 transition cursor-pointer"
                >
                  <Plus size={16} />
                  {showAddAddress ? "Cancel" : "Add Address"}
                </button>
              </div>

              {showAddAddress && (
                <div className="mb-6 p-5 border border-stone-200 rounded-xl bg-stone-50 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      placeholder="Full Name"
                      value={addressForm.fullName}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, fullName: e.target.value })
                      }
                      className="border border-stone-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                    <input
                      placeholder="Phone"
                      value={addressForm.phone}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, phone: e.target.value })
                      }
                      className="border border-stone-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                  <input
                    placeholder="Address Line 1"
                    value={addressForm.address1}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, address1: e.target.value })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                  <input
                    placeholder="Address Line 2 (optional)"
                    value={addressForm.address2}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, address2: e.target.value })
                    }
                    className="w-full border border-stone-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      placeholder="City"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, city: e.target.value })
                      }
                      className="border border-stone-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                    <input
                      placeholder="State"
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, state: e.target.value })
                      }
                      className="border border-stone-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                    <input
                      placeholder="Pincode"
                      value={addressForm.pincode}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, pincode: e.target.value })
                      }
                      className="border border-stone-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                    />
                  </div>
                  <button
                    onClick={handleAddAddress}
                    disabled={savingAddress}
                    className="w-full bg-emerald-800 text-white font-semibold py-2.5 rounded-lg hover:bg-emerald-700 transition text-sm cursor-pointer disabled:opacity-50"
                  >
                    {savingAddress ? "Saving..." : "Save Address"}
                  </button>
                </div>
              )}

              {addressesLoading ? (
                <SkeletonAddresses />
              ) : addresses.length === 0 ? (
                <p className="text-stone-500 text-sm py-10 text-center">
                  No saved addresses yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="p-4 border border-stone-200 rounded-xl"
                    >
                      <p className="font-semibold text-stone-900">
                        {addr.fullName}
                      </p>
                      <p className="text-sm text-stone-600 mt-1">
                        {addr.address1}
                        {addr.address2 ? `, ${addr.address2}` : ""}
                      </p>
                      <p className="text-sm text-stone-600">
                        {addr.city}, {addr.state} &mdash; {addr.pincode}
                      </p>
                      <p className="text-sm text-stone-500 mt-1">
                        {addr.phone}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "Orders" && (
            <div>
              <h2 className="text-lg font-bold text-stone-900 mb-5">
                Order History
              </h2>

              {ordersLoading ? (
                <SkeletonOrders />
              ) : orders.length === 0 ? (
                <div className="text-center py-10">
                  <Package
                    size={40}
                    className="mx-auto text-stone-300 mb-3"
                  />
                  <p className="text-stone-500 text-sm">No orders yet.</p>
                  <Link
                    href="/products"
                    className="inline-block mt-3 text-sm font-semibold text-emerald-800 hover:underline"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 border border-stone-200 rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${
                            statusColors[order.status] || "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {order.status}
                        </span>
                        <span className="text-xs text-stone-400">
                          {formatDate(order.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600">
                        {order.orderitem
                          .map((item) => `${item.product.name} (x${item.quantity})`)
                          .join(", ")}
                      </p>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
                        <span className="text-xs text-stone-500">
                          {order.orderitem.length} item(s)
                        </span>
                        <span className="font-bold text-stone-900">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
