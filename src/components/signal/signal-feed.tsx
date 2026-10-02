import Link from "next/link";

import { ScrollReveal } from "@/components/brand/scroll-reveal";

/** No journal entry has been supplied by the owner yet, so the page says so. Never add placeholder entries here. */
export function SignalFeed() {
  return (
    <section className="py-24">
      <div className="wrap">
        <ScrollReveal>
          <p className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] text-paper">NO ENTRIES YET.</p>
        </ScrollReveal>
        <ScrollReveal delay={1}>
          <Link
            href="/shop"
            data-cursor="shop"
            data-cursor-label="SHOP"
            className="mt-8 inline-flex items-center gap-3 border-b border-green/25 pb-1 font-mono text-[11px] uppercase tracking-[0.3em] text-green no-underline hover:border-green"
          >
            BROWSE THE SHOP <span>&#x2192;</span>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
