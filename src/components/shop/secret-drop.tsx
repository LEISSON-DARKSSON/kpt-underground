"use client";

import { useState, useCallback, useRef } from "react";
import { PRODUCTS, formatEUR, getLineColor } from "@/lib/products";
import { ProductCard } from "@/components/shop/product-card";

const SECRET_PRODUCTS = PRODUCTS.filter((p) => p.badge === "SECRET" || p.line === "secret");

export function SecretDrop() {
  const [unlocked, setUnlocked] = useState(false);
  const [inputVal, setInputVal] = useState("");
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    const val = inputVal.trim().toUpperCase();
    if (val === "140HZ" || val === "140") {
      setUnlocked(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setInputVal("");
    }
  }, [inputVal]);

  // If no secret products exist, show a generic tease
  const hasSecrets = SECRET_PRODUCTS.length > 0;

  return (
    <section
      className="relative overflow-hidden"
      style={{
        margin: "0",
        background: "var(--ink2)",
        border: "1px solid rgba(255, 140, 0, 0.12)",
      }}
    >
      {/* Noise overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.018'/%3E%3C/svg%3E")`,
          backgroundSize: "128px",
        }}
      />

      {unlocked ? (
        /* ─── UNLOCKED: Show secret products ─── */
        <div className="relative p-10" style={{ animation: "fadeup 0.5s var(--snap)" }}>
          <span className="font-mono text-[8px] tracking-[0.5em] uppercase text-orange block mb-4">
            ● SECRET DROP // UNLOCKED
          </span>
          <h3 className="font-display text-[clamp(28px,4vw,48px)] leading-[0.88] text-paper mb-6">
            THE <span className="text-orange">HIDDEN</span> LINE
          </h3>
          {hasSecrets ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5">
              {SECRET_PRODUCTS.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-0.5">
              {PRODUCTS.slice(0, 4).map((p) => (
                <div key={p.id} className="aspect-square bg-ink relative overflow-hidden border border-dim">
                  <div
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `linear-gradient(45deg, ${getLineColor(p.line)}22 1px, transparent 1px), linear-gradient(-45deg, ${getLineColor(p.line)}22 1px, transparent 1px)`,
                      backgroundSize: "16px 16px",
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-xl text-paper/5">{p.ref}</span>
                  </div>
                  <span className="absolute bottom-3 left-3 font-mono text-[8px] tracking-[0.2em] text-orange/60 uppercase">
                    SECRET // SS-2025
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ─── LOCKED: Frequency gate ─── */
        <div className="relative grid md:grid-cols-2 gap-12">
          {/* Left: Input */}
          <div className="p-10">
            <span className="font-mono text-[8px] tracking-[0.5em] uppercase text-orange block mb-4">
              ● CLASSIFIED
            </span>
            <h3 className="font-display text-[clamp(36px,5vw,64px)] leading-[0.88] text-paper mb-4">
              SECRET<br />
              <span className="text-orange">DROP</span>
            </h3>
            <p className="font-mono text-[13px] text-muted leading-[1.8] mb-6 max-w-[400px]">
              Limited pieces, unlocked by frequency. Enter the signal code to access the hidden collection.
            </p>

            {/* Terminal input */}
            <div
              className="flex items-stretch border transition-transform duration-200"
              style={{
                borderColor: "rgba(255, 140, 0, 0.25)",
                background: "rgba(255, 140, 0, 0.03)",
                transform: shake ? "translateX(-4px)" : "none",
                animation: shake ? "shake 0.3s ease" : undefined,
              }}
            >
              <span
                className="font-mono text-[13px] text-orange flex items-center px-4 select-none"
                style={{ borderRight: "1px solid rgba(255,140,0,0.15)" }}
              >
                FREQ &gt;
              </span>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="ENTER FREQUENCY"
                className="flex-1 bg-transparent font-mono text-[13px] text-paper uppercase px-4 py-3.5 outline-none placeholder:text-dim"
                style={{ caretColor: "var(--orange)", border: "none" }}
                data-cursor="h"
              />
              <button
                onClick={handleSubmit}
                className="font-mono text-[9px] tracking-[0.3em] uppercase text-orange px-5 transition-colors duration-200 hover:bg-orange hover:text-ink"
                style={{ borderLeft: "1px solid rgba(255,140,0,0.15)", background: "none", border: "none", borderLeftStyle: "solid", borderLeftWidth: 1, borderLeftColor: "rgba(255,140,0,0.15)" }}
                data-cursor="h"
              >
                SUBMIT
              </button>
            </div>
          </div>

          {/* Right: Locked preview grid */}
          <div className="grid grid-cols-2 gap-0.5 p-1 md:p-0">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-square bg-ink relative overflow-hidden">
                {/* Diagonal stripes */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,140,0,0.04) 8px, rgba(255,140,0,0.04) 9px)",
                  }}
                />
                {/* Lock icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-[24px] text-paper/15">⬡</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
