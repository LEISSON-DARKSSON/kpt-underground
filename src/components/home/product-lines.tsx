"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { PRODUCTS, getLineColor, PRODUCT_LINES_DATA } from "@/lib/products";
import { ProductCard } from "@/components/shop/product-card";

/* Pick featured products — 1 large left, 2 stacked right, 1 wide bottom */
const FEATURED = [
  PRODUCTS[0],  // Ravewear lead
  PRODUCTS[3],  // Festivalwear
  PRODUCTS[6],  // Everyday
  PRODUCTS[9],  // Accessories
  PRODUCTS[1],  // Second ravewear
].filter(Boolean);

export function ProductLines() {
  return (
    <div>
      {/* ─── Product Line Labels ─── */}
      <div className="flex flex-col" style={{ gap: "1px", marginBottom: 48 }}>
        {PRODUCT_LINES_DATA.map((line, i) => (
          <ScrollReveal key={line.slug} delay={(i + 1) as 1 | 2 | 3 | 4}>
            <Link
              href={`/shop`}
              data-cursor="shop"
              data-cursor-label={line.name}
              className="group"
              style={{
                display: "grid",
                gridTemplateColumns: "120px 1fr auto",
                alignItems: "center",
                gap: 32,
                padding: "28px 0",
                borderBottom: "1px solid rgba(138, 206, 0, 0.06)",
                textDecoration: "none",
                cursor: "none",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 32,
                  letterSpacing: "0.08em",
                  color: line.color,
                }}
              >
                {line.name}
              </span>
              <span style={{ fontSize: 12, color: "var(--muted)", letterSpacing: "0.02em" }}>
                {line.description}
              </span>
              <span
                style={{
                  fontSize: 9,
                  letterSpacing: "0.4em",
                  color: "var(--dim)",
                  textTransform: "uppercase",
                  transition: "color var(--mid)",
                }}
              >
                EXPLORE &#x2192;
              </span>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      {/* ─── Collection Preview Grid ─── */}
      <ScrollReveal>
        <div
          className="grid grid-cols-2 md:grid-cols-3"
          style={{
            gap: 2,
            gridTemplateRows: "auto auto",
          }}
        >
          {/* Large card spans 2 rows on desktop */}
          {FEATURED[0] && (
            <div className="row-span-1 md:row-span-2">
              <ProductCard product={FEATURED[0]} />
            </div>
          )}
          {/* Two stacked on right */}
          {FEATURED[1] && <ProductCard product={FEATURED[1]} />}
          {FEATURED[2] && <ProductCard product={FEATURED[2]} />}
        </div>
      </ScrollReveal>

      {/* Wide CTA row */}
      <ScrollReveal delay={1}>
        <Link
          href="/shop"
          className="block text-center py-5 mt-0.5 no-underline transition-colors duration-200 hover:bg-green/5"
          style={{
            background: "var(--ink2)",
            borderBottom: "1px solid rgba(138,206,0,0.06)",
          }}
          data-cursor="shop"
          data-cursor-label="SHOP"
        >
          <span className="font-mono text-[9px] tracking-[0.4em] uppercase text-muted hover:text-green transition-colors">
            VIEW ALL {PRODUCTS.length} PIECES &rarr;
          </span>
        </Link>
      </ScrollReveal>
    </div>
  );
}
