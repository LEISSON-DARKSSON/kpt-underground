import type { Metadata } from "next";
import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { StorySignalNetwork } from "@/components/story/story-signal-network";
import { StoryManifesto } from "@/components/story/story-manifesto";

export const metadata: Metadata = {
  title: "The Story",
  description: "KEEP IT UNDERGROUND — original graphic objects from the underground, for the spaces where you build, work and create.",
};

export default function StoryPage() {
  return (
    <>
      {/* ─── HERO ─── */}
      <section
        className="relative overflow-hidden flex items-center"
        style={{ minHeight: "100vh", paddingTop: "calc(80px + var(--sat))" }}
      >
        <div className="wrap">
          <ScrollReveal>
            <span className="eyebrow">DOC TYPE: BRAND STORY // REF: KPT-UG-BS-001 // CLASS: CLANDESTINE</span>
          </ScrollReveal>

          <ScrollReveal delay={1}>
            <CharReveal
              as="h1"
              text="YOU FELT IT BEFORE YOU UNDERSTOOD IT."
              className="font-display text-[clamp(3rem,10vw,7rem)] leading-[0.95] text-green mt-8"
            />
          </ScrollReveal>

          <ScrollReveal delay={2}>
            <p className="max-w-[680px] mt-8 text-paper/80 leading-relaxed">
              The pressure in your chest before the first kick hits.
              The moment a room stops being a room and becomes something closer to a decision.
              The specific quality of darkness at 3 AM when the only light is above the decks
              and everyone present chose to be there — really chose, not scrolled into —
              chose, physically, to stand in that space and receive what was coming.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={3}>
            <p className="max-w-[680px] mt-6 text-paper/80 leading-relaxed">
              KEEP IT UNDERGROUND carries that feeling into the places where the work happens:
              the desk, the studio, the wall above the setup. Original graphic objects, made on demand.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={4}>
            <div className="flex flex-wrap gap-8 mt-8 text-muted font-mono text-[10px] tracking-[0.14em] uppercase">
              <span>KEEP IT UNDERGROUND</span>
              <span>FREQ: SUB-BASS</span>
              <span>KPT-UG-001</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── PULL QUOTE ─── */}
      <section className="py-32 overflow-hidden border-t border-dim">
        <div className="wrap">
          <ScrollReveal>
            <blockquote className="font-display text-[clamp(2rem,6vw,5rem)] leading-[1.05] text-center text-paper">
              &ldquo;We are the people<br />
              who build the systems<br />
              that other people dance inside.&rdquo;
            </blockquote>
          </ScrollReveal>
        </div>
      </section>

      <StorySignalNetwork />
      <StoryManifesto />

      <section className="py-16 border-t border-dim">
        <div className="wrap text-center">
          <ScrollReveal>
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
              SIGNAL: ACTIVE // CERT: KPT-UG-001 // FREQ: 20–200HZ // CLASS: UNDERGROUND
            </p>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
