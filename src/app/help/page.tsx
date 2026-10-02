import Link from "next/link";

import { POLICY_LINKS } from "@/lib/store/policies";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shipping, returns & help",
  description: "How KEEP IT UNDERGROUND orders work: made to order, hosted checkout by Fourthwall, shipping at checkout, quality guarantee and contact.",
  alternates: { canonical: "https://keepitunderground.com/help" },
};

/*
 * KPT-05 · Content source: the shop's live Fourthwall policy pages and the product
 * "Quality Guarantee & Returns" section from the Storefront API, read 2026-10-02.
 * This page summarises and links; the Fourthwall pages remain the binding text.
 * Do not add delivery-time promises, free shipping or a universal return right without a source.
 */

const linkCls = "text-green underline underline-offset-4 hover:text-paper";

export default function HelpPage() {
  return (
    <section className="wrap pb-32" style={{ paddingTop: "calc(120px + var(--sat))" }} data-help>
      <p className="eyebrow">KPT / Help</p>
      <h1 className="mt-6 font-display text-[clamp(48px,8vw,112px)] leading-[0.88] text-paper">
        SHIPPING &amp; <span className="text-green">RETURNS.</span>
      </h1>

      <div className="mt-14 grid gap-12 font-mono text-sm leading-relaxed text-slate lg:grid-cols-2">
        <article>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper">How an order works</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>Every item is made to order after you buy it.</li>
            <li>Checkout and payment happen on Fourthwall&apos;s secure hosted checkout. This site never sees your card details.</li>
            <li>Prices are in USD. Shipping costs and taxes are calculated at checkout, before you pay.</li>
            <li>Production and delivery are handled by Fourthwall. The delivery options for your address are shown at checkout.</li>
          </ul>
        </article>

        <article>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper">Returns &amp; quality guarantee</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>Quality is guaranteed: if there is a print error or a visible quality issue, the item is replaced or refunded.</li>
            <li>Because products are made to order, general returns and sizing-related returns are not accepted. Check the size information on the product page before ordering.</li>
            <li>For a quality issue, contact us with your order number and a photo of the problem. The returns page lists the time limit.</li>
          </ul>
          <p className="mt-4">
            Full terms: <a href={POLICY_LINKS[0].href} className={linkCls} data-cursor="h" target="_blank" rel="noopener">Returns &amp; FAQ</a>.
          </p>
        </article>

        <article>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper">Contact</h2>
          <p className="mt-4">
            Questions about sizing, an order or a quality issue: use the{" "}
            <a href={POLICY_LINKS[3].href} className={linkCls} data-cursor="h" target="_blank" rel="noopener">contact form</a>.
          </p>
        </article>

        <article>
          <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper">Policies</h2>
          <ul className="mt-4 space-y-2" data-policy-links>
            {POLICY_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className={linkCls} data-cursor="h" target="_blank" rel="noopener">{l.label} ↗</a>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <Link href="/shop" data-cursor="shop" data-cursor-label="SHOP" className="mt-16 inline-flex min-h-12 items-center border border-green/40 px-6 font-mono text-[11px] uppercase tracking-[0.2em] text-green no-underline hover:bg-green hover:text-ink">
        Back to the shop
      </Link>
    </section>
  );
}
