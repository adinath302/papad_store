export type Permission = "products" | "orders" | "dashboard" | "admins";

export const ALL_PERMISSIONS: Permission[] = [
  "products",
  "orders",
  "dashboard",
  "admins",
];

export const PERMISSION_LABELS: Record<Permission, string> = {
  products: "Manage Products",
  orders: "Manage Orders",
  dashboard: "View Dashboard",
  admins: "Manage Admins",
};

export const OWNER_EMAIL = "shivshambho@gmail.com";

export function isOwner(email: string | null | undefined): boolean {
  return email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

export function hasPermission(
  permissions: string | null | undefined,
  permission: Permission,
): boolean {
  if (!permissions) return false;
  return permissions.split(",").includes(permission);
}

export function canManageAdmins(
  email: string | null | undefined,
  permissions: string | null | undefined,
): boolean {
  return isOwner(email) || hasPermission(permissions, "admins");
}
