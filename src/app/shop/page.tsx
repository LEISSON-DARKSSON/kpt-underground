import type { Metadata } from "next";
import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { Ticker } from "@/components/brand/ticker";
import { ShopGrid } from "@/components/shop/shop-grid";
import { SecretDrop } from "@/components/shop/secret-drop";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Equipment",
  description: "The Collection — SS 2025. Equipment engineered for the underground. Ravewear, Festivalwear, Everyday, Accessories. Limited quantities.",
};

export default function ShopPage() {
  return (
    <>
      {/* ═══ HEADER ═══ */}
      <section
        className="relative overflow-hidden flex items-end"
        style={{ paddingTop: "calc(56px + 60px)", paddingBottom: 0 }}
      >
        <div className="wrap">
          <ScrollReveal>
            <span className="eyebrow">COLLECTION // SS-2025 // LIMITED QUANTITIES</span>
          </ScrollReveal>

          <ScrollReveal delay={1}>
            <CharReveal
              as="h1"
              text="THE COLLECTION."
              className="font-display text-[clamp(56px,9vw,120px)] leading-[0.86] text-paper mt-4"
            />
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ PRODUCT GRID (with meta row, filters, sort built in) ═══ */}
      <ShopGrid />

      {/* ═══ SECRET DROP GATE ═══ */}
      <div className="wrap py-16">
        <ScrollReveal>
          <SecretDrop />
        </ScrollReveal>
      </div>

      {/* ═══ TICKER ═══ */}
      <Ticker
        items={["EQUIPMENT NOT FASHION", "440GSM FRENCH TERRY", "AQL 2.5 STANDARD", "10% ARTIST FUND", "SOUNDSYSTEM WORKWEAR"]}
        duration={35}
      />

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
              href="/signal"
              className="inline-block mt-8 font-mono text-[11px] tracking-[0.14em] uppercase text-green border border-green/30 px-6 py-3 hover:bg-green hover:text-ink transition-colors duration-200 no-underline"
              data-cursor="h"
            >
              ENTER SIGNAL NETWORK &rarr;
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
