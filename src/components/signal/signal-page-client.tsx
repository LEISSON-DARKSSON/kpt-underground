import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { SignalFeed } from "@/components/signal/signal-feed";

const BENEFITS = [
  { num: "01", title: "STUDIO NOTES", desc: "Design notes and new objects as they are published." },
  { num: "02", title: "NO ALGORITHM", desc: "Nothing here is ranked, boosted or sponsored." },
];

/** Server component: the Signal journal is open to everyone, there is no gate and no client state. */
export function SignalPageClient() {
  return (
    <>
      <section className="py-12 border-b border-green/10">
        <div className="wrap">
          <ScrollReveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-green border border-green/30 px-2 py-1">
                <span style={{ animation: "blink 1.6s step-end infinite" }}>&#x25CF; </span>
                OPEN
              </span>
              <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted">
                SIGNAL // STUDIO JOURNAL
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-16 border-b border-dim">
        <div className="wrap">
          <div className="grid md:grid-cols-2 gap-6">
            {BENEFITS.map((item, i) => (
              <ScrollReveal key={item.num} delay={(i % 4) as 0 | 1 | 2 | 3}>
                <div className="border border-dim p-6">
                  <span className="font-display text-2xl text-green">{item.num}</span>
                  <h3 className="font-mono text-[11px] tracking-[0.14em] uppercase text-paper mt-3">{item.title}</h3>
                  <p className="font-mono text-[11px] text-paper/50 leading-relaxed mt-2">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <SignalFeed />
    </>
  );
}
