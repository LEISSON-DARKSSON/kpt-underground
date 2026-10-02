/**
 * The one GA4 transport (H05): direct gtag, one web stream, Basic consent. Rules live in
 * `analytics-collector.ts`; this file performs them. Nothing here runs at import: `createGa4Transport`
 * only acts when called, and it does nothing at all unless the plan is enabled (owner activation, a valid
 * Measurement ID and a granted consent).
 *
 * Contract with the rest of the app:
 *   - The shop's track function still pushes to `window.dataLayer` (a local array). This transport reads nothing from it:
 *     it registers as the forwarder and receives each already-allowlisted event as it happens, so events
 *     from before consent can never be replayed.
 *   - gtag.js reads its own layer (`kptGa4Layer`). Every command goes through one real `gtag()` that pushes
 *     the `arguments` object (raw arrays are silently ignored by the consent engine).
 *   - Nothing here awaits, throws into callers, or touches the cart or the checkout route.
 */
import {
  CONFIG_PARAMS,
  CONSENT_DEFAULT,
  GA_LAYER,
  collectorPlan,
  ga4ScriptUrl,
  gaCookieNames,
  gaDisableKey,
  safePageLocation,
  safeReferrer,
} from "./analytics-collector.ts";
import type { ConsentState } from "./analytics-collector.ts";
import { EVENT_SCHEMA } from "./analytics.ts";

type Params = Record<string, unknown>;

/**
 * Events the app records locally but never sends to Google, because Fourthwall's hosted checkout already sends
 * them natively into the same stream (observed 2026-10-02: begin_checkout from the checkout page). Sending both
 * would count every checkout twice. `checkout_redirect` stays: it is the app's own handoff signal.
 */
const NATIVE_ON_HOSTED_SIDE: ReadonlySet<string> = new Set(["begin_checkout"]);

export const CONSENT_STORAGE_KEY = "kpt-analytics-consent-v1";
/** Events that may queue while the Google script is still loading after a grant. Beyond this they are dropped. */
export const MAX_QUEUED_WHILE_LOADING = 25;

/** Everything the transport touches in the browser, injected so tests can run it without one. */
export interface TransportEnv {
  /** Holds the gtag layer array and the `ga-disable-<ID>` flag. */
  win: Record<string, unknown>;
  location: () => { href: string; origin: string; pathname: string };
  referrer: () => string;
  hostname: string;
  storage: { getItem(key: string): string | null; setItem(key: string, value: string): void } | null;
  cookies: { read(): string; write(cookie: string): void };
  /** Adds the async script; calls exactly one of the callbacks. Must never block rendering. */
  appendScript: (src: string, onLoad: () => void, onError: () => void) => void;
}

export interface TransportConfig {
  measurementId?: unknown;
  ownerActivation?: unknown;
}

export interface Ga4Transport {
  /** True only when owner activation and a valid ID are both present. False means the transport is a no-op. */
  readonly configured: boolean;
  consent(): ConsentState;
  subscribe(listener: () => void): () => void;
  /** Applies a stored grant on page load (no persist). A stored refusal does nothing. */
  restore(): void;
  grant(): void;
  deny(): void;
  /** One manual page_view for the current URL. Consecutive calls for the same path are one view (StrictMode). */
  pageView(): void;
  /** Receives an already-allowlisted dataLayer object ({ event, ...params }). Sends it only under a granted consent. */
  forward(built: Params): void;
}

export function createGa4Transport(config: TransportConfig, env: TransportEnv): Ga4Transport {
  // "Configured" is the plan with consent granted: owner activation and a valid, non-placeholder ID.
  const configured = collectorPlan({ ...config, consent: "granted" }).enabled;
  const id = configured ? (config.measurementId as string) : "";
  const listeners = new Set<() => void>();

  let consent: ConsentState = "unset";
  let started = false; // consent default + js + config are in the layer; the script was requested
  let script: "none" | "loading" | "loaded" | "failed" = "none";
  let queuedWhileLoading = 0;
  let lastPath: string | null = null;
  let lastLocation: string | undefined;
  let lastReferrer: string | undefined;

  if (configured) {
    try {
      const stored = env.storage?.getItem(CONSENT_STORAGE_KEY);
      if (stored === "granted" || stored === "denied") consent = stored;
    } catch {
      /* storage blocked: the choice is simply not remembered */
    }
  }

  const notify = () => listeners.forEach((l) => l());
  const persist = (value: ConsentState) => {
    try {
      env.storage?.setItem(CONSENT_STORAGE_KEY, value);
    } catch {
      /* not remembered, still honoured for this page */
    }
  };

  const layer = (): unknown[] => {
    const existing = env.win[GA_LAYER];
    if (Array.isArray(existing)) return existing;
    const fresh: unknown[] = [];
    env.win[GA_LAYER] = fresh;
    return fresh;
  };
  // Google's own pattern: the consent engine only understands the `arguments` object, never a plain array.
  const gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    layer().push(arguments);
  } as (...args: unknown[]) => void;

  const disabled = () => env.win[gaDisableKey(id)] === true;
  const open = () => collectorPlan({ ...config, consent }).enabled && started && !disabled();

  const here = () => {
    const l = env.location();
    return { path: l.pathname, location: safePageLocation(l.href, l.origin) };
  };

  function start() {
    started = true;
    const { location } = here();
    lastReferrer = safeReferrer(env.referrer(), env.location().origin);
    // Order matters: consent default before config, config before any event.
    gtag("consent", "default", { ...CONSENT_DEFAULT });
    gtag("js", new Date());
    gtag("config", id, { ...CONFIG_PARAMS, page_location: location, page_referrer: lastReferrer });
    script = "loading";
    try {
      env.appendScript(
        ga4ScriptUrl(id),
        () => {
          script = "loaded";
        },
        () => {
          script = "failed";
        },
      );
    } catch {
      script = "failed";
    }
  }

  function expireCookies() {
    const labels = env.hostname.split(".");
    const domains = [env.hostname];
    for (let i = 1; i < labels.length - 1; i++) domains.push(`.${labels.slice(i).join(".")}`);
    for (const name of gaCookieNames(id)) {
      env.cookies.write(`${name}=; Max-Age=0; path=/`);
      for (const d of domains) env.cookies.write(`${name}=; Max-Age=0; path=/; domain=${d}`);
    }
  }

  function send(event: string, params: Params) {
    if (!open()) return;
    if (script === "failed") return;
    if (script === "loading") {
      if (queuedWhileLoading >= MAX_QUEUED_WHILE_LOADING) return;
      queuedWhileLoading++;
    }
    gtag("event", event, params);
  }

  const api: Ga4Transport = {
    configured,
    consent: () => consent,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    restore() {
      if (!configured || consent !== "granted" || started) return;
      env.win[gaDisableKey(id)] = false;
      start();
      api.pageView();
    },
    grant() {
      if (!configured || (consent === "granted" && started)) return; // a second grant is not a second load or view
      try {
        consent = "granted";
        persist("granted");
        env.win[gaDisableKey(id)] = false;
        lastPath = null;
        if (!started) start();
        else gtag("consent", "update", { analytics_storage: "granted" });
        api.pageView();
      } catch {
        /* measurement must never break shopping */
      } finally {
        notify();
      }
    },
    deny() {
      if (!configured) return;
      try {
        consent = "denied";
        persist("denied");
        lastPath = null;
        env.win[gaDisableKey(id)] = true; // first: from here no hit leaves, whatever the script does
        if (started) gtag("consent", "update", { analytics_storage: "denied" });
        expireCookies();
      } catch {
        /* same */
      } finally {
        notify();
      }
    },
    pageView() {
      try {
        if (!open()) return;
        const { path, location } = here();
        if (lastPath === path) return;
        lastPath = path;
        const referrer = lastLocation ?? lastReferrer;
        lastLocation = location;
        lastReferrer = referrer;
        gtag("set", { page_location: location, page_referrer: referrer });
        send("page_view", { page_location: location, page_referrer: referrer });
      } catch {
        /* same */
      }
    },
    forward(built) {
      try {
        if (!open()) return;
        const { event, ...params } = built;
        // Second gate behind buildEvent: only schema events go out, so a stray "purchase" can never be sent from here.
        if (typeof event !== "string" || !Object.prototype.hasOwnProperty.call(EVENT_SCHEMA, event)) return;
        if (NATIVE_ON_HOSTED_SIDE.has(event)) return;
        send(event, { ...params, page_location: lastLocation ?? here().location, page_referrer: lastReferrer });
      } catch {
        /* same */
      }
    },
  };
  return api;
}

/* ------------------------------------------------------------------ the browser instance */

let instance: Ga4Transport | null | undefined;

/**
 * The transport for this page load, or `null` on the server. Config comes from build-time env vars:
 * NEXT_PUBLIC_GA4_MEASUREMENT_ID and NEXT_PUBLIC_GA4_OWNER_ACTIVATION ("true"). With either unset the
 * transport reports `configured: false` and every method is a no-op.
 */
export function getGa4Transport(): Ga4Transport | null {
  if (typeof window === "undefined") return null;
  if (instance !== undefined) return instance;
  const win = window as unknown as Record<string, unknown>;
  instance = createGa4Transport(
    {
      measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
      ownerActivation: process.env.NEXT_PUBLIC_GA4_OWNER_ACTIVATION === "true",
    },
    {
      win,
      location: () => ({ href: window.location.href, origin: window.location.origin, pathname: window.location.pathname }),
      referrer: () => document.referrer,
      hostname: window.location.hostname,
      storage: (() => {
        try {
          return window.localStorage;
        } catch {
          return null;
        }
      })(),
      cookies: {
        read: () => document.cookie,
        write: (c) => {
          document.cookie = c;
        },
      },
      appendScript: (src, onLoad, onError) => {
        const el = document.createElement("script");
        el.async = true;
        el.src = src;
        el.onload = onLoad;
        el.onerror = onError;
        document.head.appendChild(el);
      },
    },
  );
  return instance;
}
