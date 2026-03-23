"use client";

import { useState, useRef } from "react";

interface FrequencyGateProps {
  onUnlock: () => void;
}

const CORRECT_CODE = "140HZ";

export function FrequencyGate({ onUnlock }: FrequencyGateProps) {
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit() {
    const normalized = input.trim().toUpperCase().replace(/\s/g, "");
    if (normalized === CORRECT_CODE || normalized === "140") {
      onUnlock();
    } else {
      setError(true);
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
      setTimeout(() => setError(false), 2000);
    }
  }

  return (
    <div className="border border-dim p-8 md:p-12 max-w-[600px] mx-auto">
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-orange border border-orange/30 px-2 py-1">
          FREQ-GATED
        </span>
        <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted border border-dim px-2 py-1">
          CLASSIFIED
        </span>
      </div>

      <h3 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.95] text-paper">
        ACCESS<br />RESTRICTED.
      </h3>

      <p className="text-paper/60 leading-relaxed mt-6 max-w-[440px]">
        A closed channel exists beyond this point. The access code was embedded in a recent broadcast.
        Those who were listening will already know.
      </p>

      {/* Terminal input */}
      <div
        className="mt-8 flex items-center gap-0 border border-dim"
        style={{
          animation: shaking ? "nudge 0.4s ease" : "none",
        }}
      >
        <span className="font-mono text-[11px] text-green px-4 py-3 border-r border-dim whitespace-nowrap">
          FREQ &gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Enter frequency code"
          className="flex-1 bg-transparent font-mono text-[11px] text-paper px-4 py-3 outline-none placeholder:text-dim"
          style={{ cursor: "text" }}
          autoComplete="off"
          spellCheck={false}
        />
        <button
          onClick={handleSubmit}
          className="font-mono text-[10px] tracking-[0.14em] uppercase text-ink bg-green px-5 py-3 hover:bg-green/90 transition-colors duration-200"
          data-cursor="h"
        >
          ENTER
        </button>
      </div>

      {error && (
        <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-orange mt-3">
          // FREQUENCY NOT RECOGNISED
        </p>
      )}

      <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-dim mt-3">
        // CORRECT CODE UNLOCKS ACCESS
      </p>
    </div>
  );
}
