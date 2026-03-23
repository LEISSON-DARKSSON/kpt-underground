"use client";

import { useState } from "react";
import { ScrollReveal } from "@/components/brand/scroll-reveal";
import type { ArtistProfile } from "@/lib/artists";
import { formatFundAmount } from "@/lib/artists";

/* Scene → color mapping */
const SCENE_COLORS: Record<string, string> = {
  "TECHNO": "#8ACE00",
  "HARD TECHNO": "#FF8C00",
  "DnB": "#708090",
  "DUBSTEP": "#A0522D",
};

function getSceneColor(scene: string): string {
  return SCENE_COLORS[scene] ?? "#8ACE00";
}

/* Random-ish waveform bar heights for visual interest */
function getWaveformBars(id: string): number[] {
  const seed = id.charCodeAt(0) + id.charCodeAt(1);
  return Array.from({ length: 24 }, (_, i) => {
    const v = Math.abs(Math.sin(seed * 0.1 + i * 0.7)) * 80 + 20;
    return Math.round(v);
  });
}

interface ArtistGridProps {
  artists: ArtistProfile[];
}

const FILTERS = ["ALL", "TECHNO", "HARD TECHNO", "DnB", "DUBSTEP"];

export function ArtistGrid({ artists }: ArtistGridProps) {
  const [filter, setFilter] = useState("ALL");

  const filtered = filter === "ALL" ? artists : artists.filter((a) => a.scene === filter);

  return (
    <section className="py-20 border-t border-dim">
      <div className="wrap">
        <ScrollReveal>
          <span className="eyebrow">CURRENT RECIPIENTS // {artists.length} ARTISTS</span>
        </ScrollReveal>

        {/* Filter controls */}
        <div className="flex flex-wrap gap-0.5 mt-6 mb-10">
          {FILTERS.filter((f) => f === "ALL" || artists.some((a) => a.scene === f)).map((f) => {
            const isActive = filter === f;
            const color = f === "ALL" ? "var(--green)" : getSceneColor(f);
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="font-mono text-[8px] tracking-[0.3em] uppercase px-3.5 py-1.5 border transition-colors duration-200"
                style={{
                  color: isActive ? color : "var(--muted)",
                  borderColor: isActive ? color : "rgba(112,128,144,0.15)",
                  background: isActive ? `${color}0a` : "transparent",
                }}
                data-cursor="h"
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Artist card grid — 3 cols with 2px gap */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 2 }}>
          {filtered.map((artist) => {
            const sceneColor = getSceneColor(artist.scene);
            const bars = getWaveformBars(artist.id);
            return (
              <ScrollReveal key={artist.id}>
                <div className="bg-ink-2 overflow-hidden group" data-cursor="h">
                  {/* Visual area — waveform */}
                  <div
                    className="relative overflow-hidden"
                    style={{ aspectRatio: "16/9", background: "var(--ink)" }}
                  >
                    {/* Scene color stripe (scaleX on hover) */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] transition-transform duration-[400ms] origin-left"
                      style={{
                        backgroundColor: sceneColor,
                        transform: "scaleX(0)",
                        transitionTimingFunction: "var(--ease)",
                      }}
                      ref={(el) => {
                        if (!el) return;
                        const parent = el.closest(".group");
                        if (!parent) return;
                        parent.addEventListener("mouseenter", () => { el.style.transform = "scaleX(1)"; });
                        parent.addEventListener("mouseleave", () => { el.style.transform = "scaleX(0)"; });
                      }}
                    />

                    {/* Waveform bars */}
                    <div className="absolute inset-0 flex items-end justify-center px-4 pb-4 gap-[2px]">
                      {bars.map((h, i) => (
                        <div
                          key={i}
                          className="flex-1 transition-opacity duration-300"
                          style={{
                            height: `${h}%`,
                            backgroundColor: `${sceneColor}30`,
                            maxWidth: 6,
                          }}
                        />
                      ))}
                    </div>

                    {/* Amount overlay (bottom right, shows on hover) */}
                    <div
                      className="absolute bottom-3 right-3 font-display text-[22px] transition-colors duration-200"
                      style={{ color: "rgba(138,206,0,0.15)" }}
                      ref={(el) => {
                        if (!el) return;
                        const parent = el.closest(".group");
                        if (!parent) return;
                        parent.addEventListener("mouseenter", () => { el.style.color = sceneColor; });
                        parent.addEventListener("mouseleave", () => { el.style.color = "rgba(138,206,0,0.15)"; });
                      }}
                    >
                      {formatFundAmount(artist.fundAmount)}
                    </div>
                  </div>

                  {/* Info section */}
                  <div className="px-[18px] py-4 pb-5">
                    {/* Scene tag */}
                    <span
                      className="inline-block font-mono text-[7px] tracking-[0.35em] uppercase px-2 py-0.5 border mb-2"
                      style={{ color: sceneColor, borderColor: `${sceneColor}40` }}
                    >
                      {artist.scene}
                    </span>

                    {/* Name */}
                    <h3
                      className="font-display tracking-[0.04em] leading-none"
                      style={{ fontSize: "clamp(22px, 2.8vw, 32px)", color: "var(--paper)" }}
                    >
                      {artist.name}
                    </h3>

                    {/* Bio */}
                    <p className="font-mono text-[11px] text-muted leading-[1.75] mt-2 line-clamp-2">
                      {artist.bio}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-muted border border-dim px-2 py-0.5">
                        {artist.location}
                      </span>
                      <span className="font-mono text-[7px] tracking-[0.2em] uppercase text-muted border border-dim px-2 py-0.5">
                        {artist.frequency}
                      </span>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
