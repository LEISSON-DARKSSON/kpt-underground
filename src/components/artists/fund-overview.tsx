import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { getTotalFundDistributed, formatFundAmount } from "@/lib/artists";

const QUARTERLY_DATA = [
  { quarter: "Q1 2024", amount: 4200, pct: 35 },
  { quarter: "Q2 2024", amount: 5800, pct: 48 },
  { quarter: "Q3 2024", amount: 7200, pct: 60 },
  { quarter: "Q4 2024", amount: 9100, pct: 76 },
  { quarter: "Q1 2025", amount: 11400, pct: 95 },
];

const CRITERIA = [
  "Active in underground electronic music for 2+ years",
  "Not signed to major label or distribution deal",
  "Community-nominated — no application process",
  "Verified by scene presence, not follower count",
  "Quarterly rotating selection based on network signal",
];

export function FundOverview() {
  const total = getTotalFundDistributed();

  return (
    <section className="py-20" style={{ background: "var(--ink2)" }}>
      <div className="wrap">
        <div className="grid md:grid-cols-2 gap-[72px] items-start">
          {/* Left: Amount + Criteria */}
          <div>
            <ScrollReveal>
              <div>
                <span
                  className="font-display leading-[0.85]"
                  style={{ fontSize: "clamp(64px, 11vw, 130px)", color: "var(--green)", letterSpacing: "-0.03em" }}
                >
                  {formatFundAmount(total).replace("€", "")}
                </span>
                <span
                  className="font-display block"
                  style={{ fontSize: "clamp(28px, 4vw, 52px)", color: "rgba(138,206,0,0.5)" }}
                >
                  EUR
                </span>
                <span
                  className="font-mono text-[9px] tracking-[0.3em] uppercase text-slate block mt-2.5 pt-2.5"
                  style={{ borderTop: "1px solid rgba(138,206,0,0.08)" }}
                >
                  DISTRIBUTED SINCE Q1 2024
                </span>
              </div>
            </ScrollReveal>

            {/* Criteria block */}
            <ScrollReveal delay={1}>
              <div className="bg-ink p-6 mt-8">
                <span className="font-mono text-[8px] tracking-[0.4em] uppercase text-muted block mb-4">
                  SELECTION CRITERIA
                </span>
                {CRITERIA.map((item, i) => (
                  <div
                    key={i}
                    className="font-mono text-[11px] text-muted leading-[1.7] py-2"
                    style={{ borderBottom: i < CRITERIA.length - 1 ? "1px solid rgba(138,206,0,0.04)" : "none" }}
                  >
                    <span className="text-green mr-2">—</span>
                    {item}
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>

          {/* Right: How it works + quarterly bars */}
          <div>
            <ScrollReveal>
              <h2 className="font-display text-[clamp(36px,5vw,60px)] leading-[0.88] text-paper">
                HOW THE<br /><span className="text-green">FUND</span> WORKS
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={1}>
              <p
                className="text-muted leading-[1.9] mt-6"
                style={{ fontSize: "clamp(13px, 1.5vw, 15px)" }}
              >
                10% of every transaction is allocated to the Artist Fund. No committee decides where it goes —
                the <strong className="text-paper">signal network itself identifies</strong> who is building the
                underground. Funds transfer quarterly, directly to artists, with full transparency on allocation.
              </p>
            </ScrollReveal>

            {/* Quarterly distribution bars */}
            <ScrollReveal delay={2}>
              <div className="mt-10">
                <span className="font-mono text-[8px] tracking-[0.4em] uppercase text-muted block mb-4">
                  QUARTERLY DISTRIBUTION
                </span>
                <div className="space-y-3">
                  {QUARTERLY_DATA.map((q) => (
                    <div key={q.quarter} className="flex items-center gap-3">
                      <span className="font-mono text-[8px] tracking-[0.2em] text-muted w-16 shrink-0">
                        {q.quarter}
                      </span>
                      <div className="flex-1 h-[3px] bg-dim/30 relative">
                        <div
                          className="absolute left-0 top-0 h-full bg-green transition-all duration-700"
                          style={{ width: `${q.pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[9px] tracking-[0.1em] text-green w-16 text-right">
                        €{q.amount.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
