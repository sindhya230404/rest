import { useSyncExternalStore } from "react";
import type { FoodItem } from "./mock-data";

export type CartItem = {
  food: FoodItem;
  qty: number;
  note?: string;
  addons?: string[];
};

type State = { items: CartItem[]; coupon?: string; activeOrderId?: string };

let state: State = { items: [] };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const cart = {
  add(food: FoodItem, qty = 1) {
    const existing = state.items.find((i) => i.food.id === food.id);
    if (existing) {
      state = {
        ...state,
        items: state.items.map((i) =>
          i.food.id === food.id ? { ...i, qty: i.qty + qty } : i,
        ),
      };
    } else {
      state = { ...state, items: [...state.items, { food, qty }] };
    }
    emit();
  },
  remove(id: string) {
    state = { ...state, items: state.items.filter((i) => i.food.id !== id) };
    emit();
  },
  setQty(id: string, qty: number) {
    if (qty <= 0) return cart.remove(id);
    state = {
      ...state,
      items: state.items.map((i) => (i.food.id === id ? { ...i, qty } : i)),
    };
    emit();
  },
  applyCoupon(code: string) {
    state = { ...state, coupon: code };
    emit();
  },
  setActiveOrder(orderId: string) {
    state = { ...state, activeOrderId: orderId };
    try {
      localStorage.setItem("aura_dine_active_order_id", orderId);
    } catch {}
    emit();
  },
  getActiveOrderId(): string | undefined {
    if (state.activeOrderId) return state.activeOrderId;
    try {
      return localStorage.getItem("aura_dine_active_order_id") || undefined;
    } catch {
      return undefined;
    }
  },
  clear() {
    state = { ...state, items: [], coupon: undefined };
    emit();
  },
};

export function useCart() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => state,
    () => state,
  );
}

export function cartTotals(items: CartItem[], coupon?: string) {
  const subtotal = items.reduce((s, i) => s + i.food.price * i.qty, 0);
  const discount = coupon ? Math.round(subtotal * 0.1) : 0;
  const gst = Math.round((subtotal - discount) * 0.05);
  const total = subtotal - discount + gst;
  const itemsCount = items.reduce((s, i) => s + i.qty, 0);
  return { subtotal, discount, gst, total, itemsCount };
}
