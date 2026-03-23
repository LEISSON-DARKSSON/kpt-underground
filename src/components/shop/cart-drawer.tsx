"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import { formatEUR, getLineColor } from "@/lib/products";

export function CartDrawer() {
  const { items, totalItems, totalPrice, isOpen, closeCart, removeItem, updateQty } = useCart();
  const drawerRef = useRef<HTMLDivElement>(null);

  /* Lock body scroll when open */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) closeCart();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, closeCart]);

  /* Focus trap: focus drawer when opened */
  useEffect(() => {
    if (isOpen && drawerRef.current) {
      drawerRef.current.focus();
    }
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 transition-opacity duration-300"
        style={{
          zIndex: "var(--z-cart)" as string,
          background: "rgba(5, 5, 5, 0.7)",
          backdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        tabIndex={-1}
        className="fixed top-0 right-0 bottom-0 flex flex-col transition-transform duration-500"
        style={{
          zIndex: "var(--z-cart)" as string,
          width: "min(420px, 90vw)",
          background: "var(--ink2)",
          borderLeft: "1px solid rgba(138, 206, 0, 0.08)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-dim">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl text-green tracking-[0.12em]">CART</span>
            {totalItems > 0 && (
              <span className="font-mono text-[10px] tracking-[0.14em] text-ink bg-green px-2 py-0.5">
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="font-mono text-[10px] tracking-[0.3em] text-muted hover:text-paper transition-colors duration-200"
            style={{ minWidth: 44, minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}
            data-cursor="h"
            aria-label="Close cart"
          >
            CLOSE &#x2715;
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: "thin", scrollbarColor: "var(--dim) transparent" }}>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="font-display text-3xl text-paper/10 mb-4">EMPTY</span>
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mb-8">
                NO EQUIPMENT SELECTED
              </p>
              <Link
                href="/shop"
                onClick={closeCart}
                className="font-mono text-[10px] tracking-[0.3em] uppercase text-green border border-green/30 px-6 py-3 hover:bg-green hover:text-ink transition-colors duration-200 no-underline"
                data-cursor="shop"
              >
                BROWSE EQUIPMENT
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => {
                const lineColor = getLineColor(item.product.line);
                return (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="relative border border-dim p-4"
                  >
                    {/* Line accent */}
                    <div className="absolute top-0 left-0 w-[2px] h-full" style={{ backgroundColor: lineColor }} />

                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <span className="font-mono text-[9px] tracking-[0.14em] uppercase block mb-1" style={{ color: lineColor }}>
                          {item.product.ref}
                        </span>
                        <span className="font-display text-lg text-paper leading-tight block truncate">
                          {item.product.name}
                        </span>
                        <span className="font-mono text-[10px] tracking-[0.1em] text-muted block mt-1">
                          SIZE: {item.size}
                        </span>
                      </div>
                      <span className="font-display text-lg text-paper whitespace-nowrap">
                        {formatEUR(item.product.price * item.qty)}
                      </span>
                    </div>

                    {/* Qty controls + remove */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-0 border border-dim">
                        <button
                          onClick={() => updateQty(item.product.id, item.size, item.qty - 1)}
                          className="font-mono text-[11px] text-muted hover:text-paper transition-colors duration-200 border-r border-dim"
                          style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}
                          data-cursor="h"
                          aria-label={`Decrease quantity of ${item.product.name}`}
                        >
                          &minus;
                        </button>
                        <span
                          className="font-mono text-[11px] text-paper"
                          style={{ width: 36, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}
                        >
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item.product.id, item.size, item.qty + 1)}
                          className="font-mono text-[11px] text-muted hover:text-paper transition-colors duration-200 border-l border-dim"
                          style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center" }}
                          data-cursor="h"
                          aria-label={`Increase quantity of ${item.product.name}`}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id, item.size)}
                        className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted hover:text-orange transition-colors duration-200"
                        style={{ minHeight: 32, display: "flex", alignItems: "center" }}
                        data-cursor="h"
                        aria-label={`Remove ${item.product.name} from cart`}
                      >
                        REMOVE
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — only show when items exist */}
        {items.length > 0 && (
          <div className="px-6 py-5 border-t border-dim space-y-4">
            {/* Artist fund callout */}
            <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-orange text-center py-2 border border-orange/20">
              {formatEUR(Math.round(totalPrice * 0.1))} OF THIS ORDER FUNDS UNDERGROUND ARTISTS
            </div>

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-muted">TOTAL</span>
              <span className="font-display text-2xl text-paper">{formatEUR(totalPrice)}</span>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full text-center font-mono text-[12px] tracking-[0.14em] uppercase py-4 bg-green text-ink hover:bg-paper transition-colors duration-200 no-underline"
              data-cursor="shop"
              data-cursor-label="PAY"
            >
              CHECKOUT — {formatEUR(totalPrice)}
            </Link>

            {/* Continue shopping */}
            <Link
              href="/shop"
              onClick={closeCart}
              className="block text-center font-mono text-[9px] tracking-[0.3em] uppercase text-muted hover:text-green transition-colors duration-200 no-underline py-2"
              data-cursor="h"
            >
              CONTINUE SHOPPING
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
