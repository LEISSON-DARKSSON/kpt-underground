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
  /** Fourthwall image id (used to link variants to their own images); "" when the API gave none. */
  id: string;
  url: string;
  width: number;
  height: number;
}

export interface StoreVariant {
  id: string;
  label: string;
  /** The fit-relevant option (apparel size, phone model, mat size …) as Fourthwall names it. */
  size: string;
  color: string;
  priceCents: number;
  currency: string;
  available: boolean;
  image: StoreImage | null;
  /** Ids of the product images Fourthwall attaches to this variant. */
  imageIds: string[];
}

/** Supplier/shop-authored sections from Fourthwall `additionalInformation` (sanitized HTML). */
export interface StoreSection {
  type: "MORE_DETAILS" | "SIZE_AND_FIT" | "GUARANTEE_AND_RETURNS" | "OTHER";
  title: string;
  html: string;
}

export interface StoreProduct {
  id: string;
  slug: string;
  name: string;
  descriptionHtml: string;
  images: StoreImage[];
  variants: StoreVariant[];
  sections: StoreSection[];
  available: boolean;
  priceFromCents: number;
  priceToCents: number;
}

type Json = Record<string, unknown>;
const isObj = (v: unknown): v is Json => v !== null && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" ? v : "");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Thrown when Fourthwall answers with something that is not a valid catalog: never shown as "empty" or "not found". */
export class UpstreamShapeError extends Error {
  readonly code: string;
  constructor(code: string) {
    super(code);
    this.name = "UpstreamShapeError";
    this.code = code;
  }
}

function image(v: unknown): StoreImage | null {
  if (!isObj(v)) return null;
  const url = str(v.transformedUrl) || str(v.url);
  if (!/^https:\/\//.test(url)) return null;
  const width = Number(v.width) || 1536;
  const height = Number(v.height) || 2048;
  return { id: str(v.id), url, width, height };
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

const SECTION_TYPES = new Set(["MORE_DETAILS", "SIZE_AND_FIT", "GUARANTEE_AND_RETURNS"]);

function sections(v: unknown): StoreSection[] {
  if (!Array.isArray(v)) return [];
  return v.filter(isObj).flatMap((s) => {
    const html = sanitizeDescription(str(s.bodyHtml)).replace(/<(ul|ol)>\s*<\/\1>/g, "").trim();
    const title = str(s.title).trim();
    if (!html || !title) return [];
    const type = SECTION_TYPES.has(str(s.type)) ? (str(s.type) as StoreSection["type"]) : "OTHER";
    return [{ type, title, html }];
  });
}

/**
 * Stock is fail-closed: only shapes we know mean "can be sold" count as available.
 * UNLIMITED (print on demand) and LIMITED with stock left are sellable; anything else is not.
 */
function inStock(stock: unknown): boolean {
  if (!isObj(stock)) return true; // Fourthwall omits stock for unlimited POD variants in some responses
  const t = str(stock.type);
  if (t === "UNLIMITED") return true;
  if (t === "LIMITED") return !("inStock" in stock) || Number(stock.inStock) > 0;
  return false;
}

/** Normalize one Storefront product. Returns null for anything not publicly purchasable-shaped. */
export function normalizeProduct(raw: unknown): StoreProduct | null {
  if (!isObj(raw)) return null;
  const id = str(raw.id), slug = str(raw.slug), name = str(raw.name);
  if (!id || !/^[a-z0-9-]+$/.test(slug) || !name) return null;
  // Visibility is fail-closed: a product must say PUBLIC (or say nothing, as the public collection does).
  if (isObj(raw.access) && str(raw.access.type) !== "PUBLIC") return null;
  const productAvailable = !isObj(raw.state) || str(raw.state.type) === "AVAILABLE";
  const variants: StoreVariant[] = (Array.isArray(raw.variants) ? raw.variants : [])
    .filter(isObj)
    .map((v) => {
      const price = isObj(v.unitPrice) ? Number(v.unitPrice.value) : NaN;
      const attrs = isObj(v.attributes) ? v.attributes : {};
      const images = Array.isArray(v.images) ? v.images : [];
      return {
        id: str(v.id),
        label: str(attrs.description) || str(v.name),
        size: isObj(attrs.size) ? str(attrs.size.name) : "",
        color: isObj(attrs.color) ? str(attrs.color.name) : "",
        priceCents: Math.round(price * 100),
        // A missing currency is not assumed to be USD: the price would be meaningless.
        currency: isObj(v.unitPrice) ? str(v.unitPrice.currency) : "",
        available: productAvailable && inStock(v.stock),
        image: image(images[0]),
        imageIds: images.filter(isObj).map((i) => str(i.id)).filter(Boolean),
      };
    })
    .filter((v) => UUID.test(v.id) && Number.isFinite(v.priceCents) && v.priceCents > 0 && v.currency === CURRENCY);
  if (variants.length === 0) return null;
  const images = (Array.isArray(raw.images) ? raw.images : []).map(image).filter((i): i is StoreImage => i !== null);
  const sellable = variants.filter((v) => v.available);
  const priced = sellable.length ? sellable : variants;
  return {
    id, slug, name,
    descriptionHtml: sanitizeDescription(str(raw.description)),
    images,
    variants,
    sections: sections(raw.additionalInformation),
    available: sellable.length > 0,
    // "From" price comes from what can actually be bought, not from a cheaper sold-out variant.
    priceFromCents: Math.min(...priced.map((v) => v.priceCents)),
    priceToCents: Math.max(...priced.map((v) => v.priceCents)),
  };
}

/**
 * One page of `collections/all/products`. A response without a `results` array is an upstream
 * fault, not an empty shop. Individual malformed products are dropped and counted.
 */
export function parseCatalogPage(data: unknown): { products: StoreProduct[]; dropped: number; hasNextPage: boolean } {
  if (!isObj(data) || !Array.isArray(data.results)) throw new UpstreamShapeError("INVALID_CATALOG_RESPONSE");
  const products: StoreProduct[] = [];
  let dropped = 0;
  for (const raw of data.results) {
    const p = normalizeProduct(raw);
    if (p) products.push(p);
    else dropped++;
  }
  return { products, dropped, hasNextPage: isObj(data.paging) && data.paging.hasNextPage === true };
}

/** Desk mats lead the catalog; everything else keeps the shop's order. */
export function sortProducts(products: StoreProduct[]): StoreProduct[] {
  const rank = (p: StoreProduct) => (/-desk-mat$/.test(p.slug) ? 0 : 1);
  return products.map((p, i) => ({ p, i })).sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i).map((x) => x.p);
}

/* ------------------------------------------------------------------ variant choice */

export type ChoiceKind = "none" | "size" | "model" | "option";

/**
 * Does the shopper have to make a deliberate choice before adding to cart?
 * One variant → no. Several variants that differ by size/model → yes, nothing is preselected.
 */
export function choiceKind(product: StoreProduct): ChoiceKind {
  if (product.variants.length <= 1) return "none";
  const sizes = product.variants.map((v) => v.size);
  if (sizes.every(Boolean) && new Set(sizes).size === sizes.length) {
    return sizes.every((s) => /^(iphone|galaxy|pixel)\b/i.test(s)) ? "model" : "size";
  }
  return "option";
}

/** Text shown on the variant button: the differing attribute only, not "Black, S". */
export function choiceLabel(product: StoreProduct, variant: StoreVariant): string {
  return choiceKind(product) === "size" || choiceKind(product) === "model" ? variant.size : variant.label;
}

/**
 * Accepts a `?variant=` value only if it is one of this product's own variant ids; anything
 * else (other product's id, garbage, unavailable variant) means "no preselection".
 */
export function resolveVariantParam(product: StoreProduct, param: unknown): StoreVariant | null {
  const id = typeof param === "string" ? param : "";
  if (!UUID.test(id)) return null;
  return product.variants.find((v) => v.id === id && v.available) ?? null;
}

/**
 * Images for the gallery: the selected variant's own images when Fourthwall links a distinct
 * subset (phone models), otherwise the product images. `specific` tells the UI whether the
 * shown images belong to the selection or are general product shots.
 */
export function galleryFor(product: StoreProduct, variant: StoreVariant | null): { images: StoreImage[]; specific: boolean } {
  if (variant && variant.imageIds.length > 0 && variant.imageIds.length < product.images.length) {
    const own = variant.imageIds.map((id) => product.images.find((i) => i.id === id)).filter((i): i is StoreImage => Boolean(i));
    if (own.length > 0) return { images: own, specific: true };
  }
  return { images: product.images, specific: false };
}

/**
 * Phone models grouped by generation, newest first ("iPhone 18" → [18 Pro, 18 Pro Max]), so an
 * 18-model choice is a short scannable list instead of a wall of buttons.
 */
export function groupModels(variants: StoreVariant[]): { group: string; variants: StoreVariant[] }[] {
  const groups = new Map<string, StoreVariant[]>();
  for (const v of variants) {
    const m = /^(\D+?\s*\d+)/.exec(v.size);
    const key = m ? m[1].trim() : "Other";
    groups.set(key, [...(groups.get(key) ?? []), v]);
  }
  const num = (g: string) => Number(/\d+/.exec(g)?.[0] ?? -1);
  const tier = (s: string) => (/pro max/i.test(s) ? 4 : /pro/i.test(s) ? 3 : /plus|air/i.test(s) ? 2 : 1);
  return [...groups]
    .sort((a, b) => num(b[0]) - num(a[0]))
    .map(([group, vs]) => ({ group, variants: [...vs].sort((a, b) => tier(a.size) - tier(b.size)) }));
}

/* ------------------------------------------------------------------ fit information */

export type FitFamily = "apparel" | "phone-case" | "sleeve" | "socks" | "headwear" | "other";

export function fitFamily(product: StoreProduct): FitFamily {
  const s = product.slug;
  if (/(tee|hoodie|crewneck|t-shirt|sweatshirt)/.test(s)) return "apparel";
  if (/(case)$/.test(s) || choiceKind(product) === "model") return "phone-case";
  if (/sleeve/.test(s)) return "sleeve";
  if (/socks/.test(s)) return "socks";
  if (/(beanie|cap|hat)/.test(s)) return "headwear";
  return "other";
}

/**
 * Fit information status for one product. Measurements are never generated here: if Fourthwall
 * has no SIZE_AND_FIT section for a product whose fit depends on size, it is reported as missing.
 */
export function fitStatus(product: StoreProduct): { needsFit: boolean; fit: StoreSection | null; missing: boolean } {
  const family = fitFamily(product);
  const needsFit = family !== "other";
  const fit = product.sections.find((s) => s.type === "SIZE_AND_FIT") ?? null;
  // A phone case's "fit" is the model choice itself; it needs no measurement table.
  const missing = needsFit && family !== "phone-case" && !fit;
  return { needsFit, fit, missing };
}

/* ------------------------------------------------------------------ checkout */

export interface CheckoutLine {
  variantId: string;
  quantity: number;
}

/**
 * Server-side gate for checkout input: only variants of currently public, available products,
 * integer quantities 1..MAX_QTY. Repeated rows of the same variant are added up; a total above
 * MAX_QTY is rejected (never silently reduced). Prices are NOT accepted from the client.
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
    const total = (merged.get(variantId) ?? 0) + quantity;
    if (total > MAX_QTY) throw new Error("INVALID_QUANTITY");
    merged.set(variantId, total);
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

/**
 * Lines whose price in the browser snapshot (`expectedCents`, display only) differs from the
 * platform price. The server never uses the client value as a price; it only tells the shopper.
 */
export function priceChanges(input: unknown, catalog: StoreProduct[]): { variantId: string; unitCents: number }[] {
  if (!isObj(input) || !Array.isArray(input.items)) return [];
  const prices = new Map<string, number>();
  for (const p of catalog) for (const v of p.variants) prices.set(v.id, v.priceCents);
  const changed: { variantId: string; unitCents: number }[] = [];
  for (const item of input.items) {
    if (!isObj(item) || !("expectedCents" in item)) continue;
    const current = prices.get(str(item.variantId));
    if (current !== undefined && Number(item.expectedCents) !== current) changed.push({ variantId: str(item.variantId), unitCents: current });
  }
  return changed;
}

/** Same-origin check for the checkout POST; a malformed Origin header is a refusal, not a crash. */
export function sameOrigin(origin: string | null, host: string | null): boolean {
  if (!origin) return true; // same-origin fetches from some browsers omit Origin on POST; host binding still applies
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
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
  const whole = cents % 100 === 0;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(cents / 100);
}

/** "$35" or "$35–$41" from the sellable range. */
export function formatPriceRange(product: StoreProduct): string {
  return product.priceFromCents === product.priceToCents
    ? formatPrice(product.priceFromCents)
    : `${formatPrice(product.priceFromCents)}–${formatPrice(product.priceToCents)}`;
}
