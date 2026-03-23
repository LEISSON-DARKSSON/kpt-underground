import type { Metadata } from "next";
import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { Ticker } from "@/components/brand/ticker";
import { ArtistGrid } from "@/components/artists/artist-grid";
import { FundOverview } from "@/components/artists/fund-overview";
import { FeaturedStory } from "@/components/artists/featured-story";
import { ARTISTS, getTotalFundDistributed, formatFundAmount } from "@/lib/artists";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Artist Fund",
  description: "10% of every transaction goes directly to underground artists. No application. No committee. The scene identifies who the money belongs to.",
};

export default function ArtistsPage() {
  const totalDistributed = getTotalFundDistributed();

  return (
    <>
      {/* ═══ HERO ═══ */}
      <section
        className="relative overflow-hidden flex items-center"
        style={{ minHeight: "100vh", paddingTop: "calc(80px + var(--sat))" }}
      >
        {/* Background "10%" */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          <span className="font-display text-[clamp(10rem,30vw,25rem)] text-green/5">10%</span>
        </div>

        <div className="wrap relative" style={{ zIndex: 1 }}>
          <ScrollReveal>
            <span className="eyebrow">THE ARTIST FUND // 10% OF EVERY TRANSACTION</span>
          </ScrollReveal>

          <ScrollReveal delay={1}>
            <CharReveal
              as="h1"
              text="THE MUSIC YOU WILL NEVER FIND ON ANY CHART."
              className="font-display text-[clamp(2.5rem,8vw,6rem)] leading-[0.95] text-green mt-8"
            />
          </ScrollReveal>

          <ScrollReveal delay={2}>
            <p className="max-w-[600px] mt-8 text-paper/80 leading-relaxed">
              There are artists making electronic music right now who will never appear on a booking roster —
              not because they lack ability, but because they made a deliberate choice to stay in the frequencies
              that do not negotiate with commercial radio.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={3}>
            <div className="flex items-baseline gap-4 mt-12">
              <span className="font-display text-[clamp(3rem,8vw,5rem)] leading-none text-green">
                {formatFundAmount(totalDistributed)}
              </span>
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
                DISTRIBUTED TO DATE
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <Ticker
        items={["10% ARTIST FUND", "NO APPLICATION", "NO COMMITTEE", "THE SCENE DECIDES", "DIRECT TRANSFER", "CULTURE IS THE PURPOSE"]}
        duration={30}
      />

      {/* ═══ FUND OVERVIEW ═══ */}
      <FundOverview />

      {/* ═══ ARTIST GRID ═══ */}
      <ArtistGrid artists={ARTISTS} />

      {/* ═══ FEATURED STORY ═══ */}
      <FeaturedStory />

      {/* ═══ CTA ═══ */}
      <section className="py-32 border-t border-dim">
        <div className="wrap text-center">
          <ScrollReveal>
            <p className="font-display text-[clamp(1.5rem,4vw,3rem)] text-paper leading-tight">
              THE CLOTHING IS THE PRODUCT.<br />
              THE CULTURE IS THE PURPOSE.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <Link
              href="/shop"
              className="inline-block mt-10 font-mono text-[11px] tracking-[0.14em] uppercase bg-green text-ink px-8 py-4 hover:bg-green/90 transition-colors duration-200"
              data-cursor="shop"
              data-cursor-label="SHOP"
            >
              VIEW EQUIPMENT &rarr;
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
