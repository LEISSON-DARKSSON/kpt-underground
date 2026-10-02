/**
 * Measurement adapter (KPT-09, H05). Every event is validated against an allowlist and pushed to
 * `window.dataLayer`, a local array that nothing reads. It reaches a collector only through the single
 * forwarder registered by `src/lib/analytics-transport.ts`, and that forwarder sends only after the
 * visitor granted analytics consent, the owner activation flag is set and a valid GA4 Measurement ID is
 * configured (see `docs/measurement-plan.md`, `src/lib/analytics-collector.ts`). Events that happen
 * before consent are never buffered for Google and never replayed.
 *
 * Event names follow the GA4 e-commerce schema. `hero_shop_click`, `checkout_redirect` and
 * `checkout_error` are custom technical events. There is deliberately no purchase event here: a
 * purchase can only come from a platform-confirmed order (Fourthwall), never from a click, an HTTP
 * 200 or a thank-you URL. `page_view` is not a ShopEvent either: the transport sends it itself.
 *
 * Privacy model: every event has an explicit ALLOWLIST of top-level and per-item parameters. Anything
 * not listed is dropped, anything listed must pass its own value check (so free text, URLs and ids of
 * people can not ride along). `scrub()` (a key blocklist plus value redaction) stays as a second guard.
 * Missing or unknown values are omitted; they are never turned into 0.
 */

export type ShopEvent =
  | "hero_shop_click"
  | "view_item_list"
  | "select_item"
  | "view_item"
  | "add_to_cart"
  | "view_cart"
  | "begin_checkout"
  | "checkout_redirect"
  | "checkout_error";

type Params = Record<string, unknown>;

/** How a single allowlisted value is validated. A value that fails is dropped, not coerced. */
type Kind = "id" | "label" | "money" | "quantity" | "index" | "currency" | "listId" | "reason" | "ctaId" | "path";

interface EventSpec {
  /** Allowed top-level parameters and their value kinds. */
  params: Readonly<Record<string, Kind>>;
  /** Allowed per-item parameters; absent means the event carries no `items` at all. */
  items?: Readonly<Record<string, Kind>>;
}

const MONEY_TOP = { currency: "currency", value: "money" } as const;

/**
 * The one place that says what each event may carry. Keep in sync with `docs/measurement-contract.json`
 * (a test compares them). Money is major units (USD dollars), converted from cents once at the call site.
 */
export const EVENT_SCHEMA: Readonly<Record<ShopEvent, EventSpec>> = {
  hero_shop_click: { params: { cta_id: "ctaId", destination: "path" } },
  view_item_list: {
    params: { item_list_id: "listId", currency: "currency" },
    items: { item_id: "id", item_name: "label", index: "index", price: "money" },
  },
  select_item: {
    params: { item_list_id: "listId", currency: "currency" },
    items: { item_id: "id", item_name: "label", price: "money" },
  },
  view_item: {
    params: MONEY_TOP,
    items: { item_id: "id", item_name: "label", item_variant: "id", price: "money" },
  },
  view_cart: {
    params: MONEY_TOP,
    items: { item_id: "id", item_variant: "id", price: "money", quantity: "quantity" },
  },
  add_to_cart: {
    params: MONEY_TOP,
    items: { item_id: "id", item_variant: "id", price: "money", quantity: "quantity" },
  },
  begin_checkout: {
    params: MONEY_TOP,
    items: { item_id: "id", item_variant: "id", price: "money", quantity: "quantity" },
  },
  // Never the checkout URL, a cart id or a session: only what was in the cart.
  checkout_redirect: {
    params: MONEY_TOP,
    items: { item_id: "id", item_variant: "id", quantity: "quantity" },
  },
  checkout_error: { params: { reason: "reason" } },
};

const MAX_ITEMS = 100;

/** Returns the cleaned value, or `undefined` when it is missing or invalid (never a fake 0). */
function clean(kind: Kind, v: unknown): string | number | undefined {
  if (kind === "money") return typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.round(v * 100) / 100 : undefined;
  if (kind === "quantity") return typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 1000 ? v : undefined;
  if (kind === "index") return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 10000 ? v : undefined;
  if (typeof v !== "string") return undefined;
  switch (kind) {
    case "id":
      return /^[A-Za-z0-9._:-]{1,100}$/.test(v) ? v : undefined;
    case "label": {
      const t = v.trim();
      return t.length >= 1 && t.length <= 120 && !/[a-z][a-z0-9+.-]*:\/\//i.test(t) ? t : undefined;
    }
    case "currency":
      return /^[A-Z]{3}$/.test(v) ? v : undefined;
    case "listId":
      return /^[a-z0-9_:.-]{1,60}$/.test(v) ? v : undefined;
    case "reason":
      return /^[A-Za-z0-9_]{1,40}$/.test(v) ? v : undefined;
    case "ctaId":
      return /^[a-z0-9_-]{1,40}$/.test(v) ? v : undefined;
    case "path":
      // A site path only: no scheme, host, query or fragment, so it can never be a checkout URL.
      return /^\/[A-Za-z0-9/_-]{0,80}$/.test(v) ? v : undefined;
  }
}

function pick(spec: Readonly<Record<string, Kind>>, source: unknown): Params {
  const out: Params = {};
  if (!source || typeof source !== "object" || Array.isArray(source)) return out;
  const src = source as Params;
  for (const [key, kind] of Object.entries(spec)) {
    const v = clean(kind, src[key]);
    if (v !== undefined) out[key] = v;
  }
  return out;
}

/** Applies the event's allowlist to params and items. Unknown keys are dropped at every depth. */
export function allowlisted(event: ShopEvent, params: Params = {}): Params {
  const spec = EVENT_SCHEMA[event];
  const out = pick(spec.params, params);
  let sendsMoney = typeof out.value === "number";
  if (spec.items && Array.isArray(params.items)) {
    const items: Params[] = [];
    for (const raw of params.items.slice(0, MAX_ITEMS)) {
      const item = pick(spec.items, raw);
      if (typeof item.item_id !== "string") continue; // an item without an id is not an item
      if (typeof item.price === "number") sendsMoney = true;
      items.push(item);
    }
    if (items.length > 0) out.items = items;
  }
  // GA4 wants a currency whenever money is sent. The shop is USD-only; call sites also set it explicitly.
  if ("currency" in spec.params && sendsMoney && out.currency === undefined) out.currency = "USD";
  return out;
}

const FORBIDDEN_KEY =
  /(e-?mail|address|phone|name_full|full_?name|customer|first_?name|last_?name|token|cookie|card|iban|password|street|city|post_?code|zip|(^|_)ip($|_)|user_?id|session|cart_?id|checkout|url)/i;

/** Second guard: drops any key that could carry personal data or secrets, at any depth. */
export function scrub(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(scrub);
  if (value && typeof value === "object") {
    const out: Params = {};
    for (const [k, v] of Object.entries(value as Params)) if (!FORBIDDEN_KEY.test(k)) out[k] = scrub(v);
    return out;
  }
  if (typeof value === "string" && /@|ptkn_|:\/\//.test(value)) return "[redacted]";
  return value;
}

/** The dataLayer object for an event, or `null` for an event that is not in the schema (never pushed). */
export function buildEvent(event: ShopEvent, params: Params = {}): Params | null {
  if (!Object.prototype.hasOwnProperty.call(EVENT_SCHEMA, event)) return null;
  return { event, ...(scrub(allowlisted(event, params)) as Params) };
}

const once = new Set<string>();

/**
 * Starts a new page-view scope: the once-per-page keys are forgotten, so a client-side revisit
 * (A -> B -> A) counts as a new view of A, while re-renders and StrictMode effect re-runs inside one
 * page view still emit once. Call it from a layout effect on every route change, which runs before the
 * pages' own effects.
 */
export function startPageScope(): void {
  once.clear();
}

/**
 * Fires an event at most once per key within the current page-view scope (e.g. list impressions across
 * re-renders). Without `startPageScope()` the scope is the whole page load.
 */
export function trackOnce(key: string, event: ShopEvent, params: Params = {}): void {
  if (once.has(key)) return;
  once.add(key);
  track(event, params);
}

type Forwarder = (built: Params) => void;
let forwarder: Forwarder | null = null;

/** Registers the one forwarder that may send built events to a collector; `null` removes it. */
export function setForwarder(fn: Forwarder | null): void {
  forwarder = fn;
}

export function track(event: ShopEvent, params: Params = {}): void {
  if (typeof window === "undefined") return;
  const built = (() => {
    try {
      return buildEvent(event, params);
    } catch {
      return null;
    }
  })();
  if (!built) return;
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    (w.dataLayer ??= []).push(built);
  } catch {
    /* measurement must never break shopping */
  }
  try {
    forwarder?.(built);
  } catch {
    /* same */
  }
}
