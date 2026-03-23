"use client";

import { createContext, useContext, useState, useCallback, useMemo, useEffect, useRef } from "react";
import type { ProductData } from "@/lib/products";
import { PRODUCTS } from "@/lib/products";

/* ─── Types ─── */

export interface CartItem {
  product: ProductData;
  size: string;
  qty: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  addItem: (product: ProductData, size: string) => void;
  removeItem: (productId: string, size: string) => void;
  updateQty: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

/* ─── Cookie persistence helpers ─── */

interface StoredCartItem {
  id: string;
  size: string;
  qty: number;
}

const CART_COOKIE = "kpt_cart";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function readCartCookie(): CartItem[] {
  if (typeof document === "undefined") return [];
  try {
    const match = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${CART_COOKIE}=`));
    if (!match) return [];
    const stored: StoredCartItem[] = JSON.parse(decodeURIComponent(match.split("=")[1]));
    return stored
      .map((s) => {
        const product = PRODUCTS.find((p) => p.id === s.id);
        if (!product) return null;
        return { product, size: s.size, qty: s.qty };
      })
      .filter((x): x is CartItem => x !== null);
  } catch {
    return [];
  }
}

function writeCartCookie(items: CartItem[]) {
  if (typeof document === "undefined") return;
  const stored: StoredCartItem[] = items.map((i) => ({
    id: i.product.id,
    size: i.size,
    qty: i.qty,
  }));
  const value = encodeURIComponent(JSON.stringify(stored));
  document.cookie = `${CART_COOKIE}=${value};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
}

/* ─── Context ─── */

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}

/* ─── Provider ─── */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const hydrated = useRef(false);

  /* Hydrate from cookie on mount */
  useEffect(() => {
    const stored = readCartCookie();
    if (stored.length > 0) setItems(stored);
    hydrated.current = true;
  }, []);

  /* Persist to cookie on change (skip initial hydration) */
  useEffect(() => {
    if (hydrated.current) {
      writeCartCookie(items);
    }
  }, [items]);

  const addItem = useCallback((product: ProductData, size: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id && i.size === size);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(next[idx].qty + 1, 10) };
        return next;
      }
      return [...prev, { product, size, qty: 1 }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
  }, []);

  const updateQty = useCallback((productId: string, size: string, qty: number) => {
    if (qty <= 0) {
      setItems((prev) => prev.filter((i) => !(i.product.id === productId && i.size === size)));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId && i.size === size ? { ...i, qty: Math.min(qty, 10) } : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setIsOpen(false);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((v) => !v), []);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((s, i) => s + i.product.price * i.qty, 0), [items]);

  const value = useMemo<CartContextValue>(
    () => ({ items, totalItems, totalPrice, isOpen, addItem, removeItem, updateQty, clearCart, openCart, closeCart, toggleCart }),
    [items, totalItems, totalPrice, isOpen, addItem, removeItem, updateQty, clearCart, openCart, closeCart, toggleCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
