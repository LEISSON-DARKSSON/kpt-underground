import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";

const SIGNALS = [
  {
    title: "WHAT IT IS",
    body: "A closed, non-algorithmic channel. Not a newsletter. Not a loyalty programme. A direct line to events that have no public existence.",
  },
  {
    title: "WHAT MOVES THROUGH IT",
    body: "Location codes. Frequency callouts. Access instructions for parties not on any map. The only way in is already knowing.",
  },
  {
    title: "HOW YOU ENTER",
    body: "You buy the clothing. You receive access. What follows cannot be described further here.",
  },
  {
    title: "WHY IT WORKS",
    body: "Because the information is real. The relationships are real. We were there before the brand existed.",
  },
];

export function StorySignalNetwork() {
  return (
    <section className="py-32 border-t border-dim">
      <div className="wrap">
        <div className="flex flex-wrap gap-3 mb-8">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-orange border border-orange/30 px-3 py-1">
            CLASSIFIED
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-green border border-green/30 px-3 py-1">
            MEMBERS ONLY
          </span>
        </div>

        <ScrollReveal>
          <CharReveal
            as="h2"
            text="THE SIGNAL NETWORK"
            className="font-display text-[clamp(3rem,10vw,7rem)] leading-[0.95] text-paper"
          />
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 mt-16">
          {SIGNALS.map((signal, i) => (
            <ScrollReveal key={signal.title} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <div className="border border-dim p-8 h-full">
                <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-green">
                  {String(i + 1).padStart(2, "0")} // {signal.title}
                </span>
                <p className="text-paper/80 leading-relaxed mt-4">
                  {signal.body}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
