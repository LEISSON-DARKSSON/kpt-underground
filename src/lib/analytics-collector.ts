/**
 * GA4 collector rules (H05): one web stream, one transport (direct gtag, no GTM), Basic consent, no ads.
 *
 * This module is pure and has no side effects at import: it creates no script element, makes no network
 * request, reads no cookie or storage. It decides WHETHER the collector may run (`collectorPlan`) and
 * builds the strings and objects the transport sends. The transport itself lives in
 * `analytics-transport.ts`; it is inert unless the plan below says `enabled`.
 *
 * Policy (a technical proposal, not legal advice):
 *   - Before consent and after a refusal the Google tag is NOT loaded and nothing is sent. Shopping never waits for it.
 *   - Events that happen before consent are never replayed. After a grant the current page view and later
 *     events are sent. The only buffer is the short one that builds while the script loads after the grant.
 *   - Withdrawing consent stops all further sends in the same session (a disable flag plus the transport gate).
 *   - Page views are manual: the first one after a grant, then one per real route change.
 *   - page_location and page_referrer are rebuilt here: no query string except utm_* campaign tags.
 *
 * It is enabled only when ALL of these hold:
 *   1. the owner explicitly approved activation (`ownerActivation === true`),
 *   2. the Measurement ID is syntactically valid and not a placeholder,
 *   3. consent is exactly "granted".
 * No Measurement ID exists in this repository. Do not invent one.
 */

export type ConsentState = "granted" | "denied" | "unset";

export type CollectorDisabledReason = "owner_activation_missing" | "no_measurement_id" | "invalid_measurement_id" | "consent_denied" | "consent_unset";

export interface CollectorInput {
  measurementId?: unknown;
  consent?: unknown;
  /** Must be the boolean `true`; set only after the owner approved an ID and activation. */
  ownerActivation?: unknown;
}

/** gtag.js reads this layer, not `window.dataLayer`, so the shop's own `{event}` buffer is never consumed by Google. */
export const GA_LAYER = "kptGa4Layer";

export type CollectorPlan =
  | { enabled: false; reason: CollectorDisabledReason }
  | {
      enabled: true;
      measurementId: string;
      /** The script may be injected only now, after consent. */
      loadScript: true;
      /** No automatic page view: the transport sends one manual page_view per consented page view. */
      sendPageView: false;
      /** No advertising features, no ad personalization, no cross-site signals. */
      advertising: false;
      layerName: typeof GA_LAYER;
    };

const ID_SHAPE = /^G-[A-Z0-9]{10}$/;
const PLACEHOLDER = /^G-(X{10}|0{10})$/;

export function isMeasurementId(value: unknown): value is string {
  return typeof value === "string" && ID_SHAPE.test(value) && !PLACEHOLDER.test(value);
}

export function collectorPlan(input: CollectorInput = {}): CollectorPlan {
  if (input.ownerActivation !== true) return { enabled: false, reason: "owner_activation_missing" };
  if (input.measurementId === undefined || input.measurementId === null || input.measurementId === "") {
    return { enabled: false, reason: "no_measurement_id" };
  }
  if (!isMeasurementId(input.measurementId)) return { enabled: false, reason: "invalid_measurement_id" };
  if (input.consent === "denied") return { enabled: false, reason: "consent_denied" };
  if (input.consent !== "granted") return { enabled: false, reason: "consent_unset" };
  return { enabled: true, measurementId: input.measurementId, loadScript: true, sendPageView: false, advertising: false, layerName: GA_LAYER };
}

/* ------------------------------------------------------------------ what the transport sends */

export function ga4ScriptUrl(measurementId: string): string {
  return `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}&l=${GA_LAYER}`;
}

/** Sent once, right after a grant and before `config`: analytics only, every advertising signal denied. */
export const CONSENT_DEFAULT = {
  analytics_storage: "granted",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

export const CONFIG_PARAMS = {
  send_page_view: false,
  allow_google_signals: false,
  allow_ad_personalization_signals: false,
} as const;

/** Google's documented switch that stops every hit for this ID on this page. */
export function gaDisableKey(measurementId: string): string {
  return `ga-disable-${measurementId}`;
}

/** First-party cookies the Google tag sets for this ID. */
export function gaCookieNames(measurementId: string): string[] {
  return ["_ga", `_ga_${measurementId.replace(/^G-/, "")}`];
}

/* ------------------------------------------------------------------ URLs sent to Google */

const CAMPAIGN_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const CAMPAIGN_VALUE = /^[A-Za-z0-9._~+-]{1,64}$/;

function cleanPath(pathname: string): string {
  // A path segment that looks like an address or a token never leaves the browser.
  return pathname.replace(/[^/]*(@|ptkn_)[^/]*/gi, "redacted");
}

/**
 * The page URL as Google may see it: origin + path, plus only the utm_* campaign tags whose value is a
 * short plain token. Search text (`q`), filters, `_gl`, ids and any other parameter are dropped.
 */
export function safePageLocation(href: string, origin: string): string | undefined {
  let u: URL;
  try {
    u = new URL(href);
  } catch {
    return undefined;
  }
  if (u.origin !== origin) return undefined;
  const kept: string[] = [];
  for (const key of CAMPAIGN_KEYS) {
    const v = u.searchParams.get(key);
    if (v !== null && CAMPAIGN_VALUE.test(v)) kept.push(`${key}=${v}`);
  }
  return `${u.origin}${cleanPath(u.pathname)}${kept.length > 0 ? `?${kept.join("&")}` : ""}`;
}

/** The referrer as Google may see it: same-site referrers keep the path, external ones only the origin. */
export function safeReferrer(referrer: string, origin: string): string | undefined {
  if (!referrer) return undefined;
  let u: URL;
  try {
    u = new URL(referrer);
  } catch {
    return undefined;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return undefined;
  return u.origin === origin ? `${u.origin}${cleanPath(u.pathname)}` : `${u.origin}/`;
}
