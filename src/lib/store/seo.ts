/**
 * Structured data from the same normalized public product the page renders (KPT-12).
 * No reviews, ratings or GTINs are invented. Several prices → AggregateOffer (low/high), never one
 * price for every size.
 */
import type { StoreProduct } from "./core.ts";

const money = (cents: number) => (cents / 100).toFixed(2);

export function productJsonLdObject(product: StoreProduct, site: string) {
  const url = `${site}/shop/${product.slug}`;
  const sellable = product.variants.filter((v) => v.available);
  const availability = sellable.length ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const offers =
    product.priceFromCents === product.priceToCents
      ? { "@type": "Offer", url, priceCurrency: "USD", price: money(product.priceFromCents), availability }
      : { "@type": "AggregateOffer", url, priceCurrency: "USD", lowPrice: money(product.priceFromCents), highPrice: money(product.priceToCents), offerCount: sellable.length || product.variants.length, availability };
  const description = product.descriptionHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url,
    sku: product.variants.length === 1 ? product.variants[0].id : undefined,
    productID: product.id,
    image: product.images.slice(0, 5).map((i) => i.url),
    ...(description ? { description } : {}),
    brand: { "@type": "Brand", name: "KEEP IT UNDERGROUND" },
    offers,
  };
}

/** JSON for a <script type="application/ld+json">, with `<` escaped so it can never close the tag. */
export function productJsonLd(product: StoreProduct, site: string): string {
  return JSON.stringify(productJsonLdObject(product, site)).replace(/</g, "\\u003c");
}
