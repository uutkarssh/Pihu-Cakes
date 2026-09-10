"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItemT } from "./types";

export type RouteView =
  | { name: "home" } | { name: "search"; query?: string; category?: string }
  | { name: "product"; slug: string } | { name: "cart" } | { name: "checkout" }
  | { name: "confirmation"; orderId: string } | { name: "account" } | { name: "contact" }
  | { name: "admin" };

interface AppState {
  view: RouteView; history: RouteView[]; navigate: (v: RouteView) => void; back: () => void;
  cart: CartItemT[]; addToCart: (item: CartItemT) => void; updateCartQty: (productId: string, weight: string, qty: number) => void;
  setCartWeight: (productId: string, oldWeight: string, item: CartItemT) => void; removeFromCart: (productId: string, weight: string) => void;
  clearCart: () => void; cartCount: () => number; cartSubtotal: () => number; couponCode: string | null; setCoupon: (code: string | null) => void;
  wishlist: string[]; toggleWishlist: (id: string) => void; customer: { name: string; mobile: string; email?: string } | null;
  setCustomer: (c: { name: string; mobile: string; email?: string } | null) => void;
  fbUser: { uid: string; email: string | null; name: string | null; mobile: string | null } | null;
  setFbUser: (u: { uid: string; email: string | null; name: string | null; mobile: string | null } | null) => void;
  fbReady: boolean; setFbReady: (v: boolean) => void; adminAuthed: boolean; setAdminAuthed: (v: boolean) => void;
}

export const useApp = create<AppState>()(persist((set, get) => ({
  view: { name: "home" }, history: [],
  navigate: (v) => { const cur = get().view; set({ view: v, history: [...get().history, cur].slice(-20) }); if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" }); },
  back: () => { const h = [...get().history]; if (!h.length) { set({ view: { name: "home" } }); return; } const prev = h.pop()!; set({ view: prev, history: h }); if (typeof window !== "undefined") window.scrollTo({ top: 0 }); },
  cart: [],
  addToCart: (item) => set((s) => { const idx = s.cart.findIndex((c) => c.productId === item.productId && c.weight === item.weight); if (idx >= 0) { const next = [...s.cart]; next[idx] = { ...next[idx], qty: next[idx].qty + item.qty }; return { cart: next }; } return { cart: [...s.cart, item] }; }),
  updateCartQty: (productId, weight, qty) => set((s) => ({ cart: s.cart.map((c) => c.productId === productId && c.weight === weight ? { ...c, qty: Math.max(1, qty) } : c).filter((c) => c.qty > 0) })),
  setCartWeight: (productId, oldWeight, item) => set((s) => { const without = s.cart.filter((c) => !(c.productId === productId && c.weight === oldWeight)); const idx = without.findIndex((c) => c.productId === item.productId && c.weight === item.weight); if (idx >= 0) { const next = [...without]; next[idx] = { ...next[idx], qty: next[idx].qty + item.qty }; return { cart: next }; } return { cart: [...without, item] }; }),
  removeFromCart: (productId, weight) => set((s) => ({ cart: s.cart.filter((c) => !(c.productId === productId && c.weight === weight)) })),
  clearCart: () => set({ cart: [] }), cartCount: () => get().cart.reduce((n, c) => n + c.qty, 0), cartSubtotal: () => get().cart.reduce((n, c) => n + c.qty * c.price, 0),
  couponCode: null, setCoupon: (code) => set({ couponCode: code }), wishlist: [], toggleWishlist: (id) => set((s) => ({ wishlist: s.wishlist.includes(id) ? s.wishlist.filter((x) => x !== id) : [...s.wishlist, id] })),
  customer: null, setCustomer: (c) => set({ customer: c }), fbUser: null, setFbUser: (u) => set({ fbUser: u }), fbReady: false, setFbReady: (v) => set({ fbReady: v }), adminAuthed: false, setAdminAuthed: (v) => set({ adminAuthed: v }),
}), { name: "kcb-bakery", skipHydration: true, partialize: (s) => ({ cart: s.cart, couponCode: s.couponCode, wishlist: s.wishlist, customer: s.customer, adminAuthed: s.adminAuthed }) }));
