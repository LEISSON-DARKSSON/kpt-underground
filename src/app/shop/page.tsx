import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { Ticker } from "@/components/brand/ticker";
import { ShopGrid } from "@/components/shop/shop-grid";
import Link from "next/link";

export default function ShopPage() {
  return (
    <>
      {/* ═══ HEADER ═══ */}
      <section
        className="relative overflow-hidden flex items-end"
        style={{ minHeight: "50vh", paddingTop: "calc(80px + var(--sat))", paddingBottom: "3rem" }}
      >
        <div className="wrap">
          <ScrollReveal>
            <span className="eyebrow">COLLECTION // SS-2025 // LIMITED QUANTITIES</span>
          </ScrollReveal>

          <ScrollReveal delay={1}>
            <CharReveal
              as="h1"
              text="THE COLLECTION."
              className="font-display text-[clamp(3rem,10vw,7rem)] leading-[0.95] text-green mt-4"
            />
          </ScrollReveal>

          <ScrollReveal delay={2}>
            <p className="max-w-[500px] mt-6 text-paper/60 leading-relaxed">
              Equipment engineered for the underground. Every specification exists because someone needed it to exist.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <Ticker
        items={["EQUIPMENT NOT FASHION", "440GSM FRENCH TERRY", "AQL 2.5 STANDARD", "10% ARTIST FUND", "SOUNDSYSTEM WORKWEAR"]}
        duration={35}
      />

      {/* ═══ PRODUCT GRID ═══ */}
      <ShopGrid />

      {/* ═══ SIGNAL CTA ═══ */}
      <section className="py-24 border-t border-dim">
        <div className="wrap text-center">
          <ScrollReveal>
            <p className="font-display text-[clamp(1.2rem,3vw,2rem)] text-paper leading-tight">
              EVERY PURCHASE ACTIVATES<br />SIGNAL NETWORK ACCESS.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <Link
              href="/story"
              className="inline-block mt-8 font-mono text-[11px] tracking-[0.14em] uppercase text-green border border-green/30 px-6 py-3 hover:bg-green hover:text-ink transition-colors duration-200"
              data-cursor="h"
            >
              LEARN MORE &rarr;
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
