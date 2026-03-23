"use client";

import { useState, useMemo } from "react";
import { PRODUCTS, PRODUCT_LINES_DATA } from "@/lib/products";
import { ProductCard } from "@/components/shop/product-card";

const FILTER_TABS = [
  { slug: "all", name: "ALL" },
  ...PRODUCT_LINES_DATA.map((l) => ({ slug: l.slug, name: l.name })),
];

export function ShopGrid() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered = useMemo(
    () => activeFilter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.line === activeFilter),
    [activeFilter]
  );

  return (
    <section className="py-16">
      <div className="wrap">
        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-12">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.slug}
              onClick={() => setActiveFilter(tab.slug)}
              className="font-mono text-[10px] tracking-[0.14em] uppercase px-4 py-2 border transition-colors duration-200"
              style={{
                color: activeFilter === tab.slug ? "var(--ink)" : "var(--muted)",
                backgroundColor: activeFilter === tab.slug ? "var(--green)" : "transparent",
                borderColor: activeFilter === tab.slug ? "var(--green)" : "var(--dim)",
              }}
              data-cursor="h"
            >
              {tab.name}
            </button>
          ))}

          <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted self-center ml-auto">
            {filtered.length} {filtered.length === 1 ? "PIECE" : "PIECES"}
          </span>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
