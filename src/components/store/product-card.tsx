import Link from "next/link";

import { formatPrice } from "@/lib/store/core";

import type { StoreProduct } from "@/lib/store/core";

/** Catalog card in the site's CRT system: ink surface, thin borders, Bebas name, mono meta. */
export function ProductCard({ product, priority = false }: { product: StoreProduct; priority?: boolean }) {
  const img = product.images[0];
  const href = `/shop/${product.slug}`;
  const multi = new Set(product.variants.map((v) => v.priceCents)).size > 1;
  return (
    <article className="group flex flex-col border border-dim bg-ink-2 transition-colors duration-200 hover:border-green/40" data-product={product.slug}>
      <Link href={href} data-cursor="shop" data-cursor-label="VIEW" className="relative block overflow-hidden bg-ink-3 no-underline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-green">
        {img && (
          // eslint-disable-next-line @next/next/no-img-element -- Fourthwall CDN image (already resized)
          <img
            src={img.url}
            alt={product.name}
            width={img.width}
            height={img.height}
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
            className="block aspect-[3/4] h-auto w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-expo motion-safe:group-hover:scale-[1.02]"
          />
        )}
        {!product.available && (
          <span className="absolute right-3 top-3 border border-orange/60 bg-ink/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-orange">Sold out</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 border-t border-dim p-5">
        <h3 className="font-display text-[clamp(24px,2.4vw,32px)] leading-none text-paper">
          <Link href={href} data-cursor="shop" data-cursor-label="VIEW" className="text-inherit no-underline hover:text-green">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-4">
          <span className="font-display text-2xl leading-none text-green">
            {multi ? "From " : ""}
            {formatPrice(product.priceFromCents)}
          </span>
          <Link href={href} data-cursor="shop" data-cursor-label="VIEW" className="border-b border-green/40 pb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-green no-underline hover:border-green">
            View ↗
          </Link>
        </div>
      </div>
    </article>
  );
}
