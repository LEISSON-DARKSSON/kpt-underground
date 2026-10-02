import Link from "next/link";

import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { Ticker } from "@/components/brand/ticker";
import { HeroCTAs } from "@/components/home/hero-ctas";
import { HeroStats } from "@/components/home/hero-stats";
import { ManifestoStrip } from "@/components/home/manifesto-strip";
import { ProductGrid } from "@/components/store/product-grid";

export const revalidate = 60;

const TICKER_ITEMS = [
  "KEEP IT UNDERGROUND",
  "ORIGINAL GRAPHIC OBJECTS",
  "MAKE ROOM FOR YOUR NEXT IDEA",
  "SIGNAL / 01",
  "SUBSURFACE / 02",
  "MADE ON DEMAND",
  "SPACE TO MAKE SOMETHING",
  "OBJECT STUDIES",
];

export default function HomePage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section
        id="hero"
        className="relative overflow-hidden flex items-center"
        style={{
          minHeight: "100vh",
          padding: "120px 0 80px",
          borderBottom: "1px solid rgba(138, 206, 0, 0.06)",
        }}
      >
        {/* Noise texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 512 512\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\'/%3E%3C/svg%3E")',
            backgroundSize: 256,
            opacity: 0.03,
          }}
        />

        <div className="wrap relative">
          <ScrollReveal>
            <span className="eyebrow">
              <span style={{ marginRight: 4 }}>&#x25B6;</span>
              KPT-UG // OBJECT STUDIES // SHOP OPEN
            </span>
          </ScrollReveal>

          {/* Brand wordmark: visual only. The page's single H1 below states the offer (UX audit 2026-10-02). */}
          <div aria-hidden="true">
            <CharReveal text="KEEP IT" as="div" staggerMs={40} className="stmt" />
            <CharReveal text="UNDERGROUND" as="div" staggerMs={40} className="stmt" accentClass="text-green" />
          </div>

          {/* Rendered without a reveal: it is the hero's main message and an LCP candidate. */}
          <h1 className="mt-8 max-w-[760px] font-display text-[clamp(30px,4.2vw,52px)] leading-[1.02] text-paper" data-hero-h1>
            Desk mats, notebooks, prints and wear for the people who build, work and create.
          </h1>
          <p className="mt-5 max-w-[560px] font-mono text-sm leading-relaxed text-slate">
            Original graphic objects, made to order. <strong className="text-paper">Make room for your next idea.</strong>
          </p>

          <HeroCTAs />
          <HeroStats />

        </div>
        {/* Decorative labels anchored to the hero edge, below the content (never over the CTA proof). */}
        <span
          className="absolute hidden md:block"
          style={{
            bottom: 36,
            left: 40,
            fontSize: 8,
            letterSpacing: "0.4em",
            color: "rgba(112, 128, 144, 0.3)",
            textTransform: "uppercase",
            animation: "nudge 2.6s ease-in-out infinite",
          }}
        >
          SCROLL TO EXPLORE &#x2193;
        </span>
        <span
          className="absolute hidden md:block"
          style={{
            bottom: 36,
            right: 40,
            textAlign: "right",
            fontSize: 8,
            letterSpacing: "0.2em",
            color: "rgba(112, 128, 144, 0.25)",
            lineHeight: 2,
          }}
        >
          SYS: OPERATIONAL
          <br />
          FREQ: 140HZ
          <br />
          SIGNAL: ACTIVE
        </span>
      </section>

      <Ticker items={TICKER_ITEMS} />
      <ManifestoStrip />

      {/* ─── THE SHOP ─── */}
      <section style={{ padding: "120px 0", borderBottom: "1px solid rgba(138, 206, 0, 0.06)" }}>
        <div className="wrap">
          <ScrollReveal>
            <span className="eyebrow">01 // THE SHOP</span>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="stmt" style={{ fontSize: "clamp(36px, 6vw, 72px)", marginBottom: 56 }}>
              DESK OBJECTS.
              <br />
              <span style={{ color: "var(--green)" }}>WALL STUDIES.</span>
            </h2>
          </ScrollReveal>
          <ProductGrid picks />
          <ScrollReveal delay={2}>
            <Link
              href="/shop"
              data-cursor="shop"
              data-cursor-label="SHOP"
              className="mt-12 inline-flex items-center gap-3 border-b border-green/25 pb-1 font-mono text-[11px] uppercase tracking-[0.3em] text-green no-underline hover:border-green"
            >
              VIEW THE FULL SHOP <span>&#x2192;</span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── SIGNAL CTA ─── */}
      <section className="flex items-center justify-center text-center" style={{ padding: "160px 0", background: "var(--ink2)" }}>
        <div className="wrap">
          <ScrollReveal>
            <span className="eyebrow">02 // THE SIGNAL</span>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2 className="stmt" style={{ fontSize: "clamp(36px, 6vw, 72px)", marginBottom: 24 }}>
              THE SIGNAL
              <br />
              <span style={{ color: "var(--green)" }}>NETWORK</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p
              style={{
                maxWidth: 480,
                margin: "0 auto",
                fontSize: "clamp(13px, 1.5vw, 16px)",
                lineHeight: 1.85,
                color: "var(--muted)",
                marginBottom: 40,
              }}
            >
              A closed channel for those who keep it underground.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={3}>
            <Link
              href="/signal"
              data-cursor="h"
              data-cursor-label="ENTER"
              style={{
                display: "inline-block",
                fontSize: 8,
                letterSpacing: "0.5em",
                color: "var(--orange)",
                textTransform: "uppercase",
                border: "1px solid rgba(255, 140, 0, 0.22)",
                padding: "10px 24px",
                textDecoration: "none",
              }}
            >
              &#x25CF; ENTER SIGNAL NETWORK
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <Ticker items={TICKER_ITEMS} duration={35} reverse />
    </>
  );
}
