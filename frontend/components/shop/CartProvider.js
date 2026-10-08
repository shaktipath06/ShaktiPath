'use client';

// Client-side shopping cart. Lines are kept in the browser (localStorage) until checkout and orders exist on
// the API (the `cart_items` and `orders` tables are ready for that). Mounted once in app/layout.js.
//
// localStorage is read through useSyncExternalStore: the server and the first client render see an empty
// cart (no hydration mismatch), then the stored lines appear and stay in sync across tabs.
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'shaktipath.cart.v1';
const EMPTY_ITEMS = [];
const CartContext = createContext(null);
const noop = () => {};
const INERT = { items: EMPTY_ITEMS, count: 0, subtotal: 0, add: noop, setQty: noop, remove: noop, clear: noop };

const valid = (it) => it && typeof it.key === 'string' && typeof it.name === 'string' && Number.isFinite(Number(it.price));
const clampQty = (n) => Math.max(1, Math.min(99, Math.round(Number(n) || 1)));

// ---- external store backed by localStorage ----
const listeners = new Set();
let cachedRaw = null;
let cachedItems = EMPTY_ITEMS;

function parse(raw) {
  try {
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter(valid).map((it) => ({ ...it, price: Number(it.price), qty: clampQty(it.qty) })) : EMPTY_ITEMS;
  } catch {
    return EMPTY_ITEMS;
  }
}

function readItems() {
  let raw = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    raw = null;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedItems = parse(raw);
  }
  return cachedItems;
}

function writeItems(items) {
  const raw = JSON.stringify(items);
  cachedRaw = raw;
  cachedItems = items;
  try {
    window.localStorage.setItem(STORAGE_KEY, raw);
  } catch {
    // Storage may be unavailable (private mode); the cart then lives for the page only.
  }
  listeners.forEach((cb) => cb());
}

function subscribe(callback) {
  listeners.add(callback);
  const onStorage = (e) => {
    if (e.key === STORAGE_KEY || e.key === null) callback();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener('storage', onStorage);
  };
}

const serverSnapshot = () => EMPTY_ITEMS;

export function CartProvider({ children }) {
  const items = useSyncExternalStore(subscribe, readItems, serverSnapshot);

  const add = useCallback((item, qty = 1) => {
    if (!valid(item)) return;
    const prev = readItems();
    const i = prev.findIndex((x) => x.key === item.key);
    if (i >= 0) {
      const next = prev.slice();
      next[i] = { ...next[i], qty: clampQty(next[i].qty + qty) };
      writeItems(next);
    } else {
      writeItems([...prev, { ...item, price: Number(item.price), qty: clampQty(qty) }]);
    }
  }, []);
  const setQty = useCallback((key, qty) => {
    writeItems(readItems().map((x) => (x.key === key ? { ...x, qty: clampQty(qty) } : x)));
  }, []);
  const remove = useCallback((key) => writeItems(readItems().filter((x) => x.key !== key)), []);
  const clear = useCallback(() => writeItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((s, x) => s + x.qty, 0),
      subtotal: Math.round(items.reduce((s, x) => s + x.price * x.qty, 0) * 100) / 100,
      add,
      setQty,
      remove,
      clear,
    }),
    [items, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** The cart, or an inert empty cart when no provider is mounted. */
export function useCart() {
  return useContext(CartContext) || INERT;
}
