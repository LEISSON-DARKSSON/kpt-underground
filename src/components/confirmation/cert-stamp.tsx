"use client";

import { useEffect, useState } from "react";

export function CertStamp() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative inline-flex">
      <div
        className="flex flex-col items-center justify-center rounded-full border-2 border-green relative"
        style={{
          width: 120,
          height: 120,
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1) rotate(-8deg)" : "scale(0.4) rotate(-20deg)",
          transition: "opacity 0.6s var(--snap), transform 0.6s var(--snap)",
        }}
      >
        <span className="font-mono text-[7px] tracking-[0.3em] text-green uppercase">
          CERTIFIED
        </span>
        <span className="font-display text-[28px] leading-none text-green mt-0.5">
          KPT
        </span>
        <span className="font-mono text-[6px] tracking-[0.25em] text-green/50 uppercase mt-1">
          UNDERGROUND
        </span>
      </div>
      {/* Checkmark badge */}
      <div
        className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-green flex items-center justify-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "scale(1)" : "scale(0)",
          transition: "opacity 0.3s ease 0.5s, transform 0.3s var(--snap) 0.5s",
        }}
      >
        <span className="text-ink text-[14px] font-bold leading-none">✓</span>
      </div>
    </div>
  );
}
