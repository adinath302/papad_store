export type GuestCartItem = {
  productId: string;
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

export function setGuestCart(items: GuestCartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addToGuestCart(item: GuestCartItem) {
  const cart = getGuestCart();
  const existing = cart.find((i) => i.productId === item.productId);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  setGuestCart(cart);
}

export function removeFromGuestCart(productId: string) {
  setGuestCart(getGuestCart().filter((i) => i.productId !== productId));
}

export function updateGuestCartQuantity(productId: string, quantity: number) {
  const cart = getGuestCart();
  const item = cart.find((i) => i.productId === productId);
  if (item) {
    if (quantity <= 0) {
      removeFromGuestCart(productId);
    } else {
      item.quantity = quantity;
      setGuestCart(cart);
    }
  }
}

export function clearGuestCart() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!document.cookie.match(/(?:^|;\s*)userId=([^;]*)/);
}
