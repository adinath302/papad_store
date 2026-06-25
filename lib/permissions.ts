export type Resource = "products" | "orders" | "dashboard";
export type Action =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "update_status"
  | "add_tracking";

export type PermissionMap = Partial<
  Record<Resource, Partial<Record<Action, boolean>>>
>;

export const RESOURCES: Resource[] = ["products", "orders", "dashboard"];

export const RESOURCE_ACTIONS: Record<Resource, Action[]> = {
  products: ["view", "create", "edit", "delete"],
  orders: ["view", "update_status", "add_tracking"],
  dashboard: ["view"],
};

export const ACTION_LABELS: Record<Action, string> = {
  view: "View",
  create: "Create",
  edit: "Edit",
  delete: "Delete",
  update_status: "Update Status",
  add_tracking: "Add Tracking",
};

export const RESOURCE_LABELS: Record<Resource, string> = {
  products: "Products",
  orders: "Orders",
  dashboard: "Dashboard",
};

export const OWNER_EMAIL =
  process.env.OWNER_EMAIL || "shivshambho@gmail.com";

export function isOwner(email: string | null | undefined): boolean {
  return email?.toLowerCase() === OWNER_EMAIL.toLowerCase();
}

export function can(
  permissions: unknown,
  resource: Resource,
  action: Action,
): boolean {
  if (!permissions || typeof permissions !== "object") return false;
  const map = permissions as PermissionMap;
  return map[resource]?.[action] === true;
}

export function canView(
  permissions: unknown,
  resource: Resource,
): boolean {
  return can(permissions, resource, "view");
}

export function getPermissionsForOwner(): PermissionMap {
  const all: PermissionMap = {};
  for (const r of RESOURCES) {
    const actions: Partial<Record<Action, boolean>> = {};
    for (const a of RESOURCE_ACTIONS[r]) {
      actions[a] = true;
    }
    all[r] = actions;
  }
  return all;
}
