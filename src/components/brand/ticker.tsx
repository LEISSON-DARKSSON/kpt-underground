"use client";

import { useState } from "react";

interface TickerProps {
  items: string[];
  duration?: number;
  reverse?: boolean;
}

export function Ticker({
  items,
  duration = 30,
  reverse = false,
}: TickerProps) {
  const doubled = [...items, ...items];
  const [paused, setPaused] = useState(false);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        zIndex: 1,
        borderTop: "1px solid rgba(138, 206, 0, 0.07)",
        borderBottom: "1px solid rgba(138, 206, 0, 0.07)",
        background: "rgba(138, 206, 0, 0.018)",
        padding: "11px 0",
        whiteSpace: "nowrap",
      }}
    >
      {/* Left fade */}
      <div
        className="absolute top-0 bottom-0 left-0 pointer-events-none"
        style={{
          width: 60,
          zIndex: 2,
          background: "linear-gradient(90deg, var(--ink), transparent)",
        }}
      />
      {/* Right fade */}
      <div
        className="absolute top-0 bottom-0 right-0 pointer-events-none"
        style={{
          width: 60,
          zIndex: 2,
          background: "linear-gradient(-90deg, var(--ink), transparent)",
        }}
      />

      <div
        className="inline-flex"
        style={{
          animation: `ticker-scroll ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
          animationPlayState: paused ? "paused" : "running",
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={i}
            style={{
              fontSize: 11,
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              color: "var(--muted)",
              padding: "0 24px",
              transition: "color var(--mid)",
            }}
            aria-hidden={i >= items.length ? true : undefined}
          >
            {item}
          </span>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? "Play moving text" : "Pause moving text"}
        data-cursor="h"
        className="absolute top-1/2 right-2 -translate-y-1/2 font-mono text-[11px] text-green bg-ink border border-green/30"
        style={{ zIndex: 3, minWidth: 32, height: 32 }}
      >
        {paused ? "▶" : "❚❚"}
      </button>
    </div>
  );
}
