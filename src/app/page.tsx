import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { Ticker } from "@/components/brand/ticker";
import { HeroStats } from "@/components/home/hero-stats";
import { HeroCTAs } from "@/components/home/hero-ctas";
import { ManifestoStrip } from "@/components/home/manifesto-strip";
import { ProductLines } from "@/components/home/product-lines";
import { ArtistFundPreview } from "@/components/home/artist-fund-preview";
import Link from "next/link";

const TICKER_ITEMS = [
  "SOUNDSYSTEM WORKWEAR",
  "KEEP IT UNDERGROUND",
  "10% ARTIST FUND",
  "EQUIPMENT NOT FASHION",
  "BASS CULTURE SINCE 2024",
  "SIGNAL NETWORK ACTIVE",
  "140HZ FREQUENCY",
  "UNDERGROUND INFRASTRUCTURE",
];

export default function HomePage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
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
          {/* System badge */}
          <ScrollReveal>
            <span className="eyebrow">
              <span style={{ marginRight: 4 }}>&#x25B6;</span>
              KPT-UG // SYSTEM ACTIVE // V3
            </span>
          </ScrollReveal>

          {/* Hero text */}
          <CharReveal
            text="KEEP IT"
            as="h1"
            staggerMs={40}
            className="stmt"
          />
          <CharReveal
            text="UNDERGROUND"
            as="h1"
            staggerMs={40}
            className="stmt"
            accentClass="text-green"
          />

          {/* Subtitle */}
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
              Soundsystem workwear for the people who build the systems.{" "}
              <strong style={{ color: "var(--paper)" }}>
                Equipment engineered for the underground.
              </strong>
            </p>
          </ScrollReveal>

          {/* CTAs */}
          <HeroCTAs />

          {/* Stats bar */}
          <HeroStats />

          {/* Bottom meta */}
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

      {/* ═══ TICKER ═══ */}
      <Ticker items={TICKER_ITEMS} />

      {/* ═══ MANIFESTO STRIP ═══ */}
      <ManifestoStrip />

      {/* ═══ PRODUCT LINES ═══ */}
      <section
        style={{
          padding: "120px 0",
          borderBottom: "1px solid rgba(138, 206, 0, 0.06)",
        }}
      >
        <div className="wrap">
          <ScrollReveal>
            <span className="eyebrow">02 // THE EQUIPMENT</span>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2
              className="stmt"
              style={{ fontSize: "clamp(36px, 6vw, 72px)", marginBottom: 64 }}
            >
              FOUR LINES.
              <br />
              <span style={{ color: "var(--green)" }}>ONE STANDARD.</span>
            </h2>
          </ScrollReveal>
          <ProductLines />
        </div>
      </section>

      {/* ═══ ARTIST FUND ═══ */}
      <section
        style={{
          padding: "120px 0",
          borderBottom: "1px solid rgba(138, 206, 0, 0.06)",
        }}
      >
        <div className="wrap">
          <ScrollReveal>
            <span className="eyebrow">03 // THE ARTISTS</span>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2
              className="stmt"
              style={{ fontSize: "clamp(36px, 6vw, 72px)", marginBottom: 24 }}
            >
              10% OF EVERY
              <br />
              <span style={{ color: "var(--orange)" }}>TRANSACTION.</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <p
              style={{
                maxWidth: 560,
                fontSize: "clamp(14px, 1.6vw, 17px)",
                lineHeight: 1.85,
                color: "var(--muted)",
                marginBottom: 48,
              }}
            >
              Every purchase directly funds the underground artists who build
              the soundsystems, run the raves, and keep the culture alive.
            </p>
          </ScrollReveal>
          <ArtistFundPreview />
          <ScrollReveal delay={3}>
            <Link
              href="/editorial"
              data-cursor="hover"
              data-cursor-label="VIEW"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 12,
                fontSize: 9,
                letterSpacing: "0.45em",
                textTransform: "uppercase",
                color: "var(--green)",
                textDecoration: "none",
                borderBottom: "1px solid rgba(138, 206, 0, 0.22)",
                paddingBottom: 4,
                marginTop: 48,
                transition: "color var(--mid), border-color var(--mid)",
              }}
            >
              VIEW ALL RECIPIENTS <span>&#x2192;</span>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ SIGNAL CTA ═══ */}
      <section
        className="flex items-center justify-center text-center"
        style={{
          padding: "160px 0",
          background: "var(--ink2)",
        }}
      >
        <div className="wrap">
          <ScrollReveal>
            <span className="eyebrow">04 // THE SIGNAL</span>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <h2
              className="stmt"
              style={{
                fontSize: "clamp(36px, 6vw, 72px)",
                marginBottom: 24,
              }}
            >
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
              <br />
              Access granted through purchase or frequency.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={3}>
            <span
              style={{
                display: "inline-block",
                fontSize: 8,
                letterSpacing: "0.5em",
                color: "var(--orange)",
                textTransform: "uppercase",
                border: "1px solid rgba(255, 140, 0, 0.22)",
                padding: "10px 24px",
              }}
            >
              &#x25CF; CLASSIFIED
            </span>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ BOTTOM TICKER ═══ */}
      <Ticker items={TICKER_ITEMS} duration={35} reverse />
    </>
  );
}
