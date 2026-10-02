/**
 * Pure store logic (no Next/React imports) so node:test can cover it directly.
 * Source of truth for products, variants and prices is the Fourthwall Storefront API;
 * the browser never decides a price. Payment happens only on Fourthwall's hosted checkout.
 */

export const SHOP_ID = "sh_1f2e8f65-2b29-4be9-9167-7f42314361fb";
/** Hosted checkout lives on the Fourthwall domain, not on keepitunderground.com (that is this Next.js site). */
export const CHECKOUT_ORIGIN = "https://keepitunderground-shop.fourthwall.com";
export const CURRENCY = "USD" as const;
export const MAX_QTY = 10;
export const MAX_LINES = 20;

export interface StoreImage {
  url: string;
  width: number;
  height: number;
}

export interface StoreVariant {
  id: string;
  label: string;
  priceCents: number;
  currency: string;
  available: boolean;
  image: StoreImage | null;
}

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  descriptionHtml: string;
  images: StoreImage[];
  variants: StoreVariant[];
  available: boolean;
  priceFromCents: number;
}

type Json = Record<string, unknown>;
const isObj = (v: unknown): v is Json => v !== null && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" ? v : "");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function image(v: unknown): StoreImage | null {
  if (!isObj(v)) return null;
  const url = str(v.transformedUrl) || str(v.url);
  if (!/^https:\/\//.test(url)) return null;
  const width = Number(v.width) || 1536;
  const height = Number(v.height) || 2048;
  return { url, width, height };
}

const ALLOWED_TAGS = new Set(["p", "ul", "ol", "li", "strong", "b", "em", "i", "br"]);

/** Allow-list sanitizer for shop-authored descriptions: keeps simple text tags, drops every attribute. */
export function sanitizeDescription(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed|template)[\s\S]*?<\/\1>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<\/?([a-z0-9]+)\b[^>]*>/gi, (_m, tag: string) => {
      const t = tag.toLowerCase();
      if (!ALLOWED_TAGS.has(t)) return "";
      return _m.startsWith("</") ? `</${t}>` : t === "br" ? "<br>" : `<${t}>`;
    });
}

/** Normalize one Storefront product. Returns null for anything not publicly purchasable-shaped. */
export function normalizeProduct(raw: unknown): StoreProduct | null {
  if (!isObj(raw)) return null;
  const id = str(raw.id), slug = str(raw.slug), name = str(raw.name);
  if (!id || !/^[a-z0-9-]+$/.test(slug) || !name) return null;
  if (isObj(raw.access) && str(raw.access.type) && str(raw.access.type) !== "PUBLIC") return null;
  const productAvailable = !isObj(raw.state) || str(raw.state.type) === "AVAILABLE";
  const variants: StoreVariant[] = (Array.isArray(raw.variants) ? raw.variants : [])
    .filter(isObj)
    .map((v) => {
      const price = isObj(v.unitPrice) ? Number(v.unitPrice.value) : NaN;
      const attrs = isObj(v.attributes) ? v.attributes : {};
      const stockOut = isObj(v.stock) && str(v.stock.type) === "OUT_OF_STOCK";
      return {
        id: str(v.id),
        label: str(attrs.description) || str(v.name),
        priceCents: Math.round(price * 100),
        currency: isObj(v.unitPrice) ? str(v.unitPrice.currency) || CURRENCY : CURRENCY,
        available: productAvailable && !stockOut,
        image: Array.isArray(v.images) ? image(v.images[0]) : null,
      };
    })
    .filter((v) => UUID.test(v.id) && Number.isFinite(v.priceCents) && v.priceCents > 0);
  if (variants.length === 0) return null;
  const images = (Array.isArray(raw.images) ? raw.images : []).map(image).filter((i): i is StoreImage => i !== null);
  return {
    id, slug, name,
    descriptionHtml: sanitizeDescription(str(raw.description)),
    images,
    variants,
    available: variants.some((v) => v.available),
    priceFromCents: Math.min(...variants.map((v) => v.priceCents)),
  };
}

/** Desk mats lead the catalog; everything else keeps the shop's order. */
export function sortProducts(products: StoreProduct[]): StoreProduct[] {
  const rank = (p: StoreProduct) => (/-desk-mat$/.test(p.slug) ? 0 : 1);
  return products.map((p, i) => ({ p, i })).sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i).map((x) => x.p);
}

export interface CheckoutLine {
  variantId: string;
  quantity: number;
}

/**
 * Server-side gate for checkout input: only variants of currently public, available products,
 * integer quantities 1..MAX_QTY, merged duplicates. Prices are NOT accepted from the client.
 */
export function validateCheckoutLines(input: unknown, catalog: StoreProduct[]): CheckoutLine[] {
  if (!isObj(input) || !Array.isArray(input.items)) throw new Error("INVALID_BODY");
  if (input.items.length === 0 || input.items.length > MAX_LINES) throw new Error("INVALID_ITEM_COUNT");
  const allowed = new Map<string, boolean>();
  for (const p of catalog) for (const v of p.variants) allowed.set(v.id, v.available);
  const merged = new Map<string, number>();
  for (const item of input.items) {
    if (!isObj(item)) throw new Error("INVALID_ITEM");
    const variantId = str(item.variantId);
    const quantity = Number(item.quantity);
    if (!UUID.test(variantId) || !allowed.has(variantId)) throw new Error("UNKNOWN_VARIANT");
    if (!allowed.get(variantId)) throw new Error("VARIANT_UNAVAILABLE");
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QTY) throw new Error("INVALID_QUANTITY");
    merged.set(variantId, Math.min(MAX_QTY, (merged.get(variantId) ?? 0) + quantity));
  }
  return [...merged].map(([variantId, quantity]) => ({ variantId, quantity }));
}

/** Catalog-staleness errors: the cached catalog may lag a product that was just published or restocked. */
const STALE_CATALOG_ERRORS = new Set(["UNKNOWN_VARIANT", "VARIANT_UNAVAILABLE"]);

/**
 * Validates against the cached catalog first; only if the cache does not know a variant (or still thinks it
 * is unavailable) re-reads the catalog fresh, exactly once. Client errors never cause an upstream read.
 */
export async function validateAgainstCatalog(
  input: unknown,
  loadCached: () => Promise<StoreProduct[]>,
  loadFresh: () => Promise<StoreProduct[]>,
): Promise<CheckoutLine[]> {
  try {
    return validateCheckoutLines(input, await loadCached());
  } catch (error) {
    if (!(error instanceof Error) || !STALE_CATALOG_ERRORS.has(error.message)) throw error;
    return validateCheckoutLines(input, await loadFresh());
  }
}

export function checkoutUrl(cartId: string): string {
  if (!/^[A-Za-z0-9_-]{6,80}$/.test(cartId)) throw new Error("INVALID_CART_ID");
  const u = new URL("/checkout/", CHECKOUT_ORIGIN);
  u.searchParams.set("cartCurrency", CURRENCY);
  u.searchParams.set("cartId", cartId);
  return u.toString();
}

export function formatPrice(cents: number, currency: string = CURRENCY): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}
