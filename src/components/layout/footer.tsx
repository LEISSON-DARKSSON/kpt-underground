import Link from "next/link";

import { POLICY_LINKS } from "@/lib/store/policies";

const FOOTER_LINKS = [
  { href: "/shop", label: "SHOP" },
  { href: "/story", label: "STORY" },
  { href: "/signal", label: "SIGNAL" },
  { href: "/help", label: "SHIPPING & RETURNS" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative"
      style={{
        zIndex: 1,
        borderTop: "1px solid rgba(138, 206, 0, 0.06)",
        padding: "48px 0 32px",
      }}
    >
      <div className="wrap">
        {/* Top row */}
        <div
          className="flex flex-col gap-6"
          style={{ marginBottom: 48 }}
        >
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 24,
              letterSpacing: "0.2em",
              color: "var(--green)",
            }}
          >
            KPT UNDERGROUND
          </span>

          <div className="flex gap-6 flex-wrap">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-cursor="h"
                data-cursor-label={link.label}
                style={{
                  fontSize: 11,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  textDecoration: "none",
                  transition: "color var(--mid)",
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Policies and contact live on the Fourthwall shop (KPT-05): visible before checkout. */}
          <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Policies and contact" data-footer-policies>
            {POLICY_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener" data-cursor="h" className="font-mono text-[11px] text-slate underline underline-offset-4 hover:text-green">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: "rgba(138, 206, 0, 0.06)",
            marginBottom: 24,
          }}
        />

        {/* Bottom row */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              color: "rgba(112, 128, 144, 0.7)",
              textTransform: "uppercase",
            }}
          >
            {year} KPT-UNDERGROUND // ALL RIGHTS RESERVED
          </span>
          <span
            style={{
              fontSize: 10,
              letterSpacing: "0.3em",
              color: "rgba(112, 128, 144, 0.7)",
              textTransform: "uppercase",
            }}
          >
            MADE ON DEMAND // CHECKOUT BY FOURTHWALL
          </span>
        </div>
      </div>
    </footer>
  );
}
