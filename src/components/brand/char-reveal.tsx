"use client";

import { useEffect, useRef, useState, useMemo } from "react";

interface CharRevealProps {
  text: string;
  className?: string;
  staggerMs?: number;
  as?: "h1" | "h2" | "h3" | "span" | "div";
  accentClass?: string;
}

export function CharReveal({
  text,
  className = "",
  staggerMs = 35,
  as: Tag = "h1",
  accentClass,
}: CharRevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  // Letters are grouped per word: each word is one unbreakable unit and words are separated by
  // normal spaces, so lines wrap only between words (per-letter inline-blocks + non-breaking spaces let the
  // browser break inside words: "UNDERS / TOOD", "YO / U" on /story, 2026-10-02).
  const words = useMemo(() => {
    let index = 0;
    return text.split(" ").filter(Boolean).map((word) => word.split("").map((char) => ({ char, index: index++ })));
  }, [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      const frame = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={className} aria-label={text}>
      {words.map((letters, w) => (
        <span key={w} aria-hidden="true">
          {w > 0 && " "}
          <span data-word style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {letters.map(({ char, index }) => (
              <span
                key={index}
                className={accentClass}
                style={{
                  display: "inline-block",
                  opacity: revealed ? 1 : 0,
                  transform: revealed ? "none" : "translateY(16px) scale(0.94)",
                  transition: `opacity 0.48s var(--snap), transform 0.48s var(--snap)`,
                  transitionDelay: revealed ? `${index * staggerMs}ms` : "0ms",
                }}
              >
                {char}
              </span>
            ))}
          </span>
        </span>
      ))}
    </Tag>
  );
}
