"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ProductCard } from "@/components/store/product-card";
import { CATEGORIES, filterByCategory, isCategory, isSort, searchProducts, sortForShop, studioPicks } from "@/lib/store/merchandising";
import { trackOnce } from "@/lib/analytics";

import type { StoreProduct } from "@/lib/store/core";
import type { CategoryKey, SortKey } from "@/lib/store/merchandising";

/** Reads ?category / ?q / ?sort. Invalid values fall back safely to "All / featured" (B02). */
export function ShopCatalog({ products }: { products: StoreProduct[] }) {
  const params = useSearchParams();
  const c = params.get("category");
  const s = params.get("sort");
  const q = (params.get("q") ?? "").slice(0, 60);
  return <CatalogView products={products} category={isCategory(c) ? c : null} q={q} sort={isSort(s) ? s : "featured"} interactive />;
}

function href(pathname: string, next: { category: CategoryKey | null; q: string; sort: SortKey }) {
  const u = new URLSearchParams();
  if (next.category) u.set("category", next.category);
  if (next.q.trim()) u.set("q", next.q.trim());
  if (next.sort !== "featured") u.set("sort", next.sort);
  const qs = u.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}

const chip = (active: boolean) =>
  `inline-flex min-h-11 shrink-0 items-center border px-4 font-mono text-[11px] uppercase tracking-[0.16em] no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green ${
    active ? "border-green bg-green text-ink" : "border-dim text-paper hover:border-slate"
  }`;

export function CatalogView({ products, category, q, sort, interactive = false }: { products: StoreProduct[]; category: CategoryKey | null; q: string; sort: SortKey; interactive?: boolean }) {
  const router = useRouter();
  const pathname = usePathname() || "/shop";

  const shown = useMemo(() => sortForShop(searchProducts(filterByCategory(products, category), q), sort), [products, category, q, sort]);
  const picks = useMemo(() => (category || q || sort !== "featured" ? [] : studioPicks(products)), [products, category, q, sort]);
  const counts = useMemo(() => Object.fromEntries(CATEGORIES.map((x) => [x.key, filterByCategory(products, x.key).length])), [products]);
  const listId = `shop:${category ?? "all"}:${sort}:${q}`; // dedupe key only: it contains the search text
  // What analytics may see: never the visitor's free-text search, only that a search was used.
  const listParam = `shop:${category ?? "all"}:${sort}${q ? ":search" : ""}`;

  useEffect(() => {
    if (!interactive) return;
    trackOnce(listId, "view_item_list", { item_list_id: listParam, currency: "USD", items: shown.map((p, i) => ({ item_id: p.slug, item_name: p.name, index: i, price: p.priceFromCents / 100 })) });
  }, [interactive, listId, listParam, shown]);

  const go = (next: Partial<{ category: CategoryKey | null; q: string; sort: SortKey }>) =>
    router.push(href(pathname, { category, q, sort, ...next }), { scroll: false });

  return (
    <div data-catalog data-category={category ?? "all"}>
      <nav aria-label="Shop categories" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        <Link href={href(pathname, { category: null, q, sort })} scroll={false} aria-current={category === null ? "page" : undefined} data-cursor="h" data-category-link="all" className={chip(category === null)}>
          All <span className="ml-2 opacity-70">{products.length}</span>
        </Link>
        {CATEGORIES.map((x) => (
          <Link key={x.key} href={href(pathname, { category: x.key, q, sort })} scroll={false} aria-current={category === x.key ? "page" : undefined} data-cursor="h" data-category-link={x.key} className={chip(category === x.key)}>
            {x.label} <span className="ml-2 opacity-70">{counts[x.key]}</span>
          </Link>
        ))}
      </nav>

      <div className="mt-6 flex flex-col gap-3 border-y border-dim py-4 sm:flex-row sm:items-center sm:justify-between">
        <form
          role="search"
          className="flex min-w-0 flex-1 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            go({ q: String(new FormData(e.currentTarget).get("q") ?? "").slice(0, 60) });
          }}
        >
          <label htmlFor="shop-q" className="sr-only">Search the shop</label>
          <input
            id="shop-q"
            name="q"
            type="search"
            key={q}
            defaultValue={q}
            maxLength={60}
            onChange={(e) => {
              if (e.target.value === "" && q) go({ q: "" });
            }}
            placeholder="Search: mat, tee, mug…"
            className="h-11 w-full min-w-0 border border-dim bg-ink-2 px-3 font-mono text-sm text-paper placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green sm:max-w-xs"
          />
          <button type="submit" data-cursor="h" className="h-11 shrink-0 border border-dim px-4 font-mono text-[11px] uppercase tracking-[0.16em] text-paper hover:border-green focus-visible:outline-2 focus-visible:outline-green">Search</button>
        </form>
        <div className="flex items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.16em] text-slate">
          <span aria-live="polite" data-result-count>{shown.length} {shown.length === 1 ? "item" : "items"}</span>
          <label className="flex items-center gap-2">
            <span>Sort</span>
            <select value={sort} onChange={(e) => go({ sort: e.target.value as SortKey })} data-cursor="h" className="h-11 border border-dim bg-ink-2 px-2 font-mono text-[11px] uppercase text-paper focus-visible:outline-2 focus-visible:outline-green">
              <option value="featured">Shop order</option>
              <option value="price-asc">Price: low → high</option>
              <option value="price-desc">Price: high → low</option>
            </select>
          </label>
        </div>
      </div>

      {picks.length > 0 && (
        <section aria-labelledby="studio-picks" className="mt-10" data-studio-picks>
          <h2 id="studio-picks" className="eyebrow">Studio picks</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-list="studio-picks">
            {picks.map((p, i) => (
              <ProductCard key={p.id} product={p} priority={i < 3} list="studio-picks" />
            ))}
          </div>
          <h2 className="eyebrow mt-16">All objects</h2>
        </section>
      )}

      {shown.length === 0 ? (
        <div className="mt-10 border border-dim p-8 font-mono text-sm text-slate" data-filter-empty>
          <p>Nothing matches {q ? `“${q}”` : "this filter"}.</p>
          <Link href={pathname} scroll={false} data-cursor="h" className="mt-4 inline-block text-green underline underline-offset-4">Reset filters</Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-product-grid>
          {shown.map((p, i) => (
            <ProductCard key={p.id} product={p} priority={picks.length === 0 && i < 3} list={listParam} />
          ))}
        </div>
      )}
      {(category || q || sort !== "featured") && shown.length > 0 && (
        <Link href={pathname} scroll={false} data-cursor="h" data-reset className="mt-8 inline-block font-mono text-[11px] uppercase tracking-[0.2em] text-green underline underline-offset-4">
          Reset filters
        </Link>
      )}
    </div>
  );
}
