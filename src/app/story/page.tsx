import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { Ticker } from "@/components/brand/ticker";
import { StoryEquipment } from "@/components/story/story-equipment";
import { StoryProductLines } from "@/components/story/story-product-lines";
import { StorySignalNetwork } from "@/components/story/story-signal-network";
import { StoryManifesto } from "@/components/story/story-manifesto";
import Link from "next/link";

export default function StoryPage() {
  return (
    <>
      {/* ═══ HERO ═══ */}
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
            <div className="flex gap-8 mt-8 text-muted font-mono text-[10px] tracking-[0.14em] uppercase">
              <span>KEEP IT UNDERGROUND</span>
              <span>SWL: UNLIMITED</span>
              <span>FREQ: SUB-BASS</span>
              <span>KPT-UG-001</span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══ EQUIPMENT PHILOSOPHY ═══ */}
      <StoryEquipment />

      {/* ═══ PULL QUOTE ═══ */}
      <section className="py-32 overflow-hidden">
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

      {/* ═══ TICKER ═══ */}
      <Ticker
        items={["440GSM FRENCH TERRY", "AQL 2.5 STANDARD", "±1CM TOLERANCE", "LOAD-RATED HARDWARE", "FARADAY OPTION"]}
        duration={35}
      />

      {/* ═══ THE FOUR LINES ═══ */}
      <StoryProductLines />

      {/* ═══ ARTIST FUND ═══ */}
      <section className="py-32 border-t border-dim">
        <div className="wrap">
          <ScrollReveal>
            <span className="eyebrow">05 // THE FUND</span>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 gap-16 mt-12">
            <ScrollReveal delay={1}>
              <div>
                <span className="font-display text-[clamp(5rem,15vw,10rem)] leading-none text-green">10%</span>
                <p className="font-display text-[clamp(1.2rem,3vw,2rem)] leading-tight text-paper mt-4">
                  OF EVERY TRANSACTION<br />
                  GOES DIRECTLY TO<br />
                  UNDERGROUND ARTISTS
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={2}>
              <div className="space-y-6">
                <p className="text-paper/80 leading-relaxed">
                  There are artists making electronic music right now who will never appear on a booking roster —
                  not because they lack ability, but because they made a deliberate choice to stay in the frequencies
                  that do not negotiate with commercial radio.
                </p>
                <p className="text-paper/80 leading-relaxed">
                  No application. No committee. No grant language. The scene identifies who the money belongs to.
                  We move it there. The clothing is the product. The culture is the purpose.
                </p>
                <Link
                  href="/artists"
                  className="inline-block font-mono text-[11px] tracking-[0.14em] uppercase text-green border border-green/30 px-6 py-3 hover:bg-green hover:text-ink transition-colors duration-200"
                  data-cursor="h"
                >
                  VIEW THE ARTISTS &rarr;
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══ SIGNAL NETWORK ═══ */}
      <StorySignalNetwork />

      {/* ═══ MANIFESTO ═══ */}
      <StoryManifesto />

      {/* ═══ CERTIFICATION FOOTER ═══ */}
      <section className="py-16 border-t border-dim">
        <div className="wrap text-center">
          <ScrollReveal>
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">
              SWL: UNLIMITED // SIGNAL: ACTIVE // CERT: KPT-UG-001 // FREQ: 20–200HZ // CLASS: UNDERGROUND UTILITY
            </p>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
