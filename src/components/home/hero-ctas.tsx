"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/brand/scroll-reveal";

export function HeroCTAs() {
  return (
    <ScrollReveal delay={3}>
      <div
        className="flex items-center flex-wrap"
        style={{ gap: 28, marginTop: 44 }}
      >
        <Link
          href="/shop"
          data-cursor="shop"
          data-cursor-label=""
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 14,
            padding: "16px 32px",
            background: "var(--green)",
            color: "var(--ink)",
            fontFamily: "var(--font-display)",
            fontSize: 20,
            letterSpacing: "0.12em",
            border: "none",
            textDecoration: "none",
            transition:
              "background var(--mid), color var(--mid), transform 0.1s",
            cursor: "none",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--paper)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--green)";
          }}
        >
          VIEW EQUIPMENT <span>&#x2192;</span>
        </Link>

        <Link
          href="/story"
          data-cursor="hover"
          data-cursor-label="STORY"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            fontSize: 9,
            letterSpacing: "0.45em",
            textTransform: "uppercase",
            color: "var(--green)",
            textDecoration: "none",
            borderBottom: "1px solid rgba(138, 206, 0, 0.22)",
            paddingBottom: 4,
            transition: "color var(--mid), border-color var(--mid)",
          }}
        >
          READ THE STORY <span>&#x2192;</span>
        </Link>
      </div>
    </ScrollReveal>
  );
}
