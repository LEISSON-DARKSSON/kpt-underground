import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";

export function StoryEquipment() {
  return (
    <section className="py-32 border-t border-dim">
      <div className="wrap">
        <ScrollReveal>
          <CharReveal
            as="h2"
            text="THIS IS NOT FASHION. THIS IS EQUIPMENT."
            className="font-display text-[clamp(2.5rem,8vw,6rem)] leading-[0.95] text-paper"
          />
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-12 mt-16">
          <ScrollReveal delay={1}>
            <div className="border border-dim p-8">
              <span className="eyebrow">THE BRIEF</span>
              <p className="text-paper/80 leading-relaxed mt-4">
                Fashion answers to a trend cycle. We answer to the environment — dark floors, open fields,
                5 AM service corridors. Every specification exists because someone needed it to exist.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={2}>
            <div className="border border-dim p-8">
              <span className="eyebrow">THE ORIGIN</span>
              <p className="text-paper/80 leading-relaxed mt-4">
                We started by showing up. Loading in at midnight. Running cable. Finding the frequency
                before anyone else was awake enough to hear it. The gear came first. Always.
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Spec strip */}
        <ScrollReveal delay={3}>
          <div className="flex flex-wrap gap-3 mt-12">
            {["440GSM French Terry", "AQL 2.5 Standard", "±1CM Tolerance", "Load-Rated Hardware", "Faraday Option"].map(
              (spec) => (
                <span
                  key={spec}
                  className="font-mono text-[10px] tracking-[0.14em] uppercase text-green border border-green/20 px-4 py-2"
                >
                  {spec}
                </span>
              )
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
