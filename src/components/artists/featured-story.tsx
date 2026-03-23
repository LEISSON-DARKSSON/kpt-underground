import { ScrollReveal } from "@/components/brand/scroll-reveal";

export function FeaturedStory() {
  return (
    <section className="py-20" style={{ background: "var(--ink2)", borderTop: "1px solid rgba(138,206,0,0.06)" }}>
      <div className="wrap">
        <ScrollReveal>
          <span className="eyebrow">FEATURED ARTIST</span>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-16 mt-8">
          {/* Left: Q&A */}
          <div>
            <ScrollReveal delay={1}>
              <h2 className="font-display text-[clamp(36px,5.5vw,72px)] leading-[0.9] text-paper">
                NEOONDREED<br /><span className="text-green">ON THE</span><br />UNDERGROUND
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={2}>
              <div className="mt-8 space-y-6">
                {/* Q1 */}
                <div className="pt-4" style={{ borderTop: "1px solid rgba(138,206,0,0.06)" }}>
                  <span className="font-mono text-[8px] tracking-[0.3em] text-green uppercase block mb-2">
                    KPT ASKS
                  </span>
                  <p className="font-mono text-[13px] text-paper italic leading-[1.85]">
                    &ldquo;What does underground mean when everything is algorithmically surfaced?&rdquo;
                  </p>
                  <p className="font-mono text-[12px] text-muted leading-[1.85] mt-2">
                    Underground is a decision. It&apos;s not about who can find you — it&apos;s about what you refuse to
                    optimize for. When the algorithm rewards engagement, underground is the act of making music that
                    doesn&apos;t engage with engagement. The frequency stays low because the frequency was never meant
                    to reach everyone.
                  </p>
                </div>

                {/* Q2 */}
                <div className="pt-4" style={{ borderTop: "1px solid rgba(138,206,0,0.06)" }}>
                  <span className="font-mono text-[8px] tracking-[0.3em] text-green uppercase block mb-2">
                    KPT ASKS
                  </span>
                  <p className="font-mono text-[13px] text-paper italic leading-[1.85]">
                    &ldquo;How does the fund change what you make?&rdquo;
                  </p>
                  <p className="font-mono text-[12px] text-muted leading-[1.85] mt-2">
                    It doesn&apos;t change what I make. It changes the fact that what I make can continue. Most of us
                    aren&apos;t looking for a career — we&apos;re looking for the ability to keep going without
                    compromise. The fund isn&apos;t a grant. It&apos;s infrastructure. It&apos;s the sound system
                    itself saying: we see you, keep building.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right: Frequency visualization */}
          <div>
            <ScrollReveal delay={1}>
              <div
                className="relative overflow-hidden flex flex-col items-center justify-center p-6"
                style={{
                  background: "var(--ink)",
                  aspectRatio: "3/4",
                }}
              >
                {/* Animated frequency bars */}
                <div className="flex items-end gap-[3px] h-[200px]">
                  {Array.from({ length: 32 }, (_, i) => {
                    const h = Math.abs(Math.sin(i * 0.5 + 2.1)) * 70 + 30;
                    return (
                      <div
                        key={i}
                        className="w-[4px]"
                        style={{
                          height: `${h}%`,
                          backgroundColor: i % 3 === 0 ? "rgba(138,206,0,0.4)" : "rgba(138,206,0,0.15)",
                        }}
                      />
                    );
                  })}
                </div>

                {/* Meta */}
                <div className="absolute bottom-4 left-4">
                  <span className="font-mono text-[8px] tracking-[0.2em] text-muted uppercase block">
                    NEOONDREED // TECHNO // 135-150HZ
                  </span>
                  <span className="font-mono text-[7px] tracking-[0.2em] text-muted/50 uppercase block mt-0.5">
                    RECORDING SESSION 047
                  </span>
                </div>

                {/* Signal note (top right) */}
                <div className="absolute top-4 right-4">
                  <span
                    className="font-mono text-[7px] tracking-[0.3em] uppercase px-2 py-1 border"
                    style={{ color: "var(--orange)", borderColor: "rgba(255,140,0,0.3)" }}
                  >
                    FUND RECIPIENT
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
