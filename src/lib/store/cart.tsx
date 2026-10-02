"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";

import { CHECKOUT_ORIGIN, MAX_LINES, MAX_QTY, formatPrice } from "@/lib/store/core";
import { addLine, applyPriceChanges, checkoutBody, parseStoredCart } from "@/lib/store/cart-model";
import { track } from "@/lib/analytics";

import type { AddResult, CartLine } from "@/lib/store/cart-model";

export type { CartLine } from "@/lib/store/cart-model";

/*
 * Browser cart for the live shop. Lines are keyed by Fourthwall variant ID and kept in
 * localStorage (display snapshot only). At checkout the server re-validates every variant
 * against the live catalog, Fourthwall prices the cart, and payment happens on the hosted checkout.
 * Leaving for the hosted checkout does NOT empty the cart: nothing here knows whether a purchase happened.
 */

const KEY = "kiu-cart-v1";
const EMPTY: CartLine[] = [];
const subtotalOf = (ls: CartLine[]) => ls.reduce((n, l) => n + l.qty * l.unitCents, 0);
let lines: CartLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    lines = parseStoredCart(window.localStorage.getItem(KEY));
  } catch {
    lines = EMPTY;
  }
}
function commit(next: CartLine[]) {
  lines = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable: cart still works for this tab */
  }
  listeners.forEach((l) => l());
}
const store = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) {
        loaded = false;
        load();
        cb();
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot() {
    load();
    return lines;
  },
  getServerSnapshot() {
    return EMPTY;
  },
};

interface CartValue {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  notice: string | null;
  add: (line: Omit<CartLine, "qty">, qty: number, trigger?: HTMLElement | null) => AddResult;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  open: (trigger?: HTMLElement | null) => void;
  close: () => void;
}

const CartContext = createContext<CartValue | null>(null);

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

const NOTICES: Partial<Record<AddResult, string>> = {
  capped: `Quantity is limited to ${MAX_QTY} per item.`,
  "line-limit": `Your cart holds up to ${MAX_LINES} different items. Check out or remove one to add another.`,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const current = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);
  const [isOpen, setIsOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? (document.activeElement as HTMLElement | null);
    setIsOpen(true);
    track("view_cart", { currency: "USD", value: lines.length > 0 ? subtotalOf(lines) / 100 : undefined, items: lines.map((l) => ({ item_variant: l.variantId, item_id: l.slug, price: l.unitCents / 100, quantity: l.qty })) });
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const add = useCallback(
    (line: Omit<CartLine, "qty">, qty: number, trigger?: HTMLElement | null) => {
      const { lines: next, result } = addLine(lines, line, qty);
      if (result !== "line-limit") {
        commit(next);
        track("add_to_cart", { currency: "USD", value: (line.unitCents * qty) / 100, items: [{ item_id: line.slug, item_variant: line.variantId, price: line.unitCents / 100, quantity: qty }] });
      }
      setNotice(NOTICES[result] ?? null);
      open(trigger);
      return result;
    },
    [open],
  );
  const setQty = useCallback((variantId: string, qty: number) => {
    setNotice(null);
    commit(qty < 1 ? lines.filter((l) => l.variantId !== variantId) : lines.map((l) => (l.variantId === variantId ? { ...l, qty: Math.min(MAX_QTY, qty) } : l)));
  }, []);
  const remove = useCallback((variantId: string) => {
    setNotice(null);
    commit(lines.filter((l) => l.variantId !== variantId));
  }, []);

  const value = useMemo<CartValue>(
    () => ({
      lines: current,
      count: current.reduce((n, l) => n + l.qty, 0),
      subtotalCents: subtotalOf(current),
      isOpen, notice, add, setQty, remove, open, close,
    }),
    [current, isOpen, notice, add, setQty, remove, open, close],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer triggerRef={triggerRef} />
    </CartContext.Provider>
  );
}

const MESSAGES: Record<string, string> = {
  UNKNOWN_VARIANT: "One of these items is no longer available. Remove it and try again.",
  VARIANT_UNAVAILABLE: "One of these items is no longer available. Remove it and try again.",
  CART_REJECTED: "Fourthwall could not accept one of these items. Remove items that changed and try again.",
  INVALID_QUANTITY: `Quantity is limited to ${MAX_QTY} per item.`,
  PRICE_CHANGED: "A price changed since you added it. The cart now shows the current price — check it and continue.",
};
const FALLBACK = "Checkout is temporarily unavailable. Your cart is saved — please try again in a moment.";

function CartDrawer({ triggerRef }: { triggerRef: React.RefObject<HTMLElement | null> }) {
  const { lines: items, count, subtotalCents, setQty, remove, close, isOpen, notice } = useCart();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (isOpen && !d.open) {
      d.showModal();
      document.body.style.overflow = "hidden";
    } else if (!isOpen && d.open) {
      d.close();
    }
  }, [isOpen]);

  // Back from the hosted checkout restores this page from bfcache: release the pending state.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setPending(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const onClose = useCallback(() => {
    document.body.style.overflow = "";
    setPending(false);
    close();
    const t = triggerRef.current;
    if (t && document.contains(t)) t.focus();
  }, [close, triggerRef]);

  async function checkout() {
    if (pending) return;
    const snapshot = lines; // exactly what the summary shows is what gets sent
    setPending(true);
    setError(null);
    track("begin_checkout", { currency: "USD", value: subtotalCents / 100, items: snapshot.map((l) => ({ item_id: l.slug, item_variant: l.variantId, price: l.unitCents / 100, quantity: l.qty })) });
    try {
      const res = await fetch("/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkoutBody(snapshot)),
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string; lines?: { variantId: string; unitCents: number }[] };
      if (res.status === 409 && data.error === "PRICE_CHANGED" && Array.isArray(data.lines)) {
        commit(applyPriceChanges(lines, data.lines));
        setError(MESSAGES.PRICE_CHANGED);
        setPending(false);
        track("checkout_error", { reason: "PRICE_CHANGED" });
        return;
      }
      if (!res.ok || !data.url || !data.url.startsWith(`${CHECKOUT_ORIGIN}/`)) {
        setError((data.error && MESSAGES[data.error]) || FALLBACK);
        setPending(false);
        track("checkout_error", { reason: data.error ?? `HTTP_${res.status}` });
        return;
      }
      // A redirect to the hosted checkout is not a purchase; purchase comes only from the platform.
      track("checkout_redirect", {
        currency: "USD",
        value: subtotalCents / 100,
        // What was in the cart, never the checkout URL, a cart id or a session.
        items: snapshot.map((l) => ({ item_id: l.slug, item_variant: l.variantId, quantity: l.qty })),
      });
      window.location.assign(data.url);
    } catch {
      setError(FALLBACK);
      setPending(false);
      track("checkout_error", { reason: "NETWORK" });
    }
  }

  return (
    <dialog
      ref={dialogRef}
      id="cart"
      aria-labelledby="cart-title"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className="m-0 ml-auto h-dvh max-h-dvh w-[min(440px,100vw)] max-w-full border-l border-green/25 bg-ink-2 p-0 text-paper backdrop:bg-ink/75"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-dim p-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-green">KEEP IT UNDERGROUND</p>
            <h2 id="cart-title" className="font-display text-[40px] leading-none">
              YOUR <span className="text-green">CART.</span>
            </h2>
          </div>
          <button type="button" onClick={close} aria-label="Close cart" data-cursor="h" className="flex h-11 w-11 items-center justify-center border border-dim font-mono text-sm hover:border-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green">
            ✕
          </button>
        </header>

        {notice && (
          <p role="status" className="border-b border-dim px-6 py-3 font-mono text-[11px] text-orange" data-cart-notice>
            {notice}
          </p>
        )}

        <div className="flex-1 overflow-y-auto px-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-start justify-center gap-5 py-12" data-empty-cart>
              <p className="font-display text-5xl leading-none text-paper/20">EMPTY</p>
              <p className="font-mono text-xs text-slate">Nothing in your cart yet.</p>
              <Link href="/shop" onClick={close} data-cursor="shop" data-cursor-label="SHOP" className="border border-green/40 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-green no-underline hover:bg-green hover:text-ink">
                Browse the shop
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-dim">
              {items.map((l) => (
                <li key={l.variantId} data-cart-row data-variant={l.variantId} className="grid grid-cols-[64px_minmax(0,1fr)] gap-x-4 gap-y-3 py-6 min-[400px]:grid-cols-[80px_minmax(0,1fr)_auto]">
                  {l.image ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Fourthwall CDN image, already resized
                    <img src={l.image.url} alt="" width={l.image.width} height={l.image.height} className="h-auto w-16 border border-dim min-[400px]:w-20" />
                  ) : (
                    <span className="h-20 w-16 border border-dim min-[400px]:w-20" />
                  )}
                  <div className="min-w-0">
                    <Link href={`/shop/${l.slug}?variant=${l.variantId}`} onClick={close} data-cursor="shop" className="font-display text-2xl leading-none text-paper no-underline hover:text-green">
                      {l.name}
                    </Link>
                    <p className="mt-2 font-mono text-[11px] text-slate" data-cart-variant>{l.variantLabel} · {formatPrice(l.unitCents)} each</p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex items-center border border-dim" role="group" aria-label={`Quantity for ${l.name}`}>
                        <button type="button" data-cursor="h" aria-label={`Decrease ${l.name}`} disabled={pending} onClick={() => setQty(l.variantId, l.qty - 1)} className="flex h-9 w-9 items-center justify-center font-mono hover:text-green disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-green">−</button>
                        <span className="w-8 text-center font-mono text-sm" aria-live="polite">{l.qty}</span>
                        <button type="button" data-cursor="h" aria-label={`Increase ${l.name}`} disabled={pending || l.qty >= MAX_QTY} onClick={() => setQty(l.variantId, l.qty + 1)} className="flex h-9 w-9 items-center justify-center font-mono hover:text-green disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-green">+</button>
                      </div>
                      <button type="button" data-cursor="h" disabled={pending} onClick={() => remove(l.variantId)} className="font-mono text-[11px] text-slate underline underline-offset-4 hover:text-orange disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-green">
                        Remove
                      </button>
                    </div>
                  </div>
                  <p className="col-start-2 font-display text-2xl leading-none min-[400px]:col-start-auto min-[400px]:text-right">{formatPrice(l.unitCents * l.qty)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="space-y-4 border-t border-dim p-6">
            <div className="flex items-end justify-between">
              <span className="font-mono text-sm">Subtotal · {count} item{count === 1 ? "" : "s"}</span>
              <span className="font-display text-4xl leading-none" data-subtotal-cents={subtotalCents}>{formatPrice(subtotalCents)}</span>
            </div>
            <p className="font-mono text-[11px] text-slate">Shipping and taxes are calculated at checkout. Made to order — see <Link href="/help" onClick={close} className="text-green underline underline-offset-4">shipping &amp; returns</Link>.</p>
            {error && <p role="alert" className="font-mono text-[11px] text-orange" data-checkout-error>{error}</p>}
            <button
              type="button"
              onClick={checkout}
              disabled={pending}
              aria-busy={pending}
              data-cursor="shop"
              data-cursor-label="PAY"
              data-checkout
              className="flex min-h-14 w-full items-center justify-center gap-3 bg-green font-display text-2xl tracking-[0.06em] text-ink hover:bg-paper disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
            >
              {pending ? "OPENING CHECKOUT…" : "CHECKOUT"} <span aria-hidden="true">→</span>
            </button>
            <p className="font-mono text-[10px] leading-relaxed text-slate">Secure checkout and payment by Fourthwall.</p>
          </footer>
        )}
      </div>
    </dialog>
  );
}
