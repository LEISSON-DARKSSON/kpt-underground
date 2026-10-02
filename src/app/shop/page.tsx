import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { ProductGrid } from "@/components/store/product-grid";

import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Shop",
  description: "Original KEEP IT UNDERGROUND desk mats, notebooks, prints, stickers and totes. Made on demand.",
};

export default function ShopPage() {
  return (
    <section className="wrap pb-32" style={{ paddingTop: "calc(120px + var(--sat))" }}>
      <ScrollReveal>
        <p className="eyebrow">KPT / Object studies</p>
      </ScrollReveal>
      <div className="mt-6 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <ScrollReveal delay={1}>
          <h1 className="font-display text-[clamp(52px,9vw,128px)] leading-[0.86] text-paper">
            THE
            <br />
            <span className="text-green">SHOP.</span>
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={2}>
          <p className="max-w-sm font-mono text-sm leading-relaxed text-slate">
            Original graphic objects for the spaces where you build, work and create. Make room for your next idea.
          </p>
        </ScrollReveal>
      </div>
      <div className="mt-12 flex items-center justify-between border-y border-dim py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-slate">
        <span>Made on demand</span>
        <span>Prices in USD</span>
      </div>
      <div className="mt-10">
        <ProductGrid />
      </div>
    </section>
  );
}
