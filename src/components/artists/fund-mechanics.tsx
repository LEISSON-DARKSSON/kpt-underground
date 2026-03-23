import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";

const MECHANICS = [
  {
    step: "01",
    title: "PURCHASE",
    description: "You buy equipment from the collection. 10% of the transaction value is allocated to the fund automatically.",
  },
  {
    step: "02",
    title: "IDENTIFICATION",
    description: "The scene identifies who the money belongs to. No application forms. No grant committees. No corporate selection process.",
  },
  {
    step: "03",
    title: "DIRECT TRANSFER",
    description: "Funds are transferred directly to the artist. No intermediary. No percentage taken. The full allocation reaches the creator.",
  },
  {
    step: "04",
    title: "TRANSPARENCY",
    description: "Every distribution is documented. The total fund amount and individual allocations are visible on this page at all times.",
  },
];

export function FundMechanics() {
  return (
    <section className="py-32 border-t border-dim">
      <div className="wrap">
        <ScrollReveal>
          <span className="eyebrow">HOW IT WORKS</span>
        </ScrollReveal>

        <ScrollReveal delay={1}>
          <CharReveal
            as="h2"
            text="NO APPLICATION. NO COMMITTEE."
            className="font-display text-[clamp(2rem,6vw,4.5rem)] leading-[0.95] text-paper mt-6"
          />
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 mt-16">
          {MECHANICS.map((item, i) => (
            <ScrollReveal key={item.step} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <div className="border border-dim p-8 h-full">
                <span className="font-display text-3xl text-green">{item.step}</span>
                <h3 className="font-display text-xl text-paper mt-3">{item.title}</h3>
                <p className="text-paper/60 leading-relaxed mt-3">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
