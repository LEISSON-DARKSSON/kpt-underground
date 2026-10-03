import Image from "next/image";

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
 * R2: the picture is served by the Next image optimizer so the browser picks a size from a real
 * srcset instead of always downloading the 1920 px original. The signed Fourthwall URL is passed
 * through untouched (next.config.ts allows only imgproxy.fourthwall.dev).
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
        <Image
          src={img.url}
          alt=""
          fill
          preload
          fetchPriority="high"
          quality={75}
          sizes="(min-width: 1200px) 480px, (min-width: 768px) 40vw, calc(100vw - 48px)"
          className="hero-figure-img"
        />
      </div>
      <figcaption className="hero-figure-caption">
        <span className="block font-mono text-[11px] uppercase tracking-[0.18em] text-slate">{meta}</span>
        <span className="mt-1 block font-display text-[24px] leading-none text-paper">
          {displayName(product.name)} <span className="text-green">{multi ? "From " : ""}{formatPrice(product.priceFromCents)}</span>
        </span>
        <span className="mt-1 block font-mono text-[11px] uppercase tracking-[0.16em] text-slate">Digital visualisation · made to order</span>
      </figcaption>
    </figure>
  );
}
