"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/story", label: "STORY" },
  { href: "/editorial", label: "ARTISTS" },
  { href: "/shop", label: "SHOP" },
];

export function Navbar() {
  const [show, setShow] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
  }, []);

  useEffect(() => {
    // Show nav after loader
    const timer = setTimeout(() => setShow(true), 3000);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <nav
      id="nav"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: "var(--z-nav)" as string,
        height: 56,
        padding: "0 40px",
        display: "flex",
        alignItems: "center",
        background: scrolled ? "rgba(5, 5, 5, 0.96)" : "rgba(5, 5, 5, 0)",
        borderBottom: `1px solid ${scrolled ? "rgba(138, 206, 0, 0.07)" : "rgba(138, 206, 0, 0)"}`,
        backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
        transition:
          "background 0.5s ease, border-color 0.5s ease, backdrop-filter 0.5s ease, opacity 0.5s ease",
        opacity: show ? 1 : 0,
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        data-cursor="hover"
        data-cursor-label="HOME"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 17,
          letterSpacing: "0.2em",
          color: "var(--green)",
          textDecoration: "none",
          marginRight: 32,
        }}
      >
        KPT
      </Link>

      {/* Links */}
      <div className="flex" style={{ gap: 0, marginRight: "auto" }}>
        {NAV_LINKS.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              data-cursor="hover"
              data-cursor-label={link.label}
              style={{
                fontSize: 8,
                letterSpacing: "0.35em",
                textTransform: "uppercase",
                color: isActive ? "var(--green)" : "var(--muted)",
                textDecoration: "none",
                padding: "0 16px",
                height: 56,
                display: "flex",
                alignItems: "center",
                borderBottom: `2px solid ${isActive ? "var(--green)" : "transparent"}`,
                transition: "color var(--mid), border-color var(--mid)",
              }}
              onMouseEnter={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.color = "var(--paper)";
              }}
              onMouseLeave={(e) => {
                if (!isActive)
                  (e.currentTarget as HTMLElement).style.color = "var(--muted)";
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* Live indicator */}
      <span
        style={{
          fontSize: 7,
          letterSpacing: "0.3em",
          color: "var(--green)",
          opacity: 0.4,
          marginRight: 20,
        }}
      >
        <span style={{ animation: "blink 1.6s step-end infinite" }}>
          &#x25CF;{" "}
        </span>
        LIVE
      </span>

      {/* Shop button */}
      <Link
        href="/shop"
        data-cursor="shop"
        data-cursor-label=""
        style={{
          fontSize: 9,
          letterSpacing: "0.4em",
          textTransform: "uppercase",
          color: "var(--green)",
          textDecoration: "none",
          border: "1px solid rgba(138, 206, 0, 0.22)",
          padding: "7px 18px",
          transition: "background var(--mid), color var(--mid), border-color var(--mid)",
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "var(--green)";
          el.style.color = "var(--ink)";
          el.style.borderColor = "var(--green)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = "transparent";
          el.style.color = "var(--green)";
          el.style.borderColor = "rgba(138, 206, 0, 0.22)";
        }}
      >
        EQUIPMENT
      </Link>
    </nav>
  );
}
