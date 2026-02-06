"use client";
import { useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
  quantity: number;
  price?: number;
  currency?: string;
  name?: string;
  image?: string;
  slug?: string;
};

const KEY = "tma_cart_v1";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  // Save only AFTER hydration (prevents wiping)
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const totalQty = useMemo(() => items.reduce((a, b) => a + b.quantity, 0), [items]);

  function add(productId: string, qty = 1, meta?: Partial<CartItem>) {
    setItems((prev) => {
      const copy = [...prev];
      const idx = copy.findIndex((x) => x.productId === productId);
      if (idx >= 0) copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + qty, ...meta };
      else copy.push({ productId, quantity: qty, ...meta });
      return copy;
    });
  }

  function remove(productId: string) {
    setItems((prev) => prev.filter((x) => x.productId !== productId));
  }

  function setQty(productId: string, qty: number) {
    setItems((prev) =>
      prev.map((x) => (x.productId === productId ? { ...x, quantity: Math.max(1, qty) } : x))
    );
  }

  function clear() {
    setItems([]);
  }

  return { items, totalQty, add, remove, setQty, clear, hydrated };
}
