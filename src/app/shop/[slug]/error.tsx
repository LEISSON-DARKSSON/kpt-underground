"use client";

import Link from "next/link";

/** Temporary upstream failure on a product page: the product may well exist, so this is not a 404. */
export default function ProductError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="wrap pb-32" style={{ paddingTop: "calc(140px + var(--sat))" }} data-store-unavailable>
      <p className="eyebrow">KPT / Temporary fault</p>
      <h1 className="mt-6 font-display text-[clamp(44px,7vw,96px)] leading-[0.9] text-paper">
        SIGNAL <span className="text-orange">LOST.</span>
      </h1>
      <p className="mt-6 max-w-md font-mono text-sm leading-relaxed text-slate">
        We couldn&apos;t load this product from the shop right now. It hasn&apos;t been removed — please try again in a moment.
      </p>
      <div className="mt-10 flex flex-wrap gap-4">
        <button type="button" onClick={reset} data-cursor="h" className="min-h-12 bg-green px-6 font-display text-xl tracking-[0.06em] text-ink hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green">
          TRY AGAIN
        </button>
        <Link href="/shop" data-cursor="shop" data-cursor-label="SHOP" className="flex min-h-12 items-center border border-green/40 px-6 font-mono text-[11px] uppercase tracking-[0.2em] text-green no-underline hover:bg-green hover:text-ink">
          Back to the shop
        </Link>
      </div>
    </section>
  );
}
