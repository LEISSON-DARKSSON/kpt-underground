import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { CharReveal } from "@/components/brand/char-reveal";
import { PRODUCT_LINES_DATA } from "@/lib/products";

export function StoryProductLines() {
  return (
    <section className="py-32 border-t border-dim">
      <div className="wrap">
        <ScrollReveal>
          <span className="eyebrow">04 // THE FOUR LINES</span>
        </ScrollReveal>

        <ScrollReveal delay={1}>
          <CharReveal
            as="h2"
            text="BUILT FOR EVERY STAGE."
            className="font-display text-[clamp(2.5rem,8vw,6rem)] leading-[0.95] text-paper mt-6"
          />
        </ScrollReveal>

        <div className="mt-16 space-y-0">
          {PRODUCT_LINES_DATA.map((line, i) => (
            <ScrollReveal key={line.slug} delay={(i % 4) as 0 | 1 | 2 | 3}>
              <div className="border-t border-dim py-10 grid md:grid-cols-[80px_200px_1fr] gap-6 items-start">
                <span
                  className="font-display text-[3rem] leading-none"
                  style={{ color: line.color }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3
                    className="font-display text-[clamp(1.5rem,3vw,2.5rem)] leading-none"
                    style={{ color: line.color }}
                  >
                    {line.name}
                  </h3>
                  <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mt-1 block">
                    {line.tag}
                  </span>
                </div>
                <p className="text-paper/80 leading-relaxed max-w-[500px]">
                  {line.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
