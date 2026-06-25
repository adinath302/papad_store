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
        .then((r) => r.json())
        .then((data: Array<{ quantity: number }>) => {
          setCount(data.reduce((sum, i) => sum + i.quantity, 0));
        })
        .catch(() => setCount(0));
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
