"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

const NAV_LINKS = [
  { href: "/", label: "HOME" },
  { href: "/story", label: "STORY" },
  { href: "/artists", label: "ARTISTS" },
  { href: "/shop", label: "SHOP" },
  { href: "/signal", label: "SIGNAL" },
];

export function Navbar() {
  const [show, setShow] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { totalItems, toggleCart } = useCart();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  /* Lock body scroll when menu is open */
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), 3000);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  return (
    <>
      <nav
        id="nav"
        className="fixed top-0 left-0 right-0 flex items-center transition-all duration-500"
        style={{
          zIndex: "var(--z-nav)" as string,
          height: 56,
          padding: "0 clamp(16px, 4vw, 40px)",
          background: scrolled || menuOpen ? "rgba(5, 5, 5, 0.96)" : "rgba(5, 5, 5, 0)",
          borderBottom: `1px solid ${scrolled ? "rgba(138, 206, 0, 0.07)" : "rgba(138, 206, 0, 0)"}`,
          backdropFilter: scrolled ? "blur(16px)" : "blur(0px)",
          opacity: show ? 1 : 0,
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          data-cursor="hover"
          data-cursor-label="HOME"
          className="font-display text-green no-underline"
          style={{ fontSize: 17, letterSpacing: "0.2em", marginRight: 32 }}
        >
          KPT
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex" style={{ gap: 0, marginRight: "auto" }}>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                data-cursor="hover"
                data-cursor-label={link.label}
                className="flex items-center no-underline transition-colors"
                style={{
                  fontSize: 8,
                  letterSpacing: "0.35em",
                  textTransform: "uppercase",
                  color: isActive ? "var(--green)" : "var(--muted)",
                  padding: "0 16px",
                  height: 56,
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

        {/* Spacer for mobile */}
        <div className="flex-1 md:hidden" />

        {/* Live indicator — desktop only */}
        <span
          className="hidden md:inline-block"
          style={{
            fontSize: 7,
            letterSpacing: "0.3em",
            color: "var(--green)",
            opacity: 0.4,
            marginRight: 20,
          }}
        >
          <span style={{ animation: "blink 1.6s step-end infinite" }}>&#x25CF; </span>
          LIVE
        </span>

        {/* Cart button — desktop */}
        <button
          onClick={toggleCart}
          className="hidden md:flex items-center gap-2 no-underline transition-colors"
          style={{
            fontSize: 9,
            letterSpacing: "0.4em",
            textTransform: "uppercase",
            color: "var(--green)",
            border: "1px solid rgba(138, 206, 0, 0.22)",
            padding: "7px 18px",
            background: "transparent",
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
          data-cursor="shop"
          data-cursor-label="CART"
          aria-label={`Shopping cart with ${totalItems} items`}
        >
          CART
          {totalItems > 0 && (
            <span
              className="font-mono text-[9px] bg-green text-ink px-1.5 py-0.5 leading-none"
              style={{ minWidth: 18, textAlign: "center", letterSpacing: 0 }}
            >
              {totalItems}
            </span>
          )}
        </button>

        {/* Cart button — mobile (before hamburger) */}
        <button
          onClick={toggleCart}
          className="md:hidden flex items-center justify-center relative"
          style={{ width: 44, height: 44, background: "none", border: "none" }}
          data-cursor="h"
          aria-label={`Shopping cart with ${totalItems} items`}
        >
          <span className="font-mono text-[9px] tracking-[0.2em] text-green">CART</span>
          {totalItems > 0 && (
            <span
              className="absolute font-mono text-[8px] bg-green text-ink rounded-full leading-none"
              style={{ top: 6, right: 2, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {totalItems}
            </span>
          )}
        </button>

        {/* Hamburger — mobile only */}
        <button
          type="button"
          className="md:hidden flex flex-col justify-center items-center"
          style={{
            width: 44,
            height: 44,
            background: "none",
            border: "none",
            padding: 0,
            gap: 5,
          }}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          data-cursor="h"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span
            className="block transition-transform duration-300"
            style={{
              width: 22,
              height: 1.5,
              background: "var(--green)",
              transform: menuOpen ? "translateY(3.25px) rotate(45deg)" : "none",
              transformOrigin: "center",
            }}
          />
          <span
            className="block transition-all duration-300"
            style={{
              width: 22,
              height: 1.5,
              background: "var(--green)",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block transition-transform duration-300"
            style={{
              width: 22,
              height: 1.5,
              background: "var(--green)",
              transform: menuOpen ? "translateY(-3.25px) rotate(-45deg)" : "none",
              transformOrigin: "center",
            }}
          />
        </button>
      </nav>

      {/* ═══ MOBILE MENU OVERLAY ═══ */}
      <div
        className="md:hidden fixed inset-0 flex flex-col justify-center items-center transition-all duration-500"
        style={{
          zIndex: "calc(var(--z-nav) - 1)" as string,
          background: "rgba(5, 5, 5, 0.98)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transform: menuOpen ? "none" : "translateY(-8px)",
        }}
        aria-hidden={!menuOpen}
      >
        <div className="flex flex-col items-center" style={{ gap: 8 }}>
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                data-cursor="h"
                className="font-display no-underline text-center transition-colors duration-200"
                style={{
                  fontSize: "clamp(2rem, 8vw, 3.5rem)",
                  letterSpacing: "0.08em",
                  color: isActive ? "var(--green)" : "var(--paper)",
                  padding: "8px 24px",
                  minHeight: 44,
                  display: "flex",
                  alignItems: "center",
                }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile shop CTA */}
        <Link
          href="/shop"
          data-cursor="shop"
          className="no-underline mt-12 font-mono uppercase transition-colors duration-200"
          style={{
            fontSize: 11,
            letterSpacing: "0.3em",
            color: "var(--ink)",
            background: "var(--green)",
            padding: "14px 32px",
            minHeight: 44,
            display: "flex",
            alignItems: "center",
          }}
          onClick={() => setMenuOpen(false)}
        >
          VIEW EQUIPMENT
        </Link>

        {/* Live indicator mobile */}
        <span
          className="mt-10 font-mono uppercase"
          style={{
            fontSize: 8,
            letterSpacing: "0.3em",
            color: "var(--green)",
            opacity: 0.3,
          }}
        >
          <span style={{ animation: "blink 1.6s step-end infinite" }}>&#x25CF; </span>
          SIGNAL ACTIVE
        </span>
      </div>
    </>
  );
}
