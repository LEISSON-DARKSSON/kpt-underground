"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import type { ProductData } from "@/lib/products";
import { formatEUR, getLineColor } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { ProductBlueprint } from "@/components/shop/product-blueprint";

interface ProductCardProps {
  product: ProductData;
}

export function ProductCard({ product }: ProductCardProps) {
  const lineColor = getLineColor(product.line);
  const hasAvailable = product.sizes.some((s) => s.stock !== "out");
  const [hovered, setHovered] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleQuickAdd = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!selectedSize) return;
      addItem(product, selectedSize);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        setSelectedSize(null);
      }, 1500);
    },
    [selectedSize, product, addItem]
  );

  const handleSizeClick = useCallback(
    (e: React.MouseEvent, label: string) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedSize(label);
    },
    []
  );

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block bg-ink-2 overflow-hidden relative"
      data-cursor="shop"
      data-cursor-label="VIEW"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        if (!added) setSelectedSize(null);
      }}
    >
      {/* ─── Accent Strip (scaleX animation on hover) ─── */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] z-10 transition-transform duration-[400ms]"
        style={{
          backgroundColor: lineColor,
          transformOrigin: "left",
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
          transitionTimingFunction: "var(--ease)",
        }}
      />

      {/* ─── Visual Area ─── */}
      <div className="aspect-square bg-ink relative overflow-hidden">
        {/* SVG Blueprint drawing */}
        <div
          className="absolute inset-0 transition-all duration-[400ms]"
          style={{
            opacity: hovered ? 0.85 : 0.6,
            transform: hovered ? "scale(1.03)" : "scale(1)",
            transitionTimingFunction: "var(--ease)",
          }}
        >
          <ProductBlueprint productId={product.id} lineColor={lineColor} />
        </div>

        {/* Badge */}
        {product.badge && (
          <span
            className="absolute top-3.5 right-3.5 font-mono text-[7px] tracking-[0.35em] uppercase px-2.5 py-1 border z-10"
            style={{
              color: product.badge === "LIMITED" ? "var(--orange)" : lineColor,
              borderColor: product.badge === "LIMITED" ? "rgba(255,140,0,0.3)" : `${lineColor}50`,
              animation: product.badge === "LIMITED" ? "blink 2s step-end infinite" : undefined,
            }}
          >
            {product.badge}
          </span>
        )}

        {/* ─── Hover Overlay (quick add + sizes) ─── */}
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center transition-opacity duration-300"
          style={{
            background: "rgba(5, 5, 5, 0.72)",
            opacity: hovered ? 1 : 0,
            pointerEvents: hovered ? "auto" : "none",
          }}
        >
          {hasAvailable ? (
            <>
              {/* Size selector */}
              <div className="flex flex-wrap gap-1 justify-center mb-4 px-4">
                {product.sizes
                  .filter((s) => s.stock !== "out")
                  .map((size, i) => (
                    <button
                      key={size.label}
                      onClick={(e) => handleSizeClick(e, size.label)}
                      className="font-mono text-[7px] tracking-[0.2em] uppercase px-3 py-1.5 border transition-all duration-200"
                      style={{
                        color: selectedSize === size.label ? "var(--ink)" : "var(--paper)",
                        backgroundColor: selectedSize === size.label ? "var(--green)" : "transparent",
                        borderColor: selectedSize === size.label ? "var(--green)" : "rgba(138,206,0,0.15)",
                        transitionDelay: `${i * 30}ms`,
                        opacity: hovered ? 1 : 0,
                        transform: hovered ? "none" : "translateY(8px)",
                      }}
                      data-cursor="h"
                    >
                      {size.label}
                      {size.stock === "low" && (
                        <span className="text-orange ml-1">!</span>
                      )}
                    </button>
                  ))}
              </div>

              {/* Quick add button */}
              <button
                onClick={handleQuickAdd}
                className="font-display text-[18px] tracking-[0.06em] px-7 py-2.5 border transition-all duration-200"
                style={{
                  color: added ? "var(--ink)" : selectedSize ? "var(--ink)" : "var(--green)",
                  backgroundColor: added ? "var(--green)" : selectedSize ? "var(--green)" : "transparent",
                  borderColor: added ? "var(--green)" : "var(--green)",
                  opacity: hovered ? 1 : 0,
                  transform: hovered ? "none" : "translateY(8px)",
                  transitionDelay: "60ms",
                }}
                data-cursor="shop"
                data-cursor-label={added ? "ADDED" : "ADD"}
              >
                {added ? "✓ ADDED" : selectedSize ? `ADD — ${selectedSize}` : "SELECT SIZE"}
              </button>
            </>
          ) : (
            <span className="font-display text-[18px] tracking-[0.06em] text-orange/60">
              SOLD OUT
            </span>
          )}
        </div>
      </div>

      {/* ─── Info Section ─── */}
      <div className="px-[18px] py-4 pb-5">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-display tracking-[0.06em] leading-none transition-colors duration-200"
            style={{
              fontSize: "clamp(18px, 2vw, 24px)",
              color: hovered ? lineColor : "var(--paper)",
            }}
          >
            {product.name}
          </h3>
          <span
            className="font-display text-[22px] tracking-[0.04em] whitespace-nowrap"
            style={{ color: "var(--green)" }}
          >
            {formatEUR(product.price)}
          </span>
        </div>

        <span className="font-mono text-[8px] tracking-[0.35em] uppercase text-muted mt-1.5 block">
          {product.ref} // {product.gsm}
        </span>
      </div>
    </Link>
  );
}
