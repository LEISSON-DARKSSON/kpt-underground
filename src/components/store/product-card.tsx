"use client";

import Link from "next/link";

import { formatPrice } from "@/lib/store/core";
import { categoryOf, displayName, itemType, keyAttribute } from "@/lib/store/merchandising";
import { track } from "@/lib/analytics";

import type { StoreProduct } from "@/lib/store/core";

/**
 * Catalog card (KPT-07): says what the object is (type + one decisive attribute), shows the whole
 * product (object-contain inside its own aspect ratio, no cropping), price/from-price and availability.
 */
export function ProductCard({ product, priority = false, list }: { product: StoreProduct; priority?: boolean; list?: string }) {
  const img = product.images[0];
  const href = `/shop/${product.slug}`;
  const multi = product.priceFromCents !== product.priceToCents;
  const type = itemType(product.id);
  const attr = keyAttribute(product);
  const category = categoryOf(product.id);
  const onSelect = () => track("select_item", { item_list_id: list, currency: "USD", items: [{ item_id: product.slug, item_name: product.name, price: product.priceFromCents / 100 }] });
  return (
    <article className="group flex flex-col border border-dim bg-ink-2 transition-colors duration-200 hover:border-green/40" data-product={product.slug} data-category={category?.key ?? "unclassified"}>
      <Link href={href} onClick={onSelect} data-cursor="shop" data-cursor-label="VIEW" tabIndex={-1} aria-hidden="true" className="relative block aspect-[4/5] overflow-hidden bg-ink-3 no-underline">
        {img && (
          // eslint-disable-next-line @next/next/no-img-element -- Fourthwall CDN image (already resized)
          <img
            src={img.url}
            alt=""
            width={img.width}
            height={img.height}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="absolute inset-0 h-full w-full object-contain motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-expo motion-safe:group-hover:scale-[1.02]"
          />
        )}
        {!product.available && (
          <span className="absolute right-3 top-3 border border-orange/60 bg-ink/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-orange">Sold out</span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 border-t border-dim p-5">
        {(type || attr) && (
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate" data-card-meta>
            {[type, attr].filter(Boolean).join(" · ")}
          </p>
        )}
        <h3 className="font-display text-[clamp(24px,2.4vw,32px)] leading-none text-paper">
          <Link href={href} onClick={onSelect} data-cursor="shop" data-cursor-label="VIEW" className="text-inherit no-underline hover:text-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green">
            {displayName(product.name)}
          </Link>
        </h3>
        <div className="mt-auto flex items-end justify-between gap-4">
          <span className="font-display text-2xl leading-none text-green" data-card-price>
            {multi ? "From " : ""}
            {formatPrice(product.priceFromCents)}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-slate">{product.available ? "Made to order" : "Sold out"}</span>
        </div>
      </div>
    </article>
  );
}
