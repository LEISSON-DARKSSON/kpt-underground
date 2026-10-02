import { getProducts } from "@/lib/store/fourthwall";

import type { MetadataRoute } from "next";

const SITE = "https://keepitunderground.com";
export const revalidate = 3600;

/**
 * KPT-12: only canonical public URLs. Products come from the same public Fourthwall collection the
 * shop renders (Hidden/Private never appear there); filter/search URLs are not listed.
 * If Fourthwall is unreachable the static pages are still served.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = ["", "/shop", "/story", "/signal", "/help"].map((p) => ({ url: `${SITE}${p}` }));
  try {
    const products = await getProducts();
    return [...pages, ...products.map((p) => ({ url: `${SITE}/shop/${p.slug}` }))];
  } catch {
    return pages;
  }
}
