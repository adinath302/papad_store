export type GuestWishlistItem = {
  productId: string;
};

const STORAGE_KEY = "papad_guest_wishlist";

export function getGuestWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleGuestWishlist(productId: string): boolean {
  const wishlist = getGuestWishlist();
  const idx = wishlist.indexOf(productId);
  if (idx >= 0) {
    wishlist.splice(idx, 1);
    setGuestWishlist(wishlist);
    return false;
  } else {
    wishlist.push(productId);
    setGuestWishlist(wishlist);
    return true;
  }
}

export function setGuestWishlist(items: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function isInGuestWishlist(productId: string): boolean {
  return getGuestWishlist().includes(productId);
}
