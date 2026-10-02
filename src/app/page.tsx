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

          <CharReveal text="KEEP IT" as="h1" staggerMs={40} className="stmt" />
          <CharReveal text="UNDERGROUND" as="h1" staggerMs={40} className="stmt" accentClass="text-green" />

          <ScrollReveal delay={2}>
            <p
              style={{
                maxWidth: 560,
                fontSize: "clamp(14px, 1.8vw, 18px)",
                lineHeight: 1.85,
                color: "var(--muted)",
                marginTop: 36,
              }}
            >
              Original graphic objects for the spaces where you build, work and create.{" "}
              <strong style={{ color: "var(--paper)" }}>Make room for your next idea.</strong>
            </p>
          </ScrollReveal>

          <HeroCTAs />
          <HeroStats />

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
        </div>
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
          <ProductGrid limit={6} />
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
