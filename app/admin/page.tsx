"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard, Package, ShoppingBag,
  LogOut, Shield, Tag, History, Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useToast } from "@/components/Toast/ToastProvider";
import { useSiteImages } from "@/lib/useSiteImages";
import type { Product, Order, AdminUser, PermissionMap } from "./_components/types";

type Tab = "dashboard" | "products" | "orders" | "users" | "coupons" | "activity" | "site-images";

const DashboardTab = dynamic(() => import("./_components/DashboardTab"), {
  loading: () => <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" /></div>,
});

const ProductsTab = dynamic(() => import("./_components/ProductsTab"), {
  loading: () => <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" /></div>,
});

const OrdersTab = dynamic(() => import("./_components/OrdersTab"), {
  loading: () => <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" /></div>,
});

const UsersTab = dynamic(() => import("./_components/UsersTab"), {
  loading: () => <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" /></div>,
});

const CouponsTab = dynamic(() => import("./_components/CouponsTab"), {
  loading: () => <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" /></div>,
});

const ActivityLogTab = dynamic(() => import("./_components/ActivityLogTab"), {
  loading: () => <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" /></div>,
});

const SiteImagesTab = dynamic(() => import("./_components/SiteImagesTab"), {
  loading: () => <div className="h-64 flex items-center justify-center"><div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" /></div>,
});

export default function AdminPage() {
  const { toast } = useToast();
  const { getImage } = useSiteImages();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [ownerEmail, setOwnerEmail] = useState("");
  const [currentPerms, setCurrentPerms] = useState<PermissionMap | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/products");
    if (res.ok) setProducts(await res.json());
  }, []);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/orders");
    if (res.ok) {
      const data = await res.json();
      setOrders(data.orders ?? data);
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
      setOwnerEmail(meData.user?.ownerEmail || "");
      setCurrentPerms(meData.user?.permissions || null);
      await Promise.all([fetchProducts(), fetchOrders()]);
      if (isOwnerUser) await fetchAdmins();
      setLoading(false);
    };
    init();
  }, [fetchProducts, fetchOrders]);

  const hasPerm = (resource: string, action: string): boolean => {
    if (isOwner) return true;
    return currentPerms?.[resource]?.[action] === true;
  };

  const baseTabs: { id: Tab; label: string; icon: React.ElementType }[] = [];
  if (isOwner || hasPerm("dashboard", "view")) baseTabs.push({ id: "dashboard", label: "Dashboard", icon: LayoutDashboard });
  if (isOwner || hasPerm("products", "view")) baseTabs.push({ id: "products", label: "Products", icon: Package });
  if (isOwner || hasPerm("orders", "view")) baseTabs.push({ id: "orders", label: "Orders", icon: ShoppingBag });

  if (isOwner) baseTabs.push({ id: "activity", label: "Activity", icon: History });
  baseTabs.push({ id: "site-images" as Tab, label: "Site Images", icon: ImageIcon });
  const tabs = isOwner ? [...baseTabs, { id: "users" as Tab, label: "Users", icon: Shield }, { id: "coupons" as Tab, label: "Coupons", icon: Tag }] : baseTabs;

  return (
    <div className="flex min-h-screen bg-stone-50">
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-stone-200 p-6 sticky top-0 h-screen">
        <Link href="/" className="flex items-center gap-3 mb-10 group">
          <Image src={getImage("logo")} alt="Shivshambho" width={100} height={100} className="w-[100px] h-[100px] object-contain rounded-lg" />
          <div>
            <p className="font-semibold text-stone-800 text-sm">Admin Panel</p>
            <p className="text-[10px] text-stone-400">Shivshambho</p>
            <p className="text-[8px] text-stone-300 tracking-widest uppercase">crafted with tradition</p>
          </div>
        </Link>
        <nav className="flex flex-col gap-1 flex-1">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === tab.id ? "bg-stone-100 text-stone-900" : "text-stone-500 hover:text-stone-800 hover:bg-stone-50"
              }`}>
              <tab.icon size={18} strokeWidth={1.5} />
              {tab.label}
            </button>
          ))}
        </nav>
        <Link href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:text-stone-600 hover:bg-stone-50 transition-all">
          <LogOut size={18} strokeWidth={1.5} /> Back to Store
        </Link>
      </aside>

      <main className="flex-1 p-3 md:p-10 overflow-x-hidden">
        <div className="flex lg:hidden items-center justify-between mb-4 sticky top-0 z-40 bg-stone-50 -mx-3 px-3 py-3 border-b border-stone-200">
          <div>
            <h1 className="text-base font-bold text-stone-900">Admin Panel</h1>
            <p className="text-[10px] text-stone-400">Shivshambho</p>
          </div>
          <Link href="/" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-all border border-stone-200">
            <LogOut size={12} strokeWidth={1.5} /> Store
          </Link>
        </div>

        <div className="flex lg:hidden gap-1.5 mb-5 overflow-x-auto pb-1.5 no-scrollbar">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all shrink-0 ${
                activeTab === tab.id ? "bg-stone-900 text-white shadow-sm" : "bg-white text-stone-500 border border-stone-200"
              }`}>
              <tab.icon size={13} /> {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-6 h-6 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && <DashboardTab orders={orders} productsCount={products.length} />}
            {activeTab === "products" && <ProductsTab products={products} isOwner={isOwner} hasPerm={hasPerm} onProductChange={fetchProducts} toast={toast} />}
            {activeTab === "orders" && <OrdersTab orders={orders} isOwner={isOwner} hasPerm={hasPerm} onOrderChange={fetchOrders} />}
            {activeTab === "users" && isOwner && <UsersTab admins={admins} isOwner={isOwner} ownerEmail={ownerEmail} toast={toast} onAdminChange={fetchAdmins} />}
            {activeTab === "coupons" && isOwner && <CouponsTab isOwner={isOwner} toast={toast} />}
            {activeTab === "site-images" && <SiteImagesTab toast={toast} />}
            {activeTab === "activity" && isOwner && <ActivityLogTab />}
          </>
        )}
      </main>
    </div>
  );
}
