import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { Ticker } from "@/components/brand/ticker";
import { SignalPageClient } from "@/components/signal/signal-page-client";

export const metadata = {
  title: "Signal",
  description: "Studio notes from KEEP IT UNDERGROUND: design process and new objects. Open to everyone.",
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
                OPEN
              </span>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={1}>
            <CharReveal
              as="h1"
              text="THE SIGNAL"
              className="font-display text-[clamp(3rem,10vw,7rem)] leading-[0.95] text-green"
            />
          </ScrollReveal>

          <ScrollReveal delay={2}>
            <p className="max-w-[520px] mt-8 text-paper/60 leading-relaxed">
              Notes from the studio on design and new objects. Open to everyone.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ TICKER ═══ */}
      <Ticker
        items={["SIGNAL ACTIVE", "NO ALGORITHM", "STUDIO JOURNAL", "OPEN TO EVERYONE"]}
        duration={28}
        reverse
      />

      {/* ═══ OPEN JOURNAL ═══ */}
      <SignalPageClient />
    </>
  );
}
