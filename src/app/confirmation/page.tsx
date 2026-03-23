import type { Metadata } from "next";
import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { CharReveal } from "@/components/brand/char-reveal";
import { Ticker } from "@/components/brand/ticker";
import { SignalTerminal } from "@/components/confirmation/signal-terminal";
import { OrderSummary } from "@/components/confirmation/order-summary";
import { NextSteps } from "@/components/confirmation/next-steps";
import { CertStamp } from "@/components/confirmation/cert-stamp";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your KPT Underground order has been confirmed. Signal network access activated.",
};

export default function ConfirmationPage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section
        className="relative overflow-hidden flex items-center justify-center text-center"
        style={{ minHeight: "100vh", paddingTop: "calc(56px + 60px)", paddingBottom: 80, borderBottom: "1px solid rgba(138,206,0,0.06)" }}
      >
        {/* Signal pulse rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {[200, 340, 500, 680].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full border"
              style={{
                width: size,
                height: size,
                borderColor: `rgba(138,206,0,${0.08 - i * 0.015})`,
                animation: `pulse-ring ${4 + i}s ease-out infinite`,
                animationDelay: `${i * 0.6}s`,
              }}
            />
          ))}
        </div>

        <div className="wrap relative z-10">
          {/* Certification stamp */}
          <ScrollReveal>
            <div className="flex justify-center mb-10">
              <CertStamp />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={1}>
            <CharReveal
              as="h1"
              text="ORDER CONFIRMED"
              className="font-display text-[clamp(52px,9vw,120px)] leading-[0.86] text-green"
            />
          </ScrollReveal>

          <ScrollReveal delay={2}>
            <p
              className="mx-auto mt-6 text-muted leading-[1.85]"
              style={{ maxWidth: 600, fontSize: "clamp(14px, 1.8vw, 17px)" }}
            >
              Your equipment is being prepared. <strong className="text-paper">Signal network access has been activated</strong> — you are now part of the underground infrastructure.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={3}>
            <div className="flex justify-center gap-6 mt-10">
              <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted border border-dim px-4 py-2">
                ORDER: KPT-2025-0847
              </span>
              <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-green border border-green/20 px-4 py-2">
                ● STATUS: PROCESSING
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ SIGNAL ACTIVATION TERMINAL ═══ */}
      <section className="relative py-20" style={{ background: "var(--ink2)" }}>
        {/* Noise overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.022'/%3E%3C/svg%3E")`,
            backgroundSize: "128px",
          }}
        />
        <div className="wrap relative z-10">
          <ScrollReveal>
            <span className="eyebrow">SIGNAL ACTIVATION SEQUENCE</span>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <SignalTerminal />
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <Ticker
        items={["ORDER CONFIRMED", "SIGNAL ACTIVATED", "NETWORK ACCESS: GRANTED", "10% ARTIST FUND: ALLOCATED"]}
        duration={30}
      />

      {/* ═══ ORDER SUMMARY ═══ */}
      <section className="py-20">
        <div className="wrap">
          <ScrollReveal>
            <span className="eyebrow">ORDER DETAILS</span>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <OrderSummary />
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ NEXT STEPS ═══ */}
      <section className="py-20" style={{ borderTop: "1px solid rgba(138,206,0,0.06)" }}>
        <div className="wrap">
          <ScrollReveal>
            <span className="eyebrow">WHAT HAPPENS NEXT</span>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <NextSteps />
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ SIGNAL CONFIRMED CTA ═══ */}
      <section className="relative py-32 overflow-hidden" style={{ background: "var(--ink2)" }}>
        {/* Background drift text */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          style={{ animation: "bgdrift 55s ease-in-out infinite" }}
        >
          <span className="font-display text-[clamp(100px,25vw,320px)] text-paper/[0.02] whitespace-nowrap">
            UNDERGROUND
          </span>
        </div>

        <div className="wrap relative z-10 text-center">
          <ScrollReveal>
            <h2 className="font-display text-[clamp(36px,6vw,72px)] leading-[0.88] text-paper">
              YOU ARE NOW<br /><span className="text-green">SIGNAL</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={1}>
            <p className="font-mono text-[13px] text-muted leading-[1.85] max-w-[480px] mx-auto mt-6">
              Your frequency has been registered. The network recognizes you. Welcome to the infrastructure.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={2}>
            <div className="flex justify-center gap-4 mt-10">
              <Link
                href="/signal"
                className="font-display text-[20px] tracking-[0.12em] px-8 py-4 bg-green text-ink no-underline hover:bg-paper transition-colors duration-200"
                data-cursor="h"
              >
                ENTER SIGNAL NETWORK
              </Link>
              <Link
                href="/shop"
                className="font-mono text-[9px] tracking-[0.4em] uppercase text-green border border-green/30 px-6 py-4 no-underline hover:bg-green/5 transition-colors duration-200 flex items-center"
                data-cursor="h"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
