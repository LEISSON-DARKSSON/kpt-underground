"use client";

import { ScrollReveal } from "@/components/brand/scroll-reveal";

const STATS = [
  { value: "4", label: "EQUIPMENT LINES" },
  { value: "10%", label: "ARTIST FUND" },
  { value: "140", label: "HZ FREQUENCY" },
];

export function HeroStats() {
  return (
    <ScrollReveal delay={4}>
      <div
        className="flex"
        style={{
          gap: 0,
          marginTop: 52,
          border: "1px solid rgba(138, 206, 0, 0.1)",
          maxWidth: 560,
        }}
      >
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            style={{
              flex: 1,
              padding: "14px 16px",
              borderRight:
                i < STATS.length - 1
                  ? "1px solid rgba(138, 206, 0, 0.07)"
                  : "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                color: "var(--green)",
                lineHeight: 1,
                display: "block",
                letterSpacing: "-0.01em",
              }}
            >
              {stat.value}
            </span>
            <span
              style={{
                fontSize: 7,
                letterSpacing: "0.3em",
                color: "var(--muted)",
                textTransform: "uppercase",
                display: "block",
                marginTop: 3,
              }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
