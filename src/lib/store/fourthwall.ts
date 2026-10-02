/**
 * Server-only Fourthwall Storefront access for the live shop.
 * Uses the public Storefront token (FOURTHWALL_STOREFRONT_TOKEN); never Platform API credentials.
 *
 * Error contract (KPT-03/04):
 * - `null` from getProduct = the product is genuinely not public (404 or not purchasable-shaped).
 * - StoreUnavailableError = Fourthwall could not be read (timeout, 5xx, 429, bad JSON, wrong shop).
 *   Callers must show a temporary-failure state, never "not found" or "empty shop".
 */
import { CURRENCY, SHOP_ID, UpstreamShapeError, checkoutUrl, normalizeProduct, parseCatalogPage, sortProducts } from "@/lib/store/core";

import type { CheckoutLine, StoreProduct } from "@/lib/store/core";

const DEFAULT_API = "https://storefront-api.fourthwall.com/v1/";
export const CATALOG_REVALIDATE_SECONDS = 60;
const TIMEOUT_MS = 12000;

export class StoreUnavailableError extends Error {
  readonly code: string;
  constructor(code: string) {
    super(code);
    this.name = "StoreUnavailableError";
    this.code = code;
  }
}

/** Fourthwall refused to create the cart for the submitted lines (a client-side cause, not an outage). */
export class CartRejectedError extends Error {
  constructor() {
    super("CART_REJECTED");
    this.name = "CartRejectedError";
  }
}

/**
 * The API base can be pointed at a local mock server for HTTP tests only. Anything other than a
 * loopback http URL is ignored, so a misconfigured env var can never send the token elsewhere.
 */
function apiBase(): string {
  const o = process.env.FOURTHWALL_STOREFRONT_API_BASE?.trim();
  return o && /^http:\/\/127\.0\.0\.1:\d{2,5}\/$/.test(o) ? o : DEFAULT_API;
}

function token(): string {
  const t = process.env.FOURTHWALL_STOREFRONT_TOKEN?.trim();
  if (!t || !/^ptkn_[A-Za-z0-9_-]{10,200}$/.test(t)) throw new StoreUnavailableError("STOREFRONT_NOT_CONFIGURED");
  return t;
}

type Init = RequestInit & { next?: { revalidate?: number; tags?: string[] } };

/** Structured server log without the token or the full URL. */
function logUpstream(path: string, code: string) {
  console.error(JSON.stringify({ event: "fourthwall_upstream_error", path: path.split("?")[0], code }));
}

async function api(path: string, init?: Init): Promise<unknown> {
  const url = new URL(path, apiBase());
  url.searchParams.set("storefront_token", token());
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { Accept: "application/json", ...(init?.body ? { "Content-Type": "application/json" } : {}) },
      redirect: "error",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (error) {
    const code = error instanceof Error && error.name === "TimeoutError" ? "UPSTREAM_TIMEOUT" : "UPSTREAM_NETWORK";
    logUpstream(path, code);
    throw new StoreUnavailableError(code);
  }
  if (res.status === 404) return null;
  if (!res.ok) {
    const code = `UPSTREAM_${res.status}`;
    logUpstream(path, code);
    if (init?.method === "POST" && res.status >= 400 && res.status < 500 && res.status !== 429) throw new CartRejectedError();
    throw new StoreUnavailableError(code);
  }
  try {
    return await res.json();
  } catch {
    logUpstream(path, "UPSTREAM_INVALID_JSON");
    throw new StoreUnavailableError("UPSTREAM_INVALID_JSON");
  }
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
 * A malformed page is an outage (StoreUnavailableError), never an empty shop.
 */
export async function getProducts(options: { fresh?: boolean } = {}): Promise<StoreProduct[]> {
  await assertShop();
  const found: StoreProduct[] = [];
  for (let page = 0; page < 10; page++) {
    const data = await api(
      `collections/all/products?page=${page}&size=50`,
      options.fresh ? { cache: "no-store" } : { next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["fw-catalog"] } },
    );
    if (data === null) throw new StoreUnavailableError("CATALOG_COLLECTION_MISSING");
    let parsed: ReturnType<typeof parseCatalogPage>;
    try {
      parsed = parseCatalogPage(data);
    } catch (error) {
      if (error instanceof UpstreamShapeError) {
        logUpstream("collections/all/products", error.code);
        throw new StoreUnavailableError(error.code);
      }
      throw error;
    }
    if (parsed.dropped > 0) logUpstream("collections/all/products", `DROPPED_${parsed.dropped}_MALFORMED_PRODUCTS`);
    found.push(...parsed.products);
    if (!parsed.hasNextPage) return sortProducts(found);
  }
  throw new StoreUnavailableError("PAGINATION_LIMIT");
}

/**
 * One public product by slug. `null` only when the product is genuinely not public/purchasable;
 * upstream trouble throws StoreUnavailableError so the page can show a temporary failure instead of 404.
 */
export async function getProduct(slug: string): Promise<StoreProduct | null> {
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return null;
  await assertShop();
  const raw = await api(`products/${slug}`, { next: { revalidate: CATALOG_REVALIDATE_SECONDS, tags: ["fw-catalog"] } });
  if (raw === null) return null;
  if (typeof raw !== "object" || Array.isArray(raw)) {
    logUpstream("products/:slug", "INVALID_PRODUCT_RESPONSE");
    throw new StoreUnavailableError("INVALID_PRODUCT_RESPONSE");
  }
  return normalizeProduct(raw);
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
