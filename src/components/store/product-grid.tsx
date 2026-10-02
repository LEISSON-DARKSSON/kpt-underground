import { Suspense } from "react";

import { CatalogView, ShopCatalog } from "@/components/store/shop-catalog";
import { ProductCard } from "@/components/store/product-card";
import { getProducts } from "@/lib/store/fourthwall";
import { studioPicks } from "@/lib/store/merchandising";

import type { StoreProduct } from "@/lib/store/core";

/**
 * Server component: live public catalog, or an honest unavailable / empty state (never invented stock).
 * Three distinct states (B03): Fourthwall unreachable, shop genuinely empty, and (client-side) a filter with no match.
 * `picks` renders the editorial Studio picks only (home page).
 */
export async function ProductGrid({ picks = false }: { picks?: boolean }) {
  let products: StoreProduct[] | null = null;
  try {
    products = await getProducts();
  } catch {
    products = null;
  }
  if (products === null) {
    return <p className="border border-dim p-8 font-mono text-sm text-slate" data-store-unavailable>The shop is temporarily unavailable. Please check back shortly.</p>;
  }
  if (products.length === 0) {
    return <p className="border border-dim p-8 font-mono text-sm text-slate" data-store-empty>New objects are on the way. Nothing is for sale right now.</p>;
  }
  if (picks) {
    const shown = studioPicks(products);
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-product-grid data-list="home-studio-picks">
        {(shown.length ? shown : products.slice(0, 6)).map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 3} list="home-studio-picks" />
        ))}
      </div>
    );
  }
  // Server HTML (and no-JS visitors) get the full catalog; the client view applies ?category/q/sort.
  return (
    <Suspense fallback={<CatalogView products={products} category={null} q="" sort="featured" />}>
      <ShopCatalog products={products} />
    </Suspense>
  );
}
