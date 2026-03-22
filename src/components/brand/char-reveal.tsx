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

  const chars = useMemo(() => {
    return text.split("").map((char, i) => ({
      char,
      isSpace: char === " ",
      index: i,
    }));
  }, [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion) {
      setRevealed(true);
      return;
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
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={className}>
      {chars.map(({ char, isSpace, index }) =>
        isSpace ? (
          <span key={index} style={{ display: "inline" }}>
            &nbsp;
          </span>
        ) : (
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
        )
      )}
    </Tag>
  );
}
