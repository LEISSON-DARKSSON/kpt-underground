import { formatPrice } from "@/lib/store/core";
import { getProducts } from "@/lib/store/fourthwall";
import { displayName, heroProduct, itemType, keyAttribute } from "@/lib/store/merchandising";

/**
 * The real object next to the hero offer (H02): a Studio-pick desk mat from the live public
 * catalog — its own Fourthwall image, name and price, never a stock or generated picture.
 * The Fourthwall render is 3:4 with transparent padding around a landscape mat; a 3:2 window
 * (`.hero-figure-frame`) shows the whole mat and trims only that empty canvas. This assumes the
 * listing's first image is that flat landscape render (true for both mats on 2026-10-02); if the
 * owner reorders the listing images the crop must be re-checked (tests/e2e + qa-home-h01h02).
 * The figure has no link: the hero keeps ONE call to action, the Shop button, and /shop lists the
 * desk mats first. If the catalog is unreachable or no desk mat qualifies, nothing is rendered.
 */
export async function HeroProduct() {
  let product = null;
  try {
    product = heroProduct(await getProducts());
  } catch {
    product = null;
  }
  if (!product) return null;

  const img = product.images[0];
  const multi = product.priceFromCents !== product.priceToCents;
  const meta = [itemType(product.id), keyAttribute(product)].filter(Boolean).join(" · ");

  return (
    <figure className="hero-figure" data-hero-product={product.slug}>
      <div className="hero-figure-frame">
        {/* eslint-disable-next-line @next/next/no-img-element -- Fourthwall CDN image (already resized) */}
        <img
          src={img.url}
          alt=""
          width={img.width}
          height={img.height}
          loading="eager"
          decoding="async"
          fetchPriority="high"
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="hero-figure-img"
        />
      </div>
      <figcaption className="hero-figure-caption">
        <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-slate">{meta}</span>
        <span className="mt-1 block font-display text-[24px] leading-none text-paper">
          {displayName(product.name)} <span className="text-green">{multi ? "From " : ""}{formatPrice(product.priceFromCents)}</span>
        </span>
        <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.16em] text-slate">Digital visualisation · made to order</span>
      </figcaption>
    </figure>
  );
}
