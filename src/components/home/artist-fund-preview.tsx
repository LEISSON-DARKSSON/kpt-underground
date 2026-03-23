"use client";

import { ScrollReveal } from "@/components/brand/scroll-reveal";

const ARTISTS = [
  { name: "LEISSON", scene: "RAPTEK", amount: "2,800" },
  { name: "NEOONDREED", scene: "TEKNO", amount: "2,450" },
  { name: "CLY/SUVA", scene: "INDUSTRIAL", amount: "2,100" },
];

export function ArtistFundPreview() {
  return (
    <div className="flex flex-col" style={{ gap: 0, maxWidth: 640 }}>
      {ARTISTS.map((artist, i) => (
        <ScrollReveal key={artist.name} delay={(i + 1) as 1 | 2 | 3}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto",
              alignItems: "center",
              gap: 24,
              padding: "18px 0",
              borderBottom: "1px solid rgba(138, 206, 0, 0.06)",
            }}
          >
            <div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  letterSpacing: "0.06em",
                  color: "var(--paper)",
                  display: "block",
                }}
              >
                {artist.name}
              </span>
              <span
                style={{
                  fontSize: 8,
                  letterSpacing: "0.3em",
                  color: "var(--muted)",
                  textTransform: "uppercase",
                }}
              >
                {artist.scene}
              </span>
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 22,
                color: "var(--green)",
                letterSpacing: "-0.01em",
              }}
            >
              &euro;{artist.amount}
            </span>
            <span
              style={{
                fontSize: 7,
                letterSpacing: "0.3em",
                color: "var(--dim)",
                textTransform: "uppercase",
              }}
            >
              Q1 2025
            </span>
          </div>
        </ScrollReveal>
      ))}
    </div>
  );
}
