"use client";

import { useState } from "react";
import { FrequencyGate } from "@/components/signal/frequency-gate";
import { SignalFeed } from "@/components/signal/signal-feed";
import { ScrollReveal } from "@/components/brand/scroll-reveal";

export function SignalPageClient() {
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <section className="py-24">
        <FrequencyGate onUnlock={() => setUnlocked(true)} />
      </section>
    );
  }

  return (
    <>
      {/* Unlocked header */}
      <section className="py-12 border-b border-green/10">
        <div className="wrap">
          <ScrollReveal>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-green border border-green/30 px-2 py-1">
                <span style={{ animation: "blink 1.6s step-end infinite" }}>&#x25CF; </span>
                ACCESS GRANTED
              </span>
              <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted">
                SIGNAL NETWORK // LIVE FEED
              </span>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 border-b border-dim">
        <div className="wrap">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { num: "01", title: "DIRECT EVENT ACCESS", desc: "Location coordinates for parties with no public existence." },
              { num: "02", title: "CULTURE PARTICIPATION", desc: "Early drops. Direct communication. Closed broadcast channels." },
              { num: "03", title: "AUTOMATIC ACTIVATION", desc: "Your order number is your access key. No signup required." },
              { num: "04", title: "NO EXPIRATION", desc: "Lifetime access. Multiple purchases expand your access level." },
            ].map((item, i) => (
              <ScrollReveal key={item.num} delay={(i % 4) as 0 | 1 | 2 | 3}>
                <div className="border border-dim p-6">
                  <span className="font-display text-2xl text-green">{item.num}</span>
                  <h3 className="font-mono text-[10px] tracking-[0.14em] uppercase text-paper mt-3">{item.title}</h3>
                  <p className="font-mono text-[10px] text-paper/50 leading-relaxed mt-2">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Signal feed */}
      <SignalFeed />
    </>
  );
}
