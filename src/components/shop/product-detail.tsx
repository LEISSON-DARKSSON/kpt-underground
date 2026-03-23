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
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const lineColor = getLineColor(product.line);
  const lineName = PRODUCT_LINES_DATA.find((l) => l.slug === product.line)?.name ?? product.line.toUpperCase();

  const handleAddToCart = useCallback(() => {
    if (!selectedSize) return;
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }, [selectedSize, product, addItem]);

  return (
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
      {/* ─── LEFT: Blueprint ─── */}
      <div className="aspect-[3/4] bg-ink-2 relative overflow-hidden border border-dim">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-15"
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
            <div
              className="w-3 h-3 rounded-full border"
              style={{ borderColor: `${lineColor}60` }}
            />
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

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]" style={{ backgroundColor: lineColor }} />

        {/* Bottom meta */}
        <div className="absolute bottom-4 left-4 right-4 flex justify-between">
          <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted">
            {product.ref} // {product.name} // REV B
          </span>
        </div>
      </div>

      {/* ─── RIGHT: Info ─── */}
      <div>
        {/* Breadcrumb */}
        <nav className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted mb-6">
          <Link href="/shop" className="hover:text-green transition-colors" data-cursor="h">
            COLLECTION
          </Link>
          {" // "}
          <span style={{ color: lineColor }}>{lineName}</span>
          {" // "}
          <span className="text-paper">{product.ref}</span>
        </nav>

        {/* Title */}
        <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] text-paper">
          {product.name.split(" ").map((word, i) => (
            <span key={i}>
              {word}
              {i < product.name.split(" ").length - 1 ? <br /> : null}
            </span>
          ))}
        </h1>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {product.badge && (
            <span
              className="font-mono text-[9px] tracking-[0.14em] uppercase px-3 py-1 border"
              style={{
                color: product.badge === "LIMITED" ? "var(--orange)" : "var(--green)",
                borderColor: product.badge === "LIMITED" ? "rgba(255,140,0,0.3)" : "rgba(138,206,0,0.3)",
              }}
            >
              {product.badge} SS-2025
            </span>
          )}
        </div>

        {/* Price + GSM */}
        <div className="flex items-baseline gap-4 mt-8">
          <span className="font-display text-4xl text-paper">{formatEUR(product.price)}</span>
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted">{product.gsm}</span>
        </div>

        {/* Spec */}
        <p className="text-paper/80 leading-relaxed mt-6 max-w-[480px]">
          {product.spec}
        </p>

        {/* Size selection */}
        <div className="mt-10">
          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted block mb-3">
            SELECT SIZE
          </span>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size.label}
                onClick={() => size.stock !== "out" && setSelectedSize(size.label)}
                disabled={size.stock === "out"}
                className="relative font-mono text-[11px] tracking-[0.1em] uppercase px-5 py-3 border transition-colors duration-200"
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
                        : "var(--dim)",
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

        {/* CTA */}
        <div className="mt-10 space-y-3">
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className="w-full font-mono text-[12px] tracking-[0.14em] uppercase py-4 transition-colors duration-200"
            style={{
              backgroundColor: added ? "var(--green)" : selectedSize ? "var(--green)" : "var(--dim)",
              color: added ? "var(--ink)" : selectedSize ? "var(--ink)" : "var(--muted)",
              cursor: selectedSize ? "none" : "not-allowed",
            }}
            data-cursor={selectedSize ? "shop" : "lock"}
            data-cursor-label={added ? "ADDED" : "ADD"}
          >
            {added ? "\u2713 ADDED" : `ADD TO CART — ${formatEUR(product.price)}`}
          </button>

          <div className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted border border-dim px-4 py-3 text-center">
            SIGNAL NETWORK INCLUDED WITH ORDER
          </div>
        </div>

        {/* Short spec */}
        <div className="mt-10 pt-8 border-t border-dim">
          <span className="eyebrow">TECH SPEC</span>
          <p className="text-paper/60 leading-relaxed mt-3">{product.shortSpec}</p>
        </div>
      </div>
    </div>
  );
}
