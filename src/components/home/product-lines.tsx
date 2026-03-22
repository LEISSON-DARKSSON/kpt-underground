"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/brand/scroll-reveal";

const LINES = [
  {
    name: "RAVE",
    color: "#8ACE00",
    desc: "Engineered for the dancefloor. 72-hour durability tested.",
    slug: "rave",
  },
  {
    name: "FESTIVAL",
    color: "#FF8C00",
    desc: "Weather-adaptive. From field to stage. All-terrain audio gear.",
    slug: "festival",
  },
  {
    name: "ACCESS",
    color: "#708090",
    desc: "Backstage infrastructure. Crew-grade equipment for builders.",
    slug: "access",
  },
  {
    name: "MAINSTREAM",
    color: "#A0522D",
    desc: "The crossover line. Underground values, surface-level access.",
    slug: "mainstream",
  },
];

export function ProductLines() {
  return (
    <div className="flex flex-col" style={{ gap: "1px" }}>
      {LINES.map((line, i) => (
        <ScrollReveal key={line.name} delay={(i + 1) as 1 | 2 | 3 | 4}>
          <Link
            href={`/shop?line=${line.slug}`}
            data-cursor="shop"
            data-cursor-label={line.name}
            className="group"
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr auto",
              alignItems: "center",
              gap: 32,
              padding: "28px 0",
              borderBottom: "1px solid rgba(138, 206, 0, 0.06)",
              textDecoration: "none",
              transition: "background var(--mid)",
              cursor: "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 32,
                letterSpacing: "0.08em",
                color: line.color,
              }}
            >
              {line.name}
            </span>
            <span
              style={{
                fontSize: 12,
                color: "var(--muted)",
                letterSpacing: "0.02em",
              }}
            >
              {line.desc}
            </span>
            <span
              style={{
                fontSize: 9,
                letterSpacing: "0.4em",
                color: "var(--dim)",
                textTransform: "uppercase",
                transition: "color var(--mid)",
              }}
            >
              EXPLORE &#x2192;
            </span>
          </Link>
        </ScrollReveal>
      ))}
    </div>
  );
}
