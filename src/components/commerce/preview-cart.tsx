"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState } from "react";
import Link from "next/link";

import { DESK_MATS, MAX_QTY, assetUrl, formatUSD, getDeskMatByVariant } from "@/lib/commerce/desk-mats";
import s from "@/components/commerce/commerce.module.css";

/*
 * Design-preview cart for the two desk mats.
 * Deliberately NOT the legacy CartProvider: that one carries clothing products and
 * feeds /api/checkout (Stripe, EUR, client-supplied prices), which desk mats must
 * never reach. State lives in memory only, keyed by Fourthwall variant ID.
 * No network requests, no checkout session, no order, no payment.
 */

interface CartLine {
  variantId: string;
  qty: number;
}

type Action =
  | { type: "add"; variantId: string; qty: number }
  | { type: "set"; variantId: string; qty: number }
  | { type: "remove"; variantId: string };

const clamp = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.round(n)));

function reducer(lines: CartLine[], action: Action): CartLine[] {
  if (!getDeskMatByVariant(action.variantId)) return lines; // unknown variant: ignore
  switch (action.type) {
    case "add": {
      const existing = lines.find((l) => l.variantId === action.variantId);
      if (existing) return lines.map((l) => (l === existing ? { ...l, qty: clamp(l.qty + action.qty) } : l));
      return [...lines, { variantId: action.variantId, qty: clamp(action.qty) }];
    }
    case "set":
      if (action.qty < 1) return lines.filter((l) => l.variantId !== action.variantId);
      return lines.map((l) => (l.variantId === action.variantId ? { ...l, qty: clamp(action.qty) } : l));
    case "remove":
      return lines.filter((l) => l.variantId !== action.variantId);
  }
}

interface PreviewCartValue {
  lines: CartLine[];
  count: number;
  plannedSubtotalCents: number;
  add: (variantId: string, qty: number, trigger?: HTMLElement | null) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  open: (trigger?: HTMLElement | null) => void;
  close: () => void;
  isOpen: boolean;
}

const PreviewCartContext = createContext<PreviewCartValue | null>(null);

export function usePreviewCart(): PreviewCartValue {
  const ctx = useContext(PreviewCartContext);
  if (!ctx) throw new Error("usePreviewCart must be used inside PreviewCartProvider");
  return ctx;
}

export function PreviewCartProvider({ children }: { children: React.ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, []);
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  const count = lines.reduce((n, l) => n + l.qty, 0);
  const plannedSubtotalCents = lines.reduce((sum, l) => sum + (getDeskMatByVariant(l.variantId)?.plannedPrice.amountCents ?? 0) * l.qty, 0);

  const open = useCallback((trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? (document.activeElement as HTMLElement | null);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const add = useCallback(
    (variantId: string, qty: number, trigger?: HTMLElement | null) => {
      dispatch({ type: "add", variantId, qty });
      open(trigger);
    },
    [open],
  );
  const setQty = useCallback((variantId: string, qty: number) => dispatch({ type: "set", variantId, qty }), []);
  const remove = useCallback((variantId: string) => dispatch({ type: "remove", variantId }), []);

  const value = useMemo(
    () => ({ lines, count, plannedSubtotalCents, add, setQty, remove, open, close, isOpen }),
    [lines, count, plannedSubtotalCents, add, setQty, remove, open, close, isOpen],
  );

  return (
    <PreviewCartContext.Provider value={value}>
      {children}
      <PreviewCartDrawer triggerRef={triggerRef} />
    </PreviewCartContext.Provider>
  );
}

function PreviewCartDrawer({ triggerRef }: { triggerRef: React.RefObject<HTMLElement | null> }) {
  const { lines, count, plannedSubtotalCents, setQty, remove, close, isOpen } = usePreviewCart();
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sync React state → native modal dialog (focus trap, Escape and inert background come from the platform).
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      document.body.style.overflow = "hidden";
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  const handleClose = useCallback(() => {
    document.body.style.overflow = "";
    close();
    const trigger = triggerRef.current;
    if (trigger && document.contains(trigger)) trigger.focus();
  }, [close, triggerRef]);

  return (
    <dialog
      ref={dialogRef}
      id="preview-cart"
      aria-labelledby="preview-cart-title"
      onClose={handleClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) close(); // backdrop click
      }}
      className={`kiu-cart h-dvh max-h-dvh w-[min(440px,100vw)] max-w-full bg-ink-2 text-paper border-l border-green/25 backdrop:bg-ink/75 ${s.drawer}`}
    >
      <div className="flex h-full flex-col">
        <header className={`flex items-start justify-between gap-4 border-b border-dim ${s.drawerHead}`}>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-orange">Interaction preview / no purchase</p>
            <h2 id="preview-cart-title" className="font-display text-[40px] leading-none text-paper">
              YOUR <span className="text-green">CART.</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close cart"
            data-cursor="h"
            className="flex h-11 w-11 items-center justify-center border border-dim font-mono text-sm text-paper hover:border-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
          >
            ✕
          </button>
        </header>

        <div className={`flex-1 overflow-y-auto ${s.drawerBody}`}>
          {lines.length === 0 ? (
            <div className={`kiu-empty-cart flex h-full flex-col items-start justify-center gap-5 ${s.emptyY}`}>
              <p className="font-display text-5xl leading-none text-paper/20">EMPTY</p>
              <p className="font-mono text-xs leading-relaxed text-slate">No desk mats selected in this preview.</p>
              <Link
                href="/commerce-preview/shop"
                onClick={close}
                data-cursor="shop"
                data-cursor-label="SHOP"
                className={`border border-green/40 font-mono text-[11px] uppercase tracking-[0.2em] text-green no-underline hover:bg-green hover:text-ink ${s.cta}`}
              >
                Browse desk mats
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-dim">
              {lines.map((line) => {
                const mat = getDeskMatByVariant(line.variantId);
                if (!mat) return null;
                const art = mat.images[0];
                return (
                  <li key={line.variantId} className={`kiu-cart-row grid grid-cols-[64px_minmax(0,1fr)] gap-x-4 gap-y-3 min-[400px]:grid-cols-[96px_minmax(0,1fr)_auto] ${s.rowY}`} data-variant={line.variantId}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- gated route asset; next/image optimizer cannot read SSO-protected previews */}
                    <img src={assetUrl(art.file)} alt="" width={art.width} height={art.height} className="h-auto w-16 rounded-[4px] border border-dim min-[400px]:w-24" />
                    <div className="min-w-0">
                      <p className="font-display text-2xl leading-none">{mat.name}</p>
                      <p className={`font-mono text-[11px] text-slate ${s.mt2}`}>{mat.size.label}</p>
                      <div className={`flex items-center gap-4 ${s.mt4}`}>
                        <div className="flex items-center border border-dim" role="group" aria-label={`Quantity for ${mat.name}`}>
                          <button type="button" data-cursor="h" aria-label={`Decrease ${mat.name}`} onClick={() => setQty(line.variantId, line.qty - 1)} className="flex h-9 w-9 items-center justify-center font-mono text-paper hover:text-green focus-visible:outline-2 focus-visible:outline-green">
                            −
                          </button>
                          <span className="w-8 text-center font-mono text-sm" aria-live="polite" data-qty>
                            {line.qty}
                          </span>
                          <button type="button" data-cursor="h" aria-label={`Increase ${mat.name}`} disabled={line.qty >= MAX_QTY} onClick={() => setQty(line.variantId, line.qty + 1)} className="flex h-9 w-9 items-center justify-center font-mono text-paper hover:text-green disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-green">
                            +
                          </button>
                        </div>
                        <button type="button" data-cursor="h" data-remove={mat.key} onClick={() => remove(line.variantId)} className="font-mono text-[11px] text-slate underline underline-offset-4 hover:text-orange focus-visible:outline-2 focus-visible:outline-green">
                          Remove
                        </button>
                      </div>
                    </div>
                    <p className="col-start-2 font-display text-2xl leading-none min-[400px]:col-start-auto min-[400px]:text-right">{formatUSD(mat.plannedPrice.amountCents * line.qty)}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <footer className={`border-t border-dim ${s.drawerFoot}`}>
            <div className="flex justify-between font-mono text-xs">
              <span>Shipping, taxes and fees</span>
              <span>At real checkout</span>
            </div>
            <div className={`flex items-end justify-between border-t border-dim ${s.ruleTop}`}>
              <span className="font-mono text-sm">Planned subtotal · {count} item{count === 1 ? "" : "s"}</span>
              <span className="font-display text-4xl leading-none" data-subtotal-cents={plannedSubtotalCents}>
                {formatUSD(plannedSubtotalCents)}
              </span>
            </div>
            <Link
              href="/commerce-preview/shop/handoff"
              onClick={close}
              data-cursor="shop"
              data-cursor-label="PREVIEW"
              className="flex min-h-14 items-center justify-center bg-paper font-display text-2xl tracking-[0.06em] text-ink no-underline hover:bg-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
            >
              PREVIEW CHECKOUT HANDOFF →
            </Link>
            <p className="font-mono text-[11px] leading-relaxed text-slate">
              Local design simulation. No Fourthwall cart or checkout session is created. Final retail totals have not been calculated.
            </p>
          </footer>
        )}
      </div>
    </dialog>
  );
}

export function PreviewCartButton({ className = "" }: { className?: string }) {
  const { count, open } = usePreviewCart();
  return (
    <button
      type="button"
      onClick={(e) => open(e.currentTarget)}
      data-cursor="shop"
      data-cursor-label="CART"
      data-open-preview-cart
      aria-haspopup="dialog"
      aria-controls="preview-cart"
      aria-label={`Preview cart, ${count} item${count === 1 ? "" : "s"}`}
      className={`border border-green/30 font-mono text-[11px] uppercase tracking-[0.2em] text-green hover:bg-green hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green ${className} ${s.pill}`}
    >
      Cart / {String(count).padStart(2, "0")}
    </button>
  );
}

/** Exposed only for dev assertions; derived from the registry so IDs cannot drift. */
export const PREVIEW_VARIANT_IDS = DESK_MATS.map((m) => m.variantId);
