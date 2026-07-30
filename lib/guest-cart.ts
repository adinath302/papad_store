export type GuestCartItem = {
  productId: string;
  variantId?: string;
  name: string;
  image: string | null;
  quantity: number;
  price: number;
};

const STORAGE_KEY = "papad_guest_cart";

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function notifyCartUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("cart-updated"));
}

export function setGuestCart(items: GuestCartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  notifyCartUpdate();
}

export function addToGuestCart(item: GuestCartItem) {
  const cart = getGuestCart();
  const existing = cart.find(
    (i) => i.productId === item.productId && i.variantId === item.variantId,
  );
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  setGuestCart(cart);
}

export function removeFromGuestCart(productId: string, variantId?: string) {
  setGuestCart(
    getGuestCart().filter((i) => {
      if (i.productId !== productId) return true;
      if (variantId === undefined) return i.variantId !== undefined;
      return i.variantId !== variantId;
    }),
  );
}

export function updateGuestCartQuantity(
  productId: string,
  quantity: number,
  variantId?: string,
) {
  const cart = getGuestCart();
  const item = cart.find((i) => {
    if (i.productId !== productId) return false;
    if (variantId === undefined) return i.variantId === undefined;
    return i.variantId === variantId;
  });
  if (item) {
    if (quantity <= 0) {
      removeFromGuestCart(productId, variantId);
    } else {
      item.quantity = quantity;
      setGuestCart(cart);
    }
  }
}

export function clearGuestCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  notifyCartUpdate();
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  const match = document.cookie.match(/(?:^|;\s*)isLoggedIn=([^;]*)/);
  return match !== null && match[1] === "true";
}
