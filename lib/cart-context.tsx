"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { getGuestCart, isLoggedIn } from "./guest-cart";

interface CartCountContextType {
  count: number;
}

const CartCountContext = createContext<CartCountContextType>({ count: 0 });

export function CartCountProvider({ children }: { children: ReactNode }) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(() => {
    if (!isLoggedIn()) {
      const items = getGuestCart();
      setCount(items.reduce((sum, i) => sum + i.quantity, 0));
    } else {
      fetch("/api/cart")
        .then((r) => {
          if (!r.ok) return null;
          return r.json();
        })
        .then((data) => {
          if (data === null) return;
          setCount(data.reduce((sum: number, item: any) => sum + item.quantity, 0));
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener("cart-updated", handler);
    return () => window.removeEventListener("cart-updated", handler);
  }, [refresh]);

  return (
    <CartCountContext.Provider value={{ count }}>
      {children}
    </CartCountContext.Provider>
  );
}

export function useCartCount() {
  return useContext(CartCountContext).count;
}
