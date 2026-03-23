"use client";

import { useEffect, useState, useRef } from "react";

const TERMINAL_LINES = [
  { text: "INITIALIZING SIGNAL PROTOCOL...", type: "dim", delay: 0 },
  { text: "CONNECTING TO KPT NETWORK...", type: "dim", delay: 600 },
  { text: "FREQUENCY LOCK: 140HZ .............. OK", type: "success", delay: 1200 },
  { text: "AUTHENTICATION: PURCHASE VERIFIED ... OK", type: "success", delay: 1800 },
  { text: "SIGNAL ALLOCATION: TIER 1 .......... OK", type: "success", delay: 2400 },
  { text: "NETWORK ID: SIG-2025-0847-KPT", type: "info", delay: 3000 },
  { text: "ACCESS LEVEL: FULL SPECTRUM", type: "info", delay: 3400 },
  { text: "", type: "dim", delay: 3800 },
  { text: "SIGNAL NETWORK STATUS: ACTIVE", type: "success", delay: 4200 },
  { text: ">> WELCOME TO THE UNDERGROUND", type: "success", delay: 4800 },
];

export function SignalTerminal() {
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    TERMINAL_LINES.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(i + 1);
        setProgress(Math.min(100, ((i + 1) / TERMINAL_LINES.length) * 100));
      }, line.delay);
    });
  }, []);

  return (
    <div className="mt-6">
      {/* Terminal container */}
      <div
        className="relative"
        style={{
          background: "#030a03",
          border: "1px solid rgba(138, 206, 0, 0.2)",
          padding: 28,
        }}
      >
        {/* CRT flicker overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "repeating-linear-gradient(0deg, transparent 0, transparent 2px, rgba(138,206,0,0.015) 2px, rgba(138,206,0,0.015) 3px)",
            animation: "crt-flicker 0.08s step-end infinite",
          }}
        />

        {/* Header */}
        <div
          className="flex justify-between pb-3 mb-4"
          style={{ borderBottom: "1px solid rgba(138, 206, 0, 0.1)" }}
        >
          <span className="font-mono text-[8px] tracking-[0.3em] text-green/60 uppercase">
            KPT-SIGNAL-TERMINAL V3.2
          </span>
          <span className="font-mono text-[8px] tracking-[0.3em] text-green/40 uppercase">
            SESSION: ACTIVE
          </span>
        </div>

        {/* Terminal body */}
        <div className="font-mono text-[11px] leading-[2]" style={{ minHeight: 240, color: "rgba(138,206,0,0.8)" }}>
          {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
            <div
              key={i}
              style={{
                color:
                  line.type === "success" ? "var(--green)" :
                  line.type === "info" ? "var(--paper)" :
                  "var(--slate)",
                opacity: line.text === "" ? 0 : 1,
              }}
            >
              {line.text || "\u00A0"}
            </div>
          ))}

          {/* Blinking cursor */}
          {visibleLines < TERMINAL_LINES.length && (
            <span
              className="inline-block w-2 h-3.5 bg-green"
              style={{ animation: "blink 1.2s step-end infinite" }}
            />
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="max-w-[720px] mx-auto mt-6">
        <div className="flex justify-between mb-2">
          <span className="font-mono text-[8px] tracking-[0.3em] text-muted uppercase">
            SIGNAL ACTIVATION
          </span>
          <span className="font-mono text-[8px] tracking-[0.3em] text-green uppercase">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-[2px]" style={{ background: "rgba(138,206,0,0.08)" }}>
          <div
            className="h-full bg-green transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
