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
} from "lucide-react";
import Link from "next/link";

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
  userId: string;
  paymentType: string;
  totalAmount: number;
  status: string;
  fullName: string;
  createdAt: string;
  user: { id: string; name: string | null; email: string } | null;
  orderitem: OrderItem[];
};

type Tab = "dashboard" | "products" | "orders";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    nameMarathi: "",
    description: "",
    stock: "",
    productType: "weight",
    image: "",
    variants: [{ label: "200g", price: "" }],
  });

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

  useEffect(() => {
    Promise.all([fetchProducts(), fetchOrders()]).finally(() =>
      setLoading(false),
    );
  }, [fetchProducts, fetchOrders]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            nameMarathi: form.nameMarathi || null,
            description: form.description,
            stock: Number(form.stock),
            productType: form.productType,
            image: form.image || null,
            thumbnail: form.image || null,
            variants: form.variants.map((v) => ({
              label: v.label.trim(),
              price: Number(v.price),
            })),
          }),
    });

    if (res.ok) {
      alert("Product added successfully!");
      setForm({
        name: "",
        nameMarathi: "",
        description: "",
        stock: "",
        productType: "weight",
        image: "",
        variants: [{ label: "200g", price: "" }],
      });
      setShowAddForm(false);
      fetchProducts();
    } else {
      const err = await res.json();
      alert(`Error: ${err.details || err.error}`);
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product permanently?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchProducts();
    } else {
      alert("Failed to delete product");
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    const res = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) {
      fetchOrders();
    }
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

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Orders", icon: ShoppingBag },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-stone-200 p-6 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 bg-emerald-800 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-stone-800 text-sm tracking-wide">
            Admin Panel
          </span>
        </Link>

        <nav className="flex flex-col gap-1 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                activeTab === tab.id
                  ? "bg-emerald-50 text-emerald-800"
                  : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </nav>

        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-all"
        >
          <LogOut size={18} />
          Back to Store
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
        {/* Mobile Tab Bar */}
        <div className="flex md:hidden gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-emerald-800 text-white"
                  : "bg-white text-stone-500 border border-stone-200"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <div>
                <h1 className="text-2xl font-serif text-stone-900 mb-8">
                  Dashboard
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {statCards.map((card) => (
                    <div
                      key={card.label}
                      className="bg-white rounded-xl border border-stone-200 p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-2.5 rounded-lg ${card.bg}`}>
                          <card.icon size={20} className={card.color} />
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

                {/* Recent Orders */}
                <div className="mt-10">
                  <h2 className="text-lg font-serif text-stone-900 mb-4">
                    Recent Orders
                  </h2>
                  <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                    {orders.slice(0, 5).length > 0 ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-stone-100 bg-stone-50">
                            <th className="text-left px-4 py-3 font-semibold text-stone-600">
                              Customer
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-stone-600">
                              Total
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-stone-600">
                              Status
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-stone-600">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.slice(0, 5).map((order) => (
                            <tr
                              key={order.id}
                              className="border-b border-stone-100 hover:bg-stone-50"
                            >
                              <td className="px-4 py-3 text-stone-700">
                                {order.fullName || "Guest"}
                              </td>
                              <td className="px-4 py-3 text-stone-700">
                                ₹{order.totalAmount}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                    order.status === "PENDING"
                                      ? "bg-amber-50 text-amber-700"
                                      : order.status === "CONFIRMED"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : order.status === "SHIPPED"
                                          ? "bg-blue-50 text-blue-700"
                                          : order.status === "DELIVERED"
                                            ? "bg-stone-100 text-stone-600"
                                            : "bg-red-50 text-red-600"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-stone-500 text-xs">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="text-center py-12 text-stone-400 text-sm">
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
                  <h1 className="text-2xl font-serif text-stone-900">
                    Products
                  </h1>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all"
                  >
                    <Plus size={16} />
                    {showAddForm ? "Cancel" : "Add Product"}
                  </button>
                </div>

                {/* Add Product Form */}
                {showAddForm && (
                  <div className="bg-white rounded-xl border border-stone-200 p-6 md:p-8 mb-8">
                    <h2 className="text-lg font-serif text-stone-900 mb-6">
                      New Product
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                            Product Name
                          </label>
                          <input
                            required
                            name="name"
                            value={form.name}
                            placeholder="e.g. Hand-Rolled Moong Papad"
                            onChange={handleChange}
                            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-600 bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                            Description
                          </label>
                          <textarea
                            name="description"
                            value={form.description}
                            placeholder="Product description..."
                            rows={2}
                            onChange={handleChange}
                            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-600 bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all resize-none"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                            Name (मराठी)
                          </label>
                          <input
                            name="nameMarathi"
                            value={form.nameMarathi}
                            placeholder="e.g. हात-गुंडाळलेली मूग पापड"
                            onChange={handleChange}
                            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-600 bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                            Stock
                          </label>
                          <input
                            name="stock"
                            type="number"
                            value={form.stock}
                            placeholder="0"
                            onChange={handleChange}
                            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-600 bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                            Product Type
                          </label>
                          <div className="relative">
                            <select
                              name="productType"
                              value={form.productType}
                              onChange={handleChange}
                              className="w-full border border-stone-200 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-600 bg-transparent text-stone-900 text-sm transition-all appearance-none cursor-pointer"
                            >
                              <option value="weight">By Weight (Grams)</option>
                              <option value="pieces">
                                By Pieces (Packs)
                              </option>
                            </select>
                            <ChevronDown
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none"
                              size={16}
                            />
                          </div>
                        </div>

                        <div className="md:col-span-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 block mb-1.5">
                            Image URL (Cloudinary)
                          </label>
                          <input
                            name="image"
                            value={form.image}
                            placeholder="https://res.cloudinary.com/..."
                            onChange={handleChange}
                            className="w-full border border-stone-200 rounded-lg px-4 py-2.5 outline-none focus:border-emerald-600 bg-transparent text-stone-900 placeholder:text-stone-300 text-sm transition-all"
                          />
                        </div>
                      </div>

                      {/* Variants */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                            Variants (Size & Price)
                          </label>
                          <button
                            type="button"
                            onClick={() =>
                              setForm({
                                ...form,
                                variants: [
                                  ...form.variants,
                                  { label: "", price: "" },
                                ],
                              })
                            }
                            className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-700 hover:text-emerald-600 transition-colors"
                          >
                            <Plus size={14} /> Add Variant
                          </button>
                        </div>
                        <div className="space-y-3">
                          {form.variants.map((v, i) => (
                            <div
                              key={i}
                              className="flex items-end gap-3 bg-stone-50 p-4 rounded-lg border border-stone-200"
                            >
                              <div className="flex-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                                  Label
                                </label>
                                <input
                                  placeholder="e.g. 200g"
                                  value={v.label}
                                  onChange={(e) => {
                                    const updated = [...form.variants];
                                    updated[i].label = e.target.value;
                                    setForm({ ...form, variants: updated });
                                  }}
                                  className="w-full border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-600 bg-white text-sm text-stone-900 placeholder:text-stone-300 transition-all"
                                />
                              </div>
                              <div className="w-36">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                                  Price (₹)
                                </label>
                                <input
                                  type="number"
                                  placeholder="Price"
                                  value={v.price}
                                  onChange={(e) => {
                                    const updated = [...form.variants];
                                    updated[i].price = e.target.value;
                                    setForm({ ...form, variants: updated });
                                  }}
                                  className="w-full border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-emerald-600 bg-white text-sm text-stone-900 placeholder:text-stone-300 transition-all"
                                />
                              </div>
                              {form.variants.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setForm({
                                      ...form,
                                      variants: form.variants.filter(
                                        (_, idx) => idx !== i,
                                      ),
                                    })
                                  }
                                  className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-stone-700 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-8 py-2.5 bg-emerald-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all"
                        >
                          Save Product
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Products Table */}
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  {products.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-stone-100 bg-stone-50">
                            <th className="text-left px-4 py-3 font-semibold text-stone-600">
                              Product
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-stone-600 hidden lg:table-cell">
                              मराठी
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-stone-600 hidden md:table-cell">
                              Variants
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-stone-600 hidden sm:table-cell">
                              Stock
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-stone-600 hidden sm:table-cell">
                              Type
                            </th>
                            <th className="text-right px-4 py-3 font-semibold text-stone-600">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.map((product) => (
                            <tr
                              key={product.id}
                              className="border-b border-stone-100 hover:bg-stone-50"
                            >
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                                    {product.image ? (
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon
                                          size={16}
                                          className="text-stone-300"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-stone-800">
                                      {product.name}
                                    </p>
                                    {product.description && (
                                      <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">
                                        {product.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 hidden lg:table-cell text-stone-600 text-sm">
                                {(product as any).nameMarathi || "-"}
                              </td>
                              <td className="px-4 py-4 hidden md:table-cell">
                                <div className="flex flex-wrap gap-1">
                                  {product.productvariant.map((v) => (
                                    <span
                                      key={v.id}
                                      className="inline-block px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-xs"
                                    >
                                      {v.label} - ₹{v.price}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-4 hidden sm:table-cell text-stone-600">
                                {product.stock ?? "-"}
                              </td>
                              <td className="px-4 py-4 hidden sm:table-cell">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">
                                  {product.productType}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <button
                                  onClick={() => deleteProduct(product.id)}
                                  className="p-2 text-stone-300 hover:text-red-500 transition-colors"
                                  title="Delete product"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Package
                        size={40}
                        className="mx-auto text-stone-200 mb-3"
                      />
                      <p className="text-stone-400 text-sm">
                        No products yet.{" "}
                        <button
                          onClick={() => setShowAddForm(true)}
                          className="text-emerald-700 underline underline-offset-2 hover:text-emerald-600"
                        >
                          Add your first product
                        </button>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === "orders" && (
              <div>
                <h1 className="text-2xl font-serif text-stone-900 mb-8">
                  Orders
                </h1>
                <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-stone-100 bg-stone-50">
                            <th className="text-left px-4 py-3 font-semibold text-stone-600">
                              Customer
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-stone-600 hidden md:table-cell">
                              Items
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-stone-600">
                              Total
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-stone-600 hidden sm:table-cell">
                              Payment
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-stone-600">
                              Status
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-stone-600 hidden sm:table-cell">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order) => (
                            <tr
                              key={order.id}
                              className="border-b border-stone-100 hover:bg-stone-50"
                            >
                              <td className="px-4 py-4">
                                <p className="font-medium text-stone-800">
                                  {order.fullName || "Guest"}
                                </p>
                                <p className="text-xs text-stone-400">
                                  {order.user?.email || ""}
                                </p>
                              </td>
                              <td className="px-4 py-4 hidden md:table-cell">
                                <div className="flex flex-wrap gap-1">
                                  {order.orderitem.map((item) => (
                                    <span
                                      key={item.id}
                                      className="inline-block px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-xs"
                                    >
                                      {item.product.name} x{item.quantity}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-4 py-4 font-medium text-stone-800">
                                ₹{order.totalAmount}
                              </td>
                              <td className="px-4 py-4 hidden sm:table-cell text-stone-500 text-xs uppercase tracking-wider">
                                {order.paymentType}
                              </td>
                              <td className="px-4 py-4">
                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    updateOrderStatus(
                                      order.id,
                                      e.target.value,
                                    )
                                  }
                                  className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border-0 cursor-pointer outline-none ${
                                    order.status === "PENDING"
                                      ? "bg-amber-50 text-amber-700"
                                      : order.status === "CONFIRMED"
                                        ? "bg-emerald-50 text-emerald-700"
                                        : order.status === "SHIPPED"
                                          ? "bg-blue-50 text-blue-700"
                                          : order.status === "DELIVERED"
                                            ? "bg-stone-100 text-stone-600"
                                            : "bg-red-50 text-red-600"
                                  }`}
                                >
                                  <option value="PENDING">Pending</option>
                                  <option value="CONFIRMED">Confirmed</option>
                                  <option value="SHIPPED">Shipped</option>
                                  <option value="DELIVERED">Delivered</option>
                                  <option value="CANCELLED">Cancelled</option>
                                </select>
                              </td>
                              <td className="px-4 py-4 text-stone-500 text-xs hidden sm:table-cell">
                                {new Date(order.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <ShoppingBag
                        size={40}
                        className="mx-auto text-stone-200 mb-3"
                      />
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
