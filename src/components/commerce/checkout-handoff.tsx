"use client";

import Link from "next/link";

import { usePreviewCart } from "@/components/commerce/preview-cart";
import { formatUSD, getDeskMatByVariant } from "@/lib/commerce/desk-mats";

const STEPS = [
  ["01", "Server confirms each variant is public and reads the active price from Fourthwall."],
  ["02", "One cart is created with Fourthwall variant IDs — never client-supplied prices."],
  ["03", "Customer is redirected to Fourthwall's hosted checkout for address, shipping, tax and payment."],
  ["04", "Only a platform-confirmed order counts as a sale."],
] as const;

/** Honest checkout-handoff mock: no inputs, disabled payment, nothing leaves the browser. */
export function CheckoutHandoff() {
  const { lines, plannedSubtotalCents, count } = usePreviewCart();
  return (
    <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr]">
      <section aria-labelledby="handoff-flow" className="border border-dim bg-ink-2 p-6 sm:p-8">
        <h2 id="handoff-flow" className="eyebrow">Future real flow</h2>
        <ol className="mt-6 space-y-5">
          {STEPS.map(([n, text]) => (
            <li key={n} className="grid grid-cols-[40px_1fr] gap-3">
              <span className="font-display text-2xl leading-none text-green">{n}</span>
              <span className="font-mono text-xs leading-relaxed text-paper">{text}</span>
            </li>
          ))}
        </ol>
      </section>
      <section aria-labelledby="handoff-summary" className="border border-dim p-6 sm:p-8">
        <h2 id="handoff-summary" className="font-display text-3xl leading-none">Preview summary</h2>
        {lines.length === 0 ? (
          <p className="mt-6 font-mono text-xs text-slate">
            Preview cart is empty.{" "}
            <Link href="/commerce-preview/shop" data-cursor="h" className="text-green">
              Browse desk mats
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-6 divide-y divide-dim font-mono text-xs">
            {lines.map((l) => {
              const mat = getDeskMatByVariant(l.variantId);
              return mat ? (
                <li key={l.variantId} className="flex justify-between py-3">
                  <span>
                    {mat.name} × {l.qty}
                  </span>
                  <span>{formatUSD(mat.plannedPrice.amountCents * l.qty)}</span>
                </li>
              ) : null;
            })}
          </ul>
        )}
        <div className="mt-4 flex items-end justify-between border-t border-dim pt-4">
          <span className="font-mono text-sm">Planned subtotal · {count}</span>
          <span className="font-display text-4xl leading-none" data-handoff-subtotal={plannedSubtotalCents}>
            {formatUSD(plannedSubtotalCents)}
          </span>
        </div>
        <p className="mt-3 font-mono text-[11px] text-slate">Shipping, taxes and fees are calculated only at the real Fourthwall checkout.</p>
        <button type="button" disabled aria-describedby="handoff-note" className="kiu-checkout-disabled mt-6 flex min-h-14 w-full items-center justify-center border border-dim font-display text-2xl tracking-[0.06em] text-muted">
          CHECKOUT NOT ACTIVE
        </button>
        <p id="handoff-note" className="mt-3 font-mono text-[11px] leading-relaxed text-orange">
          Design preview. No checkout session, order or payment is created. The link activates only after the real Fourthwall purchase flow is approved.
        </p>
      </section>
    </div>
  );
}
