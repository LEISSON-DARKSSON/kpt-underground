"use client";

import { useState } from "react";

import { usePreviewCart } from "@/components/commerce/preview-cart";
import s from "@/components/commerce/commerce.module.css";
import { MAX_QTY, formatUSD } from "@/lib/commerce/desk-mats";

/** Single primary action: quantity + add to the in-memory preview cart. */
export function DeskMatPurchase({ variantId, name, plannedCents }: { variantId: string; name: string; plannedCents: number }) {
  const [qty, setQty] = useState(1);
  const { add } = usePreviewCart();
  return (
    <div className={`${s.stack5}`}>
      <div className={`flex items-end justify-between border-y border-dim ${s.barY5}`}>
        <div>
          <p className="font-display text-5xl leading-none text-paper">{formatUSD(plannedCents)}</p>
          <p className={`font-mono text-[11px] text-slate ${s.mt1}`}>USD · planned price, not yet applied</p>
        </div>
        <div className="flex items-center border border-dim" role="group" aria-label={`Quantity for ${name}`}>
          <button type="button" data-cursor="h" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center font-mono text-paper hover:text-green disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-green">
            −
          </button>
          <output className="w-10 text-center font-mono" aria-live="polite" data-pdp-qty>
            {qty}
          </output>
          <button type="button" data-cursor="h" aria-label="Increase quantity" disabled={qty >= MAX_QTY} onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} className="flex h-11 w-11 items-center justify-center font-mono text-paper hover:text-green disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-green">
            +
          </button>
        </div>
      </div>
      <button
        type="button"
        data-cursor="shop"
        data-cursor-label="ADD"
        data-add={variantId}
        onClick={(e) => add(variantId, qty, e.currentTarget)}
        className="flex min-h-14 w-full items-center justify-center gap-3 bg-green font-display text-2xl tracking-[0.06em] text-ink hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green motion-safe:transition-colors motion-safe:duration-200"
      >
        ADD TO PREVIEW CART <span aria-hidden="true">→</span>
      </button>
      <p className="font-mono text-[11px] leading-relaxed text-slate">
        Interaction preview only. Purchasing opens after samples, pricing and Fourthwall checkout are confirmed.
      </p>
    </div>
  );
}
