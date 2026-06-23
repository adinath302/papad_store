"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Plus,
  Trash2,
  Image as ImageIcon,
  ChevronDown,
  LogOut,
  FileText,
  Hash,
  IndianRupee,
  Link2,
  Pencil,
  Shield,
  Users,
  Check,
  X as XIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useToast } from "@/components/Toast/ToastProvider";

type Product = {
  id: string;
  name: string;
  description: string | null;
  stock: number | null;
  image: string | null;
  thumbnail: string | null;
  productType: string;
  productvariant: { id: string; label: string; price: number }[];
};

type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  product: { id: string; name: string };
};

type Order = {
  id: string;
  userId: string | null;
  paymentType: string;
  totalAmount: number;
  shippingCost: number;
  status: string;
  fullName: string;
  phone: string;
  address1: string;
  address2: string | null;
  city: string;
  state: string;
  pincode: string;
  trackingId: string | null;
  courierName: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
  orderitem: OrderItem[];
};

type Tab = "dashboard" | "products" | "orders" | "users";

type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  permissions: string | null;
};

const ALL_PERMISSION_OPTIONS = [
  { value: "products", label: "Manage Products" },
  { value: "orders", label: "Manage Orders" },
  { value: "dashboard", label: "View Dashboard" },
  { value: "admins", label: "Manage Admins" },
] as const;

const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  SHIPPED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  DELIVERED: "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
  CANCELLED: "bg-red-50 text-red-600 ring-1 ring-red-200",
};

export default function AdminPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [addAdminEmail, setAddAdminEmail] = useState("");
  const [addAdminPermissions, setAddAdminPermissions] = useState<string[]>([]);
  const [editingAdminId, setEditingAdminId] = useState<string | null>(null);
  const [editingPerms, setEditingPerms] = useState<string[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    nameMarathi: "",
    description: "",
    stock: "",
    image: "",
    variants: [{ label: "", price: "" }],
  });

  const resetForm = () => {
    setForm({
      name: "",
      nameMarathi: "",
      description: "",
      stock: "",
      image: "",
      variants: [{ label: "", price: "" }],
    });
    setEditingProductId(null);
  };

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data);
    }
  }, []);

  const fetchAdmins = useCallback(async () => {
    const res = await fetch("/api/admin/users");
    if (res.ok) {
      const data = await res.json();
      setAdmins(data.admins);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      const meRes = await fetch("/api/auth/me");
      const meData = await meRes.json();
      const isOwnerUser = meData.user?.isOwner;
      setIsOwner(isOwnerUser);

      await Promise.all([fetchProducts(), fetchOrders()]);
      if (isOwnerUser) await fetchAdmins();
      setLoading(false);
    };
    init();
  }, [fetchProducts, fetchOrders]);

  const addAdmin = async () => {
    if (!addAdminEmail.trim()) return;
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: addAdminEmail.trim(),
        permissions: addAdminPermissions,
      }),
    });
    if (res.ok) {
      toast("Admin added successfully!", "success");
      setShowAddAdmin(false);
      setAddAdminEmail("");
      setAddAdminPermissions([]);
      fetchAdmins();
    } else {
      const err = await res.json();
      toast(err.error || "Failed to add admin", "error");
    }
  };

  const updateAdminPermissions = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permissions: editingPerms }),
    });
    if (res.ok) {
      toast("Permissions updated!", "success");
      setEditingAdminId(null);
      setEditingPerms([]);
      fetchAdmins();
    } else {
      const err = await res.json();
      toast(err.error || "Failed to update", "error");
    }
  };

  const removeAdmin = async (id: string, email: string) => {
    if (!confirm(`Remove admin access for ${email}?`)) return;
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast("Admin removed", "success");
      fetchAdmins();
    } else {
      const err = await res.json();
      toast(err.error || "Failed to remove", "error");
    }
  };

  const togglePerm = (perms: string[], perm: string): string[] => {
    return perms.includes(perm)
      ? perms.filter((p) => p !== perm)
      : [...perms, perm];
  };

  const OWNER_EMAIL = "shivshambho@gmail.com";

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addVariant = () => {
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, { label: "", price: "" }],
    }));
  };

  const updateVariant = (index: number, field: "label" | "price", value: string) => {
    setForm((prev) => {
      const updated = [...prev.variants];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, variants: updated };
    });
  };

  const removeVariant = (index: number) => {
    setForm((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleEdit = async (product: Product) => {
    setForm({
      name: product.name,
      nameMarathi: (product as any).nameMarathi || "",
      description: product.description || "",
      stock: product.stock?.toString() || "",
      image: product.image || "",
      variants: product.productvariant.map((v) => ({
        label: v.label,
        price: v.price.toString(),
      })),
    });
    setEditingProductId(product.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const body = {
      name: form.name,
      nameMarathi: form.nameMarathi || null,
      description: form.description || null,
      stock: form.stock ? Number(form.stock) : null,
      productType: "variant",
      image: form.image || null,
      thumbnail: form.image || null,
      variants: form.variants
        .filter((v) => v.label.trim() && v.price)
        .map((v) => ({
          label: v.label.trim(),
          price: Number(v.price),
        })),
    };

    const isEditing = !!editingProductId;
    const url = isEditing ? `/api/products/${editingProductId}` : "/api/products";
    const method = isEditing ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      toast(isEditing ? "Product updated successfully!" : "Product added successfully!", "success");
      resetForm();
      setShowForm(false);
      fetchProducts();
    } else {
      const err = await res.json();
      toast(`Error: ${err.details || err.error}`, "error");
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchProducts();
    } else {
      toast("Failed to delete product", "error");
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) fetchOrders();
  };

  const [shippingOrderId, setShippingOrderId] = useState<string | null>(null);
  const [shipCourier, setShipCourier] = useState("IndiaPost - Speed Post");
  const [shipTracking, setShipTracking] = useState("");

  const markAsShipped = async (id: string) => {
    if (!shipTracking.trim()) return;
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "SHIPPED", courierName: shipCourier, trackingId: shipTracking.trim() }),
    });
    setShippingOrderId(null);
    setShipCourier("IndiaPost - Speed Post");
    setShipTracking("");
    fetchOrders();
  };

  const statCards = [
    {
      label: "Total Products",
      value: products.length,
      icon: Package,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Total Orders",
      value: orders.length,
      icon: ShoppingBag,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Pending Orders",
      value: orders.filter((o) => o.status === "PENDING").length,
      icon: LayoutDashboard,
      color: "text-stone-600",
      bg: "bg-stone-100",
    },
  ];

  const baseTabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
  ];

  const tabs = isOwner
    ? [...baseTabs, { id: "users" as Tab, label: "Users", icon: Shield }]
    : baseTabs;

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-stone-200 p-6 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-3 mb-10 group">
          <div className="w-9 h-9 bg-stone-900 rounded-xl flex items-center justify-center group-hover:bg-emerald-800 transition-colors">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <div>
            <p className="font-semibold text-stone-800 text-sm">Admin Panel</p>
            <p className="text-[10px] text-stone-400">Shivshambho</p>
            <p className="text-[8px] text-stone-300 tracking-widest uppercase">crafted with tradition</p>
          </div>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === tab.id
                  ? "bg-stone-100 text-stone-900"
                  : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
              }`}
            >
              <tab.icon size={18} strokeWidth={1.5} />
              {tab.label}
            </button>
          ))}
        </nav>

        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-all"
        >
          <LogOut size={18} strokeWidth={1.5} />
          Back to Store
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 overflow-x-hidden">
        {/* Mobile Header */}
        <div className="flex md:hidden items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-bold text-stone-900">Admin Panel</h1>
            <p className="text-xs text-stone-400">Shivshambho</p>
            <p className="text-[9px] text-stone-300 tracking-widest uppercase">crafted with tradition</p>
          </div>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-all border border-stone-200"
          >
            <LogOut size={14} strokeWidth={1.5} />
            Store
          </Link>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-stone-900 text-white shadow-sm"
                  : "bg-white text-stone-500 border border-stone-200 shadow-sm"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                    Dashboard
                  </h1>
                  <p className="text-sm text-stone-500 mt-1">
                    Overview of your store
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {statCards.map((card) => (
                    <div
                      key={card.label}
                      className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`p-2.5 rounded-xl ${card.bg}`}>
                          <card.icon size={20} className={card.color} strokeWidth={1.5} />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-stone-900">
                        {card.value}
                      </p>
                      <p className="text-sm text-stone-500 mt-1">
                        {card.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <h2 className="text-lg font-bold text-stone-900 mb-4">
                    Recent Orders
                  </h2>
                  <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                    {orders.slice(0, 5).length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-stone-100">
                              <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                                Customer
                              </th>
                              <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">
                                Total
                              </th>
                              <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                                Status
                              </th>
                              <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">
                                Date
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.slice(0, 5).map((order) => (
                              <tr
                                key={order.id}
                                className="border-b border-stone-100 last:border-0 hover:bg-stone-50"
                              >
                                <td className="px-5 py-4">
                                  <p className="font-medium text-stone-800">
                                    {order.fullName || "Guest"}
                                  </p>
                                </td>
                                <td className="px-5 py-4 font-medium text-stone-800 hidden sm:table-cell">
                                  ₹{order.totalAmount}
                                </td>
                                <td className="px-5 py-4">
                                  <span
                                    className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold ${
                                      statusStyles[order.status] || "bg-stone-100 text-stone-600"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-stone-400 text-xs hidden sm:table-cell">
                                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-14 text-stone-400 text-sm">
                        No orders yet
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                      Products
                    </h1>
                    <p className="text-sm text-stone-500 mt-1">
                      {products.length} product{products.length !== 1 ? "s" : ""} • Manage your catalog
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (showForm && editingProductId) resetForm();
                      setShowForm(!showForm);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all shadow-sm"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    {showForm ? "Cancel" : "Add Product"}
                  </button>
                </div>

                {/* Add / Edit Product Form */}
                {showForm && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mb-8 shadow-sm">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center">
                        <Package size={18} className="text-stone-600" strokeWidth={1.5} />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-stone-900">
                          {editingProductId ? "Edit Product" : "New Product"}
                        </h2>
                        <p className="text-sm text-stone-400">Fill in the details below</p>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Basic Info */}
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-4 flex items-center gap-2">
                          <FileText size={14} /> Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <input
                              required
                              name="name"
                              value={form.name}
                              placeholder="Product name"
                              onChange={handleChange}
                              className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-400 bg-white text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <textarea
                              name="description"
                              value={form.description}
                              placeholder="Product description (optional)"
                              rows={2}
                              onChange={handleChange}
                              className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-400 bg-white text-stone-900 placeholder:text-stone-300 text-sm transition-all resize-none"
                            />
                          </div>

                          <div>
                            <input
                              name="nameMarathi"
                              value={form.nameMarathi}
                              placeholder="नाव मराठीत (optional)"
                              onChange={handleChange}
                              className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-400 bg-white text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                            />
                          </div>

                          <div className="relative">
                            <Hash size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                            <input
                              name="stock"
                              type="number"
                              value={form.stock}
                              placeholder="Stock count"
                              onChange={handleChange}
                              className="w-full border border-stone-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-stone-400 bg-white text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <div className="relative">
                              <Link2 size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                              <input
                                name="image"
                                value={form.image}
                                placeholder="Image URL (optional)"
                                onChange={handleChange}
                                className="w-full border border-stone-200 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-stone-400 bg-white text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Variants */}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                            <IndianRupee size={14} /> Variants & Pricing
                          </h3>
                          <button
                            type="button"
                            onClick={addVariant}
                            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-600 transition-colors"
                          >
                            <Plus size={14} strokeWidth={2.5} /> Add Variant
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {form.variants.map((v, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-3 bg-white border border-stone-200 rounded-xl p-3"
                            >
                              <div className="flex-1 min-w-0">
                                <input
                                  placeholder="e.g. 200g, 500g, 1kg"
                                  value={v.label}
                                  onChange={(e) => updateVariant(i, "label", e.target.value)}
                                  className="w-full border-0 bg-transparent px-2 py-1.5 outline-none text-sm text-stone-900 placeholder:text-stone-300 font-medium"
                                />
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-stone-400 text-xs font-medium">₹</span>
                                <input
                                  type="number"
                                  placeholder="Price"
                                  value={v.price}
                                  onChange={(e) => updateVariant(i, "price", e.target.value)}
                                  className="w-24 border border-stone-200 rounded-lg px-3 py-1.5 outline-none focus:border-stone-400 bg-white text-sm text-stone-900 placeholder:text-stone-300 text-right"
                                />
                              </div>
                              {form.variants.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeVariant(i)}
                                  className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                        {form.variants.length === 0 && (
                          <p className="text-xs text-stone-400 text-center py-6">
                            Add at least one variant
                          </p>
                        )}
                      </div>

                      <div className="flex justify-end gap-3 pt-2 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => {
                            resetForm();
                            setShowForm(false);
                          }}
                          className="px-6 py-2.5 text-xs font-bold text-stone-500 hover:text-stone-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={form.variants.filter((v) => v.label.trim() && v.price).length === 0}
                          className="px-8 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                        >
                          {editingProductId ? "Update Product" : "Save Product"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Products Table */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                  {products.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-stone-100 bg-stone-50">
                            <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                              Product
                            </th>
                            <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden lg:table-cell">
                              मराठी
                            </th>
                            <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden md:table-cell">
                              Variants
                            </th>
                            <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">
                              Stock
                            </th>
                            <th className="text-right px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product, idx) => (
                            <tr
                              key={product.id}
                              className="border-b border-stone-100 last:border-0 hover:bg-stone-50"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-stone-200">
                                    {product.image ? (
                                      <Image
                                        src={product.image}
                                        alt={product.name}
                                        width={40}
                                        height={40}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon size={16} className="text-stone-300" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-stone-800">
                                      {product.name}
                                    </p>
                                    {product.description && (
                                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-1 max-w-[200px]">
                                        {product.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 hidden lg:table-cell text-stone-500 text-sm">
                                {(product as any).nameMarathi || "—"}
                              </td>
                              <td className="px-5 py-4 hidden md:table-cell">
                                <div className="flex flex-wrap gap-1.5">
                                  {product.productvariant.map((v) => (
                                    <span
                                      key={v.id}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg text-[11px] font-medium"
                                    >
                                      {v.label}
                                      <span className="text-stone-400">•</span>
                                      ₹{v.price}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-5 py-4 hidden sm:table-cell text-stone-600 font-medium">
                                {product.stock ?? "—"}
                              </td>
                              <td className="px-5 py-4 text-right whitespace-nowrap">
                                <button
                                  onClick={() => handleEdit(product)}
                                  className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all mr-1"
                                  title="Edit product"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => deleteProduct(product.id)}
                                  className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Delete product"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <Package size={44} className="mx-auto text-stone-200 mb-4" strokeWidth={1} />
                      <p className="text-stone-400 text-sm mb-4">
                        No products yet
                      </p>
                      <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all shadow-sm"
                      >
                        <Plus size={15} strokeWidth={2.5} />
                        Add Your First Product
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {/* Users Tab */}
            {activeTab === "users" && isOwner && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                      Admin Users
                    </h1>
                    <p className="text-sm text-stone-500 mt-1">
                      Manage who has access to the admin panel
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddAdmin(!showAddAdmin)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all shadow-sm"
                  >
                    <Plus size={15} strokeWidth={2.5} />
                    {showAddAdmin ? "Cancel" : "Add Admin"}
                  </button>
                </div>

                {/* Add Admin Form */}
                {showAddAdmin && (
                  <div className="bg-white rounded-2xl border border-stone-200 p-6 md:p-8 mb-8 shadow-sm">
                    <h2 className="text-lg font-bold text-stone-900 mb-4">
                      Add New Admin
                    </h2>
                    <div className="space-y-4 max-w-md">
                      <input
                        type="email"
                        value={addAdminEmail}
                        onChange={(e) => setAddAdminEmail(e.target.value)}
                        placeholder="Enter user email"
                        className="w-full border border-stone-200 rounded-xl px-4 py-3 outline-none focus:border-stone-400 bg-white text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                      />
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                          Permissions
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {ALL_PERMISSION_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() =>
                                setAddAdminPermissions(
                                  togglePerm(addAdminPermissions, opt.value),
                                )
                              }
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                addAdminPermissions.includes(opt.value)
                                  ? "bg-emerald-800 text-white"
                                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                              }`}
                            >
                              {addAdminPermissions.includes(opt.value) ? (
                                <Check size={12} strokeWidth={3} />
                              ) : null}
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={addAdmin}
                        disabled={!addAdminEmail.trim()}
                        className="px-6 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Add Admin
                      </button>
                    </div>
                  </div>
                )}

                {/* Admins Table */}
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-stone-100 bg-stone-50">
                          <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                            Name
                          </th>
                          <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                            Email
                          </th>
                          <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                            Permissions
                          </th>
                          <th className="text-right px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {admins.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center py-14 text-stone-400 text-sm">
                              No admin users found
                            </td>
                          </tr>
                        ) : (
                          admins.map((admin) => {
                            const isOwnerUser = admin.email === OWNER_EMAIL;
                            const permList = admin.permissions
                              ? admin.permissions.split(",")
                              : [];
                            const isEditing = editingAdminId === admin.id;

                            return (
                              <tr
                                key={admin.id}
                                className="border-b border-stone-100 last:border-0 hover:bg-stone-50"
                              >
                                <td className="px-5 py-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-stone-800">
                                      {admin.name || "—"}
                                    </span>
                                    {isOwnerUser && (
                                      <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                        Owner
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-5 py-4 text-stone-600">
                                  {admin.email}
                                </td>
                                <td className="px-5 py-4">
                                  {isEditing ? (
                                    <div className="flex flex-wrap gap-1.5">
                                      {ALL_PERMISSION_OPTIONS.map((opt) => (
                                        <button
                                          key={opt.value}
                                          type="button"
                                          onClick={() =>
                                            setEditingPerms(
                                              togglePerm(editingPerms, opt.value),
                                            )
                                          }
                                          className={`text-[11px] px-2 py-1 rounded-lg font-semibold transition-all ${
                                            editingPerms.includes(opt.value)
                                              ? "bg-emerald-800 text-white"
                                              : "bg-stone-100 text-stone-500 hover:bg-stone-200"
                                          }`}
                                        >
                                          {opt.label}
                                        </button>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                      {isOwnerUser ? (
                                        <span className="text-[11px] text-amber-700 font-semibold">
                                          All permissions
                                        </span>
                                      ) : permList.length > 0 ? (
                                        permList.map((p) => {
                                          const opt = ALL_PERMISSION_OPTIONS.find(
                                            (o) => o.value === p,
                                          );
                                          return opt ? (
                                            <span
                                              key={p}
                                              className="inline-flex items-center px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg text-[11px] font-medium"
                                            >
                                              {opt.label}
                                            </span>
                                          ) : null;
                                        })
                                      ) : (
                                        <span className="text-[11px] text-stone-400">
                                          No permissions
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="px-5 py-4 text-right whitespace-nowrap">
                                  {isOwnerUser ? (
                                    <span className="text-[11px] text-stone-400 italic">
                                      —
                                    </span>
                                  ) : isEditing ? (
                                    <>
                                      <button
                                        onClick={() => updateAdminPermissions(admin.id)}
                                        className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all mr-1"
                                        title="Save"
                                      >
                                        <Check size={15} strokeWidth={2.5} />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingAdminId(null);
                                          setEditingPerms([]);
                                        }}
                                        className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-all"
                                        title="Cancel"
                                      >
                                        <XIcon size={15} />
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() => {
                                          setEditingAdminId(admin.id);
                                          setEditingPerms(permList);
                                        }}
                                        className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all mr-1"
                                        title="Edit permissions"
                                      >
                                        <Pencil size={15} />
                                      </button>
                                      <button
                                        onClick={() => removeAdmin(admin.id, admin.email)}
                                        className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        title="Remove admin"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div>
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
                    Orders
                  </h1>
                  <p className="text-sm text-stone-500 mt-1">
                    {orders.length} order{orders.length !== 1 ? "s" : ""} • Track and manage
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                  {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-stone-100 bg-stone-50">
                            <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                              Customer
                            </th>
                            <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden md:table-cell">
                              Items
                            </th>
                            <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">
                              Subtotal
                            </th>
                            <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">
                              Shipping
                            </th>
                            <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                              Total
                            </th>
                            <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden lg:table-cell">
                              Shipping
                            </th>
                            <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">
                              Payment
                            </th>
                            <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider">
                              Status
                            </th>
                            <th className="text-left px-5 py-3.5 font-semibold text-stone-500 text-xs uppercase tracking-wider hidden sm:table-cell">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr
                              key={order.id}
                              className="border-b border-stone-100 last:border-0 hover:bg-stone-50"
                            >
                              <td className="px-5 py-4 max-w-[200px]">
                                <p className="font-semibold text-stone-800 text-sm">
                                  {order.fullName || "Guest"}
                                </p>
                                <p className="text-[11px] text-stone-400 mt-0.5">
                                  {order.phone}
                                </p>
                                <div className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                                  <p>{order.address1}</p>
                                  {order.address2 && <p>{order.address2}</p>}
                                  <p>{order.city}, {order.state} — {order.pincode}</p>
                                </div>
                              </td>
                              <td className="px-5 py-4 hidden md:table-cell">
                                <div className="flex flex-wrap gap-1.5">
                                  {order.orderitem.map((item) => (
                                    <span
                                      key={item.id}
                                      className="inline-block px-2.5 py-1 bg-stone-100 text-stone-600 rounded-lg text-[11px] font-medium"
                                    >
                                      {item.product.name}
                                      <span className="text-stone-400 ml-1">x{item.quantity}</span>
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-stone-600 hidden sm:table-cell">
                                ₹{order.totalAmount - order.shippingCost}
                              </td>
                              <td className="px-5 py-4 text-stone-600 hidden lg:table-cell">
                                {order.shippingCost > 0 ? (
                                  <span>₹{order.shippingCost}</span>
                                ) : (
                                  <span className="text-emerald-600 text-[11px] font-medium">Free</span>
                                )}
                              </td>
                              <td className="px-5 py-4 font-bold text-stone-800">
                                ₹{order.totalAmount}
                              </td>
                              <td className="px-5 py-4 hidden sm:table-cell text-stone-500 text-xs font-medium uppercase">
                                {order.paymentType}
                              </td>
                              <td className="px-5 py-4">
                                {shippingOrderId === order.id ? (
                                  <div className="space-y-2 min-w-[200px]">
                                    <input
                                      value={shipCourier}
                                      onChange={(e) => setShipCourier(e.target.value)}
                                      placeholder="Courier name"
                                      className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-stone-400"
                                    />
                                    <input
                                      value={shipTracking}
                                      onChange={(e) => setShipTracking(e.target.value)}
                                      placeholder="Tracking number"
                                      className="w-full border border-stone-200 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-stone-400"
                                    />
                                    <div className="flex gap-1.5">
                                      <button
                                        onClick={() => markAsShipped(order.id)}
                                        disabled={!shipTracking.trim()}
                                        className="flex-1 px-3 py-1.5 bg-stone-900 text-white rounded-lg text-[11px] font-bold hover:bg-stone-800 transition-all disabled:opacity-40"
                                      >
                                        Mark Shipped
                                      </button>
                                      <button
                                        onClick={() => setShippingOrderId(null)}
                                        className="px-3 py-1.5 text-stone-400 hover:text-stone-600 text-[11px]"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <select
                                      value={order.status}
                                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                      className={`text-[11px] font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer outline-none ${
                                        statusStyles[order.status] || "bg-stone-100 text-stone-600"
                                      }`}
                                    >
                                      <option value="PENDING">Pending</option>
                                      <option value="CONFIRMED">Confirmed</option>
                                      <option value="SHIPPED">Shipped</option>
                                      <option value="DELIVERED">Delivered</option>
                                      <option value="CANCELLED">Cancelled</option>
                                    </select>
                                    {(order.status === "PENDING" || order.status === "CONFIRMED") && !order.trackingId && (
                                      <button
                                        onClick={() => { setShippingOrderId(order.id); setShipTracking(""); }}
                                        className="block text-[10px] font-semibold text-emerald-700 hover:text-emerald-600 hover:underline mt-1"
                                      >
                                        + Add Shipping
                                      </button>
                                    )}
                                    {order.trackingId && order.trackingId !== "PENDING" && (
                                      <p className="text-[10px] text-stone-400 font-mono truncate max-w-[120px]" title={`${order.courierName || ""} • ${order.trackingId}`}>
                                        {order.courierName ? `${order.courierName} • ` : ""}{order.trackingId}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </td>
                              <td className="px-5 py-4 text-stone-400 text-xs hidden sm:table-cell">
                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <ShoppingBag size={44} className="mx-auto text-stone-200 mb-4" strokeWidth={1} />
                      <p className="text-stone-400 text-sm">No orders yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
