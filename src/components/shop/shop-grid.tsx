"use client";

import { useState, useMemo } from "react";
import { PRODUCTS, PRODUCT_LINES_DATA, getLineColor } from "@/lib/products";
import { ProductCard } from "@/components/shop/product-card";

const FILTER_TABS = [
  { slug: "all", name: "ALL" },
  ...PRODUCT_LINES_DATA.map((l) => ({ slug: l.slug, name: l.name })),
];

type SortMode = "default" | "price-asc" | "price-desc" | "name";

export function ShopGrid() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sort, setSort] = useState<SortMode>("default");

  const filtered = useMemo(() => {
    const base = activeFilter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.line === activeFilter);
    switch (sort) {
      case "price-asc":
        return [...base].sort((a, b) => a.price - b.price);
      case "price-desc":
        return [...base].sort((a, b) => b.price - a.price);
      case "name":
        return [...base].sort((a, b) => a.name.localeCompare(b.name));
      default:
        return base;
    }
  }, [activeFilter, sort]);

  return (
    <section>
      {/* ─── Meta Row: Count + Filters + Sort ─── */}
      <div className="wrap">
        <div
          className="flex flex-wrap items-center gap-4 py-5"
          style={{ borderTop: "1px solid rgba(138,206,0,0.08)" }}
        >
          <span className="font-mono text-[8px] tracking-[0.3em] uppercase text-muted">
            <strong className="text-paper">{filtered.length}</strong> {filtered.length === 1 ? "PIECE" : "PIECES"}
          </span>

          {/* Filter tabs */}
          <div className="flex gap-0.5 ml-auto">
            {FILTER_TABS.map((tab) => {
              const isActive = activeFilter === tab.slug;
              const tabColor = tab.slug !== "all" ? getLineColor(tab.slug) : undefined;
              return (
                <button
                  key={tab.slug}
                  onClick={() => setActiveFilter(tab.slug)}
                  className="font-mono text-[8px] tracking-[0.3em] uppercase px-3.5 py-1.5 border transition-colors duration-200"
                  style={{
                    color: isActive ? (tabColor ?? "var(--green)") : "var(--muted)",
                    backgroundColor: isActive ? `${tabColor ?? "var(--green)"}0a` : "transparent",
                    borderColor: isActive ? (tabColor ?? "var(--green)") : "rgba(112,128,144,0.15)",
                  }}
                  data-cursor="h"
                >
                  {tab.name}
                </button>
              );
            })}
          </div>

          {/* Sort selector */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortMode)}
            className="font-mono text-[8px] tracking-[0.3em] uppercase bg-transparent border px-3 py-1.5 appearance-none"
            style={{
              color: "var(--muted)",
              borderColor: "rgba(112,128,144,0.15)",
              cursor: "none",
            }}
            data-cursor="h"
          >
            <option value="default">SORT: DEFAULT</option>
            <option value="price-asc">PRICE: LOW → HIGH</option>
            <option value="price-desc">PRICE: HIGH → LOW</option>
            <option value="name">NAME: A → Z</option>
          </select>
        </div>
      </div>

      {/* ─── Product Grid (3-col, 2px gaps like prototype) ─── */}
      <div
        className="grid grid-cols-2 md:grid-cols-3"
        style={{ gap: 2 }}
      >
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
