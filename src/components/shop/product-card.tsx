import Link from "next/link";
import type { ProductData } from "@/lib/products";
import { formatEUR, getLineColor } from "@/lib/products";

interface ProductCardProps {
  product: ProductData;
}

export function ProductCard({ product }: ProductCardProps) {
  const lineColor = getLineColor(product.line);
  const hasAvailable = product.sizes.some((s) => s.stock !== "out");

  return (
    <Link
      href={`/shop/${product.slug}`}
      className="group block border border-dim hover:border-green/30 transition-colors duration-200"
      data-cursor="shop"
      data-cursor-label="VIEW"
    >
      {/* Blueprint placeholder */}
      <div className="aspect-[3/4] bg-ink-2 relative overflow-hidden">
        {/* Diagonal grid pattern as placeholder for product image */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(45deg, ${lineColor}22 1px, transparent 1px), linear-gradient(-45deg, ${lineColor}22 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Center product ref */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[clamp(1.5rem,4vw,2.5rem)] text-paper/10">
            {product.ref}
          </span>
        </div>

        {/* Badge */}
        {product.badge && (
          <span
            className="absolute top-3 left-3 font-mono text-[9px] tracking-[0.14em] uppercase px-2 py-1 border"
            style={{
              color: product.badge === "LIMITED" ? "var(--orange)" : lineColor,
              borderColor: product.badge === "LIMITED" ? "rgba(255,140,0,0.3)" : `${lineColor}50`,
            }}
          >
            {product.badge}
          </span>
        )}

        {/* Color accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ backgroundColor: lineColor }}
        />
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-mono text-[12px] font-bold text-paper group-hover:text-green transition-colors duration-200 leading-tight">
              {product.name}
            </h3>
            <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted mt-1 block">
              {product.ref} // {product.gsm}
            </span>
          </div>
          <span className="font-display text-lg text-paper whitespace-nowrap">
            {formatEUR(product.price)}
          </span>
        </div>

        {/* Size pills */}
        <div className="flex flex-wrap gap-1 mt-3">
          {product.sizes.map((size) => (
            <span
              key={size.label}
              className="font-mono text-[8px] tracking-[0.1em] uppercase px-2 py-0.5 border"
              style={{
                color: size.stock === "out" ? "var(--dim)" : size.stock === "low" ? "var(--orange)" : "var(--muted)",
                borderColor: size.stock === "out" ? "var(--dim)" : "var(--dim)",
                textDecoration: size.stock === "out" ? "line-through" : "none",
              }}
            >
              {size.label}
            </span>
          ))}
        </div>

        {!hasAvailable && (
          <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-orange mt-2 block">
            SOLD OUT
          </span>
        )}
      </div>
    </Link>
  );
}
