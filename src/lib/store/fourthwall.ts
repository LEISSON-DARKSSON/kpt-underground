/**
 * Server-only Fourthwall Storefront access for the live shop.
 * Uses the public Storefront token (FOURTHWALL_STOREFRONT_TOKEN); never Platform API credentials.
 */
import { CURRENCY, SHOP_ID, checkoutUrl, normalizeProduct, sortProducts } from "@/lib/store/core";

import type { CheckoutLine, StoreProduct } from "@/lib/store/core";

const API = "https://storefront-api.fourthwall.com/v1/";
export const CATALOG_REVALIDATE_SECONDS = 60;

export class StoreUnavailableError extends Error {
  constructor(readonly code: string) {
    super(code);
    this.name = "StoreUnavailableError";
  }
}

function token(): string {
  const t = process.env.FOURTHWALL_STOREFRONT_TOKEN?.trim();
  if (!t || !/^ptkn_[A-Za-z0-9_-]{10,200}$/.test(t)) throw new StoreUnavailableError("STOREFRONT_NOT_CONFIGURED");
  return t;
}

async function api(path: string, init?: RequestInit & { next?: { revalidate?: number; tags?: string[] } }): Promise<unknown> {
  const url = new URL(API + path);
  url.searchParams.set("storefront_token", token());
  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}) },
    redirect: "error",
    signal: AbortSignal.timeout(12000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new StoreUnavailableError(`UPSTREAM_${res.status}`);
  return res.json();
}

let shopVerified = false;
async function assertShop(): Promise<void> {
  if (shopVerified) return;
  const shop = await api("shop", { next: { revalidate: 3600, tags: ["fw-shop"] } });
  if (!shop || typeof shop !== "object" || (shop as { id?: unknown }).id !== SHOP_ID) {
    throw new StoreUnavailableError("SHOP_ID_MISMATCH"); // never sell from a different shop by token mistake
  }
  shopVerified = true;
}

/**
 * Public catalog ("all" collection only contains PUBLIC products).
 * `fresh: true` bypasses the 60 s data cache (used once by checkout when the cache lags a new product).
 */
export async function getProducts(options: { fresh?: boolean } = {}): Promise<StoreProduct[]> {
  await assertShop();
  const found: StoreProduct[] = [];
  for (let page = 0; page < 10; page++) {
    const data = (await api(
      `collections/all/products?page=${page}&size=50`,
      options.fresh ? { cache: "no-store" } : { next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["fw-catalog"] } },
    )) as { results?: unknown[]; paging?: { hasNextPage?: boolean } } | null;
    for (const raw of data?.results ?? []) {
      const p = normalizeProduct(raw);
      if (p) found.push(p);
    }
    if (!data?.paging?.hasNextPage) return sortProducts(found);
  }
  throw new StoreUnavailableError("PAGINATION_LIMIT");
}

/** One public product by slug, or null (hidden/private/unknown products are never rendered). */
export async function getProduct(slug: string): Promise<StoreProduct | null> {
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return null;
  await assertShop();
  const raw = await api(`products/${slug}`, { next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["fw-catalog"] } });
  return raw ? normalizeProduct(raw) : null;
}

/** Creates a Fourthwall cart from already-validated lines and returns the hosted checkout URL. */
export async function createHostedCheckout(lines: CheckoutLine[]): Promise<string> {
  await assertShop();
  const cart = (await api(`carts?currency=${CURRENCY}`, {
    method: "POST",
    body: JSON.stringify({ items: lines }),
    cache: "no-store",
  })) as { id?: unknown } | null;
  if (!cart || typeof cart.id !== "string") throw new StoreUnavailableError("CART_NOT_CREATED");
  return checkoutUrl(cart.id);
}
