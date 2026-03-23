import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { Ticker } from "@/components/brand/ticker";
import { SignalPageClient } from "@/components/signal/signal-page-client";

export const metadata = {
  title: "Signal Network",
  description: "A closed, non-algorithmic channel. Not a newsletter. A direct line to events that have no public existence.",
};

export default function SignalPage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
      <section
        className="relative overflow-hidden flex items-center"
        style={{ minHeight: "60vh", paddingTop: "calc(80px + var(--sat))" }}
      >
        <div className="wrap">
          <ScrollReveal>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-orange border border-orange/30 px-2 py-1">
                CLASSIFIED
              </span>
              <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-green border border-green/30 px-2 py-1">
                MEMBERS ONLY
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={1}>
            <CharReveal
              as="h1"
              text="THE SIGNAL NETWORK"
              className="font-display text-[clamp(3rem,10vw,7rem)] leading-[0.95] text-green"
            />
          </ScrollReveal>

          <ScrollReveal delay={2}>
            <p className="max-w-[520px] mt-8 text-paper/60 leading-relaxed">
              A closed, non-algorithmic channel. Not a newsletter. Not a loyalty programme.
              A direct line to events that have no public existence.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <Ticker
        items={["SIGNAL ACTIVE", "FREQUENCY LOCKED", "NO ALGORITHM", "DIRECT ACCESS", "MEMBERS ONLY", "140HZ"]}
        duration={28}
        reverse
      />

      {/* ═══ GATED CONTENT ═══ */}
      <SignalPageClient />
    </>
  );
}
