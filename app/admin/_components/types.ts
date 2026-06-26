export type Product = {
  id: string;
  name: string;
  description: string | null;
  stock: number | null;
  weight: number;
  image: string | null;
  thumbnail: string | null;
  productType: string;
  productvariant: { id: string; label: string; price: number }[];
};

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  product: { id: string; name: string };
};

export type Order = {
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

export type AdminUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  permissions: Record<string, any> | null;
};

export type PermissionMap = Record<string, Record<string, boolean>>;

export const RESOURCE_ACTIONS: Record<string, { value: string; label: string }[]> = {
  products: [
    { value: "view", label: "View" },
    { value: "create", label: "Create" },
    { value: "edit", label: "Edit" },
    { value: "delete", label: "Delete" },
  ],
  orders: [
    { value: "view", label: "View" },
    { value: "update_status", label: "Update Status" },
    { value: "add_tracking", label: "Add Tracking" },
  ],
  dashboard: [{ value: "view", label: "View" }],
};

export const RESOURCE_LABELS: Record<string, string> = {
  products: "Products",
  orders: "Orders",
  dashboard: "Dashboard",
};

export const statusStyles: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  SHIPPED: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  DELIVERED: "bg-stone-100 text-stone-600 ring-1 ring-stone-200",
  CANCELLED: "bg-red-50 text-red-600 ring-1 ring-red-200",
};
