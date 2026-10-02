import { ProductCard } from "@/components/store/product-card";
import { getProducts } from "@/lib/store/fourthwall";

import type { StoreProduct } from "@/lib/store/core";

/** Server component: live public catalog, or an honest empty/unavailable state (never invented stock). */
export async function ProductGrid({ limit }: { limit?: number }) {
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
  const shown = limit ? products.slice(0, limit) : products;
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-product-grid>
      {shown.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < 3} />
      ))}
    </div>
  );
}
