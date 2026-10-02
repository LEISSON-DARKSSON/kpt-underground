"use client";

import { useState } from "react";

import { MAX_QTY, formatPrice } from "@/lib/store/core";
import { useCart } from "@/lib/store/cart";

import type { StoreProduct } from "@/lib/store/core";

/** Variant choice (only when there is more than one), quantity and the single primary action. */
export function AddToCart({ product }: { product: StoreProduct }) {
  const firstAvailable = product.variants.find((v) => v.available) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstAvailable.id);
  const [qty, setQty] = useState(1);
  const { add } = useCart();
  const variant = product.variants.find((v) => v.id === variantId) ?? firstAvailable;

  return (
    <div className="space-y-5">
      {product.variants.length > 1 && (
        <fieldset>
          <legend className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate">Option</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                type="button"
                data-cursor="h"
                aria-pressed={v.id === variantId}
                disabled={!v.available}
                onClick={() => setVariantId(v.id)}
                className={`border px-4 py-2 font-mono text-xs ${v.id === variantId ? "border-green bg-green text-ink" : "border-dim text-paper hover:border-slate"} disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <div className="flex items-end justify-between border-y border-dim py-5">
        <div>
          <p className="font-display text-5xl leading-none text-paper" data-price-cents={variant.priceCents}>{formatPrice(variant.priceCents, variant.currency)}</p>
          <p className="mt-1 font-mono text-[11px] text-slate">{variant.currency} · {product.variants.length === 1 ? variant.label : "selected option"}</p>
        </div>
        <div className="flex items-center border border-dim" role="group" aria-label="Quantity">
          <button type="button" data-cursor="h" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center font-mono hover:text-green disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-green">−</button>
          <output className="w-10 text-center font-mono" aria-live="polite" data-qty>{qty}</output>
          <button type="button" data-cursor="h" aria-label="Increase quantity" disabled={qty >= MAX_QTY} onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} className="flex h-11 w-11 items-center justify-center font-mono hover:text-green disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-green">+</button>
        </div>
      </div>
      <button
        type="button"
        data-cursor="shop"
        data-cursor-label="ADD"
        data-add-to-cart
        disabled={!variant.available}
        onClick={(e) =>
          add(
            {
              variantId: variant.id,
              slug: product.slug,
              name: product.name,
              variantLabel: variant.label,
              unitCents: variant.priceCents,
              image: variant.image ?? product.images[0] ?? null,
            },
            qty,
            e.currentTarget,
          )
        }
        className="flex min-h-14 w-full items-center justify-center gap-3 bg-green font-display text-2xl tracking-[0.06em] text-ink hover:bg-paper disabled:bg-dim disabled:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green motion-safe:transition-colors motion-safe:duration-200"
      >
        {variant.available ? "ADD TO CART" : "SOLD OUT"} <span aria-hidden="true">→</span>
      </button>
      <p className="font-mono text-[11px] leading-relaxed text-slate">Made on demand. Shipping and taxes are calculated at checkout.</p>
    </div>
  );
}
