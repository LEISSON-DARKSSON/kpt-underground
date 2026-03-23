"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { ProductData } from "@/lib/products";
import { formatEUR, getLineColor, PRODUCT_LINES_DATA } from "@/lib/products";
import { useCart } from "@/lib/cart-context";

interface ProductDetailProps {
  product: ProductData;
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes.find((s) => s.stock === "available")?.label ?? null
  );
  const [qty, setQty] = useState(1);
  const [toast, setToast] = useState(false);
  const { addItem } = useCart();

  const lineColor = getLineColor(product.line);
  const lineName = PRODUCT_LINES_DATA.find((l) => l.slug === product.line)?.name ?? product.line.toUpperCase();

  const handleAddToCart = useCallback(() => {
    if (!selectedSize) return;
    for (let i = 0; i < qty; i++) {
      addItem(product, selectedSize);
    }
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }, [selectedSize, qty, product, addItem]);

  /* Blueprint assembly phases */
  const assemblyPhases = ["FRAME", "PANEL", "DETAIL", "FINISH"];

  return (
    <>
      <div className="grid lg:grid-cols-2" style={{ gap: 0, minHeight: "calc(100vh - 56px)" }}>
        {/* ─── LEFT: Blueprint (sticky) ─── */}
        <div
          className="relative overflow-hidden lg:sticky lg:top-[56px]"
          style={{ height: "calc(100vh - 56px)", background: "var(--ink2)" }}
        >
          {/* Radial gradient overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(ellipse at center, ${lineColor}08 0%, transparent 70%)` }}
          />

          {/* Diagonal grid pattern */}
          <div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage: `linear-gradient(45deg, ${lineColor}22 1px, transparent 1px), linear-gradient(-45deg, ${lineColor}22 1px, transparent 1px)`,
              backgroundSize: "24px 24px",
            }}
          />

          {/* Crosshair center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-[1px] h-24 absolute left-1/2 -translate-x-1/2 -top-12" style={{ backgroundColor: `${lineColor}40` }} />
              <div className="h-[1px] w-24 absolute top-1/2 -translate-y-1/2 -left-12" style={{ backgroundColor: `${lineColor}40` }} />
              <div className="w-3 h-3 rounded-full border" style={{ borderColor: `${lineColor}60` }} />
            </div>
          </div>

          {/* Ref watermark */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="font-display text-[clamp(2rem,6vw,4rem)] text-paper/5">{product.ref}</span>
            <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-paper/10 mt-2">
              BLUEPRINT // REV B
            </span>
          </div>

          {/* Badge */}
          {product.badge && (
            <span
              className="absolute top-4 left-4 font-mono text-[9px] tracking-[0.14em] uppercase px-3 py-1 border"
              style={{
                color: product.badge === "LIMITED" ? "var(--orange)" : lineColor,
                borderColor: product.badge === "LIMITED" ? "rgba(255,140,0,0.3)" : `${lineColor}50`,
              }}
            >
              {product.badge}
            </span>
          )}

          {/* ─── Assembly Progress (left edge) ─── */}
          <div
            className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5"
          >
            {assemblyPhases.map((phase, i) => (
              <div key={phase} className="flex items-center gap-2 group" data-cursor="h">
                <div
                  className="w-1 h-1 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: i === 3 ? lineColor : `${lineColor}30`,
                    transform: i === 3 ? "scale(1.5)" : "scale(1)",
                  }}
                />
                <span
                  className="font-mono text-[6px] tracking-[0.3em] uppercase transition-opacity duration-200"
                  style={{ color: i === 3 ? lineColor : "var(--muted)", opacity: i === 3 ? 1 : 0.4 }}
                >
                  {phase}
                </span>
              </div>
            ))}
          </div>

          {/* ─── View Cycle Buttons (bottom right) ─── */}
          <div className="absolute bottom-4 right-4 flex gap-1">
            {["FRONT", "BACK", "FLAT"].map((view, i) => (
              <button
                key={view}
                className="font-mono text-[7px] tracking-[0.2em] uppercase px-2 py-1 border transition-colors duration-200"
                style={{
                  color: i === 0 ? lineColor : "var(--muted)",
                  borderColor: i === 0 ? lineColor : "rgba(138,206,0,0.15)",
                  background: i === 0 ? `${lineColor}0d` : "transparent",
                }}
                data-cursor="h"
              >
                {view}
              </button>
            ))}
          </div>

          {/* Bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: lineColor }} />

          {/* Bottom meta */}
          <div className="absolute bottom-4 left-4 right-20 flex justify-between">
            <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted">
              {product.ref} // {product.name} // REV B
            </span>
          </div>
        </div>

        {/* ─── RIGHT: Info ─── */}
        <div
          className="flex flex-col py-20 lg:py-0"
          style={{ padding: "80px 48px", borderLeft: "1px solid rgba(138,206,0,0.07)" }}
        >
          {/* Breadcrumb */}
          <nav className="font-mono text-[7px] tracking-[0.35em] uppercase text-muted mb-6">
            <Link href="/shop" className="hover:text-green transition-colors no-underline" data-cursor="h">
              COLLECTION
            </Link>
            {" // "}
            <span style={{ color: lineColor }}>{lineName}</span>
            {" // "}
            <span className="text-paper">{product.ref}</span>
          </nav>

          {/* Ref */}
          <span className="font-mono text-[8px] tracking-[0.4em] uppercase text-muted mb-2">{product.ref}</span>

          {/* Title */}
          <h1 className="font-display text-[clamp(36px,4.5vw,64px)] leading-[0.88] text-paper">
            {product.name.split(" ").map((word, i) => (
              <span key={i}>
                {word}
                {i < product.name.split(" ").length - 1 ? <br /> : null}
              </span>
            ))}
          </h1>

          {/* Badges strip */}
          <div className="flex flex-wrap gap-3 mt-4 pb-5" style={{ borderBottom: "1px solid rgba(138,206,0,0.08)" }}>
            {product.badge && (
              <span
                className="font-mono text-[7px] tracking-[0.35em] uppercase px-2.5 py-1 border"
                style={{
                  color: product.badge === "LIMITED" ? "var(--orange)" : "var(--green)",
                  borderColor: product.badge === "LIMITED" ? "rgba(255,140,0,0.3)" : "rgba(138,206,0,0.3)",
                  background: product.badge === "LIMITED" ? "rgba(255,140,0,0.04)" : "rgba(138,206,0,0.04)",
                }}
              >
                {product.badge} SS-2025
              </span>
            )}
            <span className="font-mono text-[8px] tracking-[0.2em] text-muted self-center">
              {product.sizes.filter((s) => s.stock !== "out").length} SIZES IN STOCK
            </span>
          </div>

          {/* Price row */}
          <div className="flex items-baseline gap-2.5 mt-8">
            <span className="font-display text-[52px] leading-none" style={{ color: "var(--green)" }}>
              {formatEUR(product.price).replace("€", "")}
            </span>
            <span className="font-display text-[18px]" style={{ color: "rgba(138,206,0,0.5)" }}>€</span>
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted ml-2">{product.gsm}</span>
          </div>

          {/* Spec */}
          <p className="text-paper/80 leading-[1.85] mt-6 max-w-[480px]">
            {product.spec}
          </p>

          {/* Size selection */}
          <div className="mt-10">
            <span className="font-mono text-[8px] tracking-[0.4em] uppercase text-muted block mb-3">
              SELECT SIZE
            </span>
            <div className="flex flex-wrap gap-1">
              {product.sizes.map((size) => (
                <button
                  key={size.label}
                  onClick={() => size.stock !== "out" && setSelectedSize(size.label)}
                  disabled={size.stock === "out"}
                  className="relative font-mono text-[7px] tracking-[0.2em] uppercase px-3.5 py-2 border transition-colors duration-200"
                  style={{
                    color:
                      selectedSize === size.label
                        ? "var(--ink)"
                        : size.stock === "out"
                          ? "var(--dim)"
                          : "var(--paper)",
                    backgroundColor: selectedSize === size.label ? "var(--green)" : "transparent",
                    borderColor:
                      selectedSize === size.label
                        ? "var(--green)"
                        : size.stock === "out"
                          ? "var(--dim)"
                          : "rgba(138,206,0,0.15)",
                    textDecoration: size.stock === "out" ? "line-through" : "none",
                    cursor: size.stock === "out" ? "not-allowed" : "none",
                  }}
                  data-cursor={size.stock === "out" ? "lock" : "h"}
                  data-cursor-label={size.stock === "out" ? "SOLD OUT" : undefined}
                >
                  {size.label}
                  {size.stock === "low" && (
                    <span className="absolute -top-1 -right-1 font-mono text-[7px] text-orange">
                      LOW
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Add to Cart */}
          <div className="flex flex-wrap gap-3 mt-10">
            {/* Quantity selector */}
            <div className="flex items-center border border-dim">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="font-mono text-[13px] text-muted hover:text-paper transition-colors duration-200"
                style={{ width: 44, height: 48, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", borderRight: "1px solid var(--dim)" }}
                data-cursor="h"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span
                className="font-mono text-[13px] text-paper"
                style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(10, q + 1))}
                className="font-mono text-[13px] text-muted hover:text-paper transition-colors duration-200"
                style={{ width: 44, height: 48, display: "flex", alignItems: "center", justifyContent: "center", background: "none", border: "none", borderLeft: "1px solid var(--dim)" }}
                data-cursor="h"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize}
              className="flex-1 font-display text-[18px] tracking-[0.06em] py-3 px-8 transition-colors duration-200"
              style={{
                backgroundColor: selectedSize ? "var(--green)" : "var(--dim)",
                color: selectedSize ? "var(--ink)" : "var(--muted)",
                cursor: selectedSize ? "none" : "not-allowed",
                border: "none",
              }}
              data-cursor={selectedSize ? "shop" : "lock"}
              data-cursor-label={selectedSize ? "ADD" : "SELECT SIZE"}
            >
              ADD TO CART — {formatEUR(product.price * qty)}
            </button>
          </div>

          {/* Signal network note */}
          <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted border border-dim px-4 py-3 text-center mt-3">
            SIGNAL NETWORK INCLUDED WITH ORDER
          </div>

          {/* Short spec */}
          <div className="mt-10 pt-8 border-t border-dim">
            <span className="eyebrow">TECH SPEC</span>
            <p className="text-paper/60 leading-[1.85] mt-3">{product.shortSpec}</p>
          </div>
        </div>
      </div>

      {/* ─── TOAST NOTIFICATION ─── */}
      <div
        className="fixed left-1/2 z-[700] transition-all duration-300"
        style={{
          bottom: 80,
          transform: `translateX(-50%) translateY(${toast ? "0" : "16px"})`,
          opacity: toast ? 1 : 0,
          pointerEvents: toast ? "auto" : "none",
          background: "rgba(8, 8, 8, 0.96)",
          border: "1px solid rgba(138, 206, 0, 0.28)",
          backdropFilter: "blur(12px)",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          whiteSpace: "nowrap",
        }}
      >
        <span
          className="inline-block w-1.5 h-1.5 rounded-full bg-green"
          style={{ animation: "blink 1s infinite" }}
        />
        <span className="font-mono text-[9px] tracking-[0.25em] text-paper uppercase">
          {qty > 1 ? `${qty}× ` : ""}{product.name} ({selectedSize}) ADDED TO CART
        </span>
      </div>
    </>
  );
}
