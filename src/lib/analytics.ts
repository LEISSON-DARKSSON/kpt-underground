/**
 * Measurement adapter (KPT-09). Events are pushed to `window.dataLayer` only — no third-party
 * script is loaded and nothing leaves the browser until the owner chooses and configures a tool.
 *
 * Event names follow the GA4 e-commerce schema. `checkout_redirect` / `checkout_error` are custom
 * technical events. There is deliberately no `purchase` here: a purchase can only come from a
 * platform-confirmed order (Fourthwall), never from a click, an HTTP 200 or a thank-you URL.
 */

export type ShopEvent =
  | "view_item_list"
  | "select_item"
  | "view_item"
  | "add_to_cart"
  | "view_cart"
  | "begin_checkout"
  | "checkout_redirect"
  | "checkout_error";

type Params = Record<string, unknown>;

const FORBIDDEN_KEY = /(e-?mail|address|phone|name_full|first_?name|last_?name|token|cookie|card|iban|password)/i;

/** Drops any key that could carry personal data or secrets, at any depth. */
export function scrub(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(scrub);
  if (value && typeof value === "object") {
    const out: Params = {};
    for (const [k, v] of Object.entries(value as Params)) if (!FORBIDDEN_KEY.test(k)) out[k] = scrub(v);
    return out;
  }
  if (typeof value === "string" && /@|ptkn_/.test(value)) return "[redacted]";
  return value;
}

export function buildEvent(event: ShopEvent, params: Params = {}): Params {
  return { event, ...(scrub(params) as Params) };
}

const once = new Set<string>();

/** Fires an event at most once per key for this page view (e.g. list impressions across re-renders). */
export function trackOnce(key: string, event: ShopEvent, params: Params = {}): void {
  if (once.has(key)) return;
  once.add(key);
  track(event, params);
}

export function track(event: ShopEvent, params: Params = {}): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as { dataLayer?: unknown[] };
    (w.dataLayer ??= []).push(buildEvent(event, params));
  } catch {
    /* measurement must never break shopping */
  }
}
