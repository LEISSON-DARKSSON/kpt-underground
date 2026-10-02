// H05: event-specific allowlist, PII exclusion, dedupe and the disabled collector plan.
// run: node --test tests/store/analytics-allowlist.test.mjs
// Static and in-memory only: nothing here loads a collector or sends data anywhere.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { EVENT_SCHEMA, allowlisted, buildEvent, track } from "../../src/lib/analytics.ts";
import { collectorPlan, isMeasurementId } from "../../src/lib/analytics-collector.ts";

const root = path.resolve(import.meta.dirname, "../..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const contract = JSON.parse(read("docs/measurement-contract.json"));

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return /\.(ts|tsx|css|js|mjs)$/.test(e.name) ? [p] : [];
  });
}
const srcFiles = walk(path.join(root, "src")).map((p) => path.relative(root, p).split(path.sep).join("/"));
const stripComments = (code) => code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
const events = Object.keys(EVENT_SCHEMA);

/** Everything a hostile or careless caller might pass, at top level and inside items. */
const POLLUTED_TOP = {
  currency: "USD",
  value: 12.5,
  item_list_id: "shop:all:featured",
  reason: "NETWORK",
  cta_id: "hero_shop",
  destination: "/shop",
  email: "buyer@example.com",
  customer_email: "buyer@example.com",
  phone: "+3725551234",
  shipping_address: "Main street 1",
  address: "Main street 1",
  full_name: "Jane Doe",
  customer_name: "Jane Doe",
  name: "Jane Doe",
  token: "ptkn_secret",
  storefront_token: "abc",
  cookie: "_ga=GA1.1.123",
  card_number: "4111111111111111",
  cartId: "cart_123",
  cart_id: "cart_123",
  session_id: "s1",
  user_id: "u1",
  ip: "203.0.113.5",
  url: "https://keepitunderground-shop.fourthwall.com/checkout/?cartId=cart_123",
  checkout_url: "https://keepitunderground-shop.fourthwall.com/checkout/?cartId=cart_123",
  transaction_id: "T-1",
  coupon: "FRIENDS",
  anything_else: "x",
  nested: { email: "buyer@example.com", deeper: [{ phone: "1" }] },
};
const POLLUTED_ITEM = {
  item_id: "kpt-beanie",
  item_name: "KPT Beanie",
  item_variant: "426fe195-2cf5-4ded-9cae-94ceb5438d12",
  item_list_id: "shop:all:featured",
  index: 0,
  price: 19.99,
  quantity: 2,
  item_category: "Hats",
  email: "buyer@example.com",
  address_line1: "Main street 1",
  token: "t",
  cookie: "c",
  card: "4111",
  cartId: "cart_123",
  customer_id: "c1",
  url: "https://keepitunderground-shop.fourthwall.com/checkout/",
  affiliation: "x",
};

const keysDeep = (o, out = []) => {
  if (Array.isArray(o)) o.forEach((x) => keysDeep(x, out));
  else if (o && typeof o === "object")
    for (const [k, v] of Object.entries(o)) {
      out.push(k);
      keysDeep(v, out);
    }
  return out;
};

/* ------------------------------------------------------------------ allowlist */

test("allowlist: every event's emitted params are a subset of its allowlist (top level and per item)", () => {
  for (const name of events) {
    const out = buildEvent(name, { ...POLLUTED_TOP, items: [POLLUTED_ITEM, { ...POLLUTED_ITEM, item_id: "kpt-crewneck", index: 1 }] });
    assert.ok(out, `${name} built`);
    const { event, ...params } = out;
    assert.equal(event, name);
    const spec = EVENT_SCHEMA[name];
    for (const k of Object.keys(params)) assert.ok(k === "items" || k in spec.params, `${name}: unexpected top-level param ${k}`);
    if (params.items) {
      assert.ok(spec.items, `${name} must not carry items`);
      for (const item of params.items) for (const k of Object.keys(item)) assert.ok(k in spec.items, `${name}: unexpected item param ${k}`);
    }
    if (!spec.items) assert.equal("items" in params, false, `${name} must drop items`);
  }
});

test("allowlist: the schema in code equals docs/measurement-contract.json (allowedParams / allowedItemParams)", () => {
  for (const name of events) {
    const e = contract.events.find((x) => x.name === name);
    assert.ok(e, `${name} in contract`);
    assert.deepEqual([...e.allowedParams].sort(), Object.keys(EVENT_SCHEMA[name].params).sort(), `${name} params`);
    const items = EVENT_SCHEMA[name].items;
    assert.deepEqual([...(e.allowedItemParams ?? [])].sort(), Object.keys(items ?? {}).sort(), `${name} item params`);
  }
  assert.equal(contract.allowlist.enforced, true);
  assert.deepEqual(contract.forbiddenParams.knownScrubGaps, []);
});

test("allowlist: events outside the schema (purchase, anything) are never built or pushed", () => {
  assert.equal(buildEvent("purchase", { transaction_id: "T", value: 1, currency: "USD" }), null);
  assert.equal(buildEvent("page_view", {}), null);
  assert.equal(buildEvent("constructor", {}), null);
  assert.equal(buildEvent("__proto__", {}), null);
  const saved = globalThis.window;
  try {
    globalThis.window = { dataLayer: [] };
    track("purchase", { transaction_id: "T", value: 1, currency: "USD" });
    track("hasOwnProperty", {});
    assert.equal(globalThis.window.dataLayer.length, 0);
  } finally {
    if (saved === undefined) delete globalThis.window;
    else globalThis.window = saved;
  }
  assert.ok(!events.includes("purchase"));
});

test("allowlist: value shapes are enforced (free text, URLs and malformed ids never ride in allowed fields)", () => {
  const a = allowlisted("view_item_list", {
    item_list_id: "shop:all:featured:john smith",
    items: [
      { item_id: "https://x.test/checkout", price: 1 },
      { item_id: "has space" },
      { item_id: "ok-slug", item_name: "see https://pay.example/checkout", index: -1, price: -5 },
    ],
  });
  assert.equal("item_list_id" in a, false, "free-text list id dropped");
  assert.deepEqual(a.items, [{ item_id: "ok-slug" }]);
  assert.equal(allowlisted("view_item_list", { item_list_id: "shop:all:featured:search" }).item_list_id, "shop:all:featured:search");
  assert.deepEqual(allowlisted("checkout_error", { reason: "https://pay.example/c?cartId=1" }), {});
  assert.deepEqual(allowlisted("checkout_error", { reason: "HTTP_502" }), { reason: "HTTP_502" });
  assert.deepEqual(allowlisted("hero_shop_click", { cta_id: "hero_shop", destination: "https://keepitunderground-shop.fourthwall.com/x" }), { cta_id: "hero_shop" });
  assert.deepEqual(allowlisted("hero_shop_click", { cta_id: "hero_shop", destination: "/shop?x=1#y" }), { cta_id: "hero_shop" });
});

test("shop-catalog sends a list id without the visitor's search text", () => {
  const code = stripComments(read("src/components/store/shop-catalog.tsx"));
  assert.match(code, /item_list_id:\s*listParam/);
  assert.match(code, /const listParam\s*=\s*`[^`]*`/);
  assert.doesNotMatch(/const listParam\s*=\s*`([^`]*)`/.exec(code)[1], /\$\{q\}/, "listParam must not interpolate q");
  assert.match(code, /list=\{listParam\}/, "cards get the safe list id too");
});

/* ------------------------------------------------------------------ PII */

test("PII: no email, address, phone, name, token, cookie, card, checkout URL or cartId survives in any event, at any depth", () => {
  const serialized = [];
  for (const name of events) {
    const out = buildEvent(name, { ...POLLUTED_TOP, items: [POLLUTED_ITEM] });
    const text = JSON.stringify(out);
    serialized.push(text);
    for (const needle of ["buyer@example.com", "+3725551234", "Main street", "Jane Doe", "ptkn_", "_ga=", "4111", "cart_123", "fourthwall", "/checkout", "203.0.113.5", "FRIENDS", "T-1", "u1", "c1"]) {
      assert.ok(!text.includes(needle), `${name} leaked ${needle}: ${text}`);
    }
    const keys = keysDeep(out);
    const bad = keys.filter((k) => /email|address|phone|token|cookie|card|cart_?id|session|url|^ip$|user_?id|customer|transaction_id|coupon|nested|anything_else|full_name|^name$/i.test(k));
    assert.deepEqual(bad, [], `${name} kept PII-like keys`);
  }
  assert.ok(serialized.length === events.length);
});

test("PII: values that look like contact data are redacted even inside allowed fields (second guard)", () => {
  const out = buildEvent("view_item", { currency: "USD", value: 1, items: [{ item_id: "kpt-beanie", item_name: "mail me@x.io", price: 1 }] });
  assert.equal(out.items[0].item_name, "[redacted]");
  assert.equal(out.items[0].item_id, "kpt-beanie");
});

test("checkout_redirect carries no URL and only item_id / item_variant / quantity per item", () => {
  const url = "https://keepitunderground-shop.fourthwall.com/checkout/?cartId=abc123";
  const out = buildEvent("checkout_redirect", {
    currency: "USD",
    value: 39.98,
    url,
    checkout_url: url,
    destination: url,
    cartId: "abc123",
    items: [{ item_id: "kpt-beanie", item_variant: "426fe195-2cf5-4ded-9cae-94ceb5438d12", quantity: 2, price: 19.99, item_name: "KPT Beanie", url }],
  });
  assert.deepEqual(out, {
    event: "checkout_redirect",
    currency: "USD",
    value: 39.98,
    items: [{ item_id: "kpt-beanie", item_variant: "426fe195-2cf5-4ded-9cae-94ceb5438d12", quantity: 2 }],
  });
  assert.ok(!JSON.stringify(out).includes("fourthwall"));
  // And the real call site: it must not even reference the response URL.
  const cart = stripComments(read("src/lib/store/cart.tsx"));
  const at = cart.indexOf('track("checkout_redirect"');
  assert.ok(at > 0, "call site exists");
  const call = cart.slice(at, cart.indexOf("window.location.assign", at));
  assert.doesNotMatch(call, /\burl\b|data\.|cartId|checkoutUrl/i, "checkout_redirect call must not touch the URL or response");
  assert.match(call, /item_id:\s*l\.slug/);
  assert.match(call, /item_variant:\s*l\.variantId/);
  assert.match(call, /quantity:\s*l\.qty/);
  assert.doesNotMatch(call, /\bprice\s*:/, "no per-item price on checkout_redirect");
});

test("purchase is not in the schema, the adapter or any call site", () => {
  assert.ok(!("purchase" in EVENT_SCHEMA));
  for (const file of srcFiles.filter((f) => /\.tsx?$/.test(f))) {
    const code = stripComments(read(file));
    assert.doesNotMatch(code, /["'`]purchase["'`]/, `${file} has a purchase literal`);
  }
});

/* ------------------------------------------------------------------ hero_shop_click */

test("hero_shop_click exists, carries only cta_id and destination, and is wired to the one hero link without changing it", () => {
  assert.deepEqual(Object.keys(EVENT_SCHEMA.hero_shop_click.params).sort(), ["cta_id", "destination"]);
  assert.equal(EVENT_SCHEMA.hero_shop_click.items, undefined);
  assert.deepEqual(buildEvent("hero_shop_click", { cta_id: "hero_shop", destination: "/shop", items: [{ item_id: "x" }], value: 1, currency: "USD" }), {
    event: "hero_shop_click",
    cta_id: "hero_shop",
    destination: "/shop",
  });
  const tracker = read("src/components/home/hero-cta-tracker.tsx");
  assert.match(tracker, /^"use client";/);
  assert.match(tracker, /track\("hero_shop_click"/);
  assert.doesNotMatch(tracker, /preventDefault|stopPropagation|await |setTimeout/, "tracking must never block or alter navigation");
  const ctas = read("src/components/home/hero-ctas.tsx");
  assert.equal((ctas.match(/<Link\b/g) ?? []).length, 1);
  assert.match(ctas, /data-hero-cta/);
  assert.match(ctas, /data-cursor="shop"/);
  assert.match(ctas, /<HeroCtaTracker className="mt-10">/);
  const contractEvent = contract.events.find((e) => e.name === "hero_shop_click");
  assert.equal(contractEvent.emittedToday, true);
  assert.deepEqual(contractEvent.callSites.map((c) => c.split(":")[0]), ["src/components/home/hero-cta-tracker.tsx"]);
});

/* ------------------------------------------------------------------ missing is not zero */

test("unknown or missing values are omitted, never sent as 0", () => {
  const out = buildEvent("add_to_cart", {
    value: undefined,
    items: [{ item_id: "a", item_variant: undefined, price: Number.NaN, quantity: 0 }, { item_id: "b", price: null, quantity: "2" }, { item_id: "c", price: "0" }],
  });
  assert.deepEqual(out, { event: "add_to_cart", items: [{ item_id: "a" }, { item_id: "b" }, { item_id: "c" }] });
  assert.equal("currency" in out, false, "no money, so no currency");
  assert.equal("value" in out, false);
  assert.deepEqual(buildEvent("view_cart", { items: [] }), { event: "view_cart" }, "empty items array omitted");
  assert.deepEqual(buildEvent("view_cart", { value: Infinity, items: [{ price: 1 }] }), { event: "view_cart" }, "item without id and infinite value dropped");
  // A real zero that the caller passes on purpose is kept; that is data, not a default.
  assert.equal(buildEvent("add_to_cart", { value: 0, currency: "USD", items: [{ item_id: "free", price: 0, quantity: 1 }] }).value, 0);
});

test("currency USD accompanies any money that is sent, and is never invented for no money", () => {
  assert.equal(buildEvent("view_item_list", { items: [{ item_id: "a", price: 5 }] }).currency, "USD");
  assert.equal(buildEvent("select_item", { items: [{ item_id: "a", price: 5 }] }).currency, "USD");
  assert.equal(buildEvent("checkout_redirect", { value: 5 }).currency, "USD");
  assert.equal("currency" in buildEvent("select_item", { items: [{ item_id: "a" }] }), false);
  assert.equal("currency" in buildEvent("checkout_error", { reason: "NETWORK", value: 5 }), false);
  assert.equal(buildEvent("view_item", { currency: "EUR", value: 5 }).currency, "EUR", "explicit valid currency is respected");
});

test("view_item keeps item_variant when a variant is known and omits it otherwise", () => {
  const known = buildEvent("view_item", { currency: "USD", value: 12, items: [{ item_id: "kpt-beanie", item_name: "KPT Beanie", item_variant: "426fe195-2cf5-4ded-9cae-94ceb5438d12", price: 12 }] });
  assert.equal(known.items[0].item_variant, "426fe195-2cf5-4ded-9cae-94ceb5438d12");
  const unknown = buildEvent("view_item", { currency: "USD", value: 12, items: [{ item_id: "kpt-crewneck", item_variant: undefined, price: 12 }] });
  assert.equal("item_variant" in unknown.items[0], false);
  const code = stripComments(read("src/components/store/product-purchase.tsx"));
  assert.match(code, /item_variant:\s*soleVariantId/);
});

/* ------------------------------------------------------------------ trackOnce / SPA navigation */

function captureDataLayer(fn) {
  const saved = globalThis.window;
  globalThis.window = { dataLayer: [] };
  try {
    fn();
    return globalThis.window.dataLayer;
  } finally {
    if (saved === undefined) delete globalThis.window;
    else globalThis.window = saved;
  }
}

test("trackOnce: repeated effect runs / re-renders within one page view emit once per key", async () => {
  const mod = await import("../../src/lib/analytics.ts?within-page-view");
  const layer = captureDataLayer(() => {
    for (let i = 0; i < 5; i++) mod.trackOnce("view_item:p1", "view_item", { currency: "USD", value: 1, items: [{ item_id: "kpt-beanie" }] });
    mod.trackOnce("shop:all:featured:", "view_item_list", { item_list_id: "shop:all:featured", items: [{ item_id: "kpt-beanie", index: 0 }] });
    mod.trackOnce("shop:all:featured:", "view_item_list", { item_list_id: "shop:all:featured", items: [{ item_id: "kpt-beanie", index: 0 }] });
  });
  assert.equal(layer.filter((e) => e.event === "view_item").length, 1);
  assert.equal(layer.filter((e) => e.event === "view_item_list").length, 1);
});

test("trackOnce: without a page-view scope, a simulated SPA route change (A -> B -> A -> B) yields at most one view_item per product (page-load scope)", async () => {
  const mod = await import("../../src/lib/analytics.ts?spa-navigation");
  // Each route render runs the product page effect (twice, like StrictMode) with the same key scheme as product-purchase.
  const visit = (id, slug) => {
    for (let run = 0; run < 2; run++) mod.trackOnce(`view_item:${id}`, "view_item", { currency: "USD", value: 5, items: [{ item_id: slug, price: 5 }] });
  };
  const layer = captureDataLayer(() => {
    visit("offer-a", "kpt-beanie");
    visit("offer-b", "kpt-crewneck");
    visit("offer-a", "kpt-beanie");
    visit("offer-b", "kpt-crewneck");
  });
  const per = {};
  for (const e of layer.filter((x) => x.event === "view_item")) per[e.items[0].item_id] = (per[e.items[0].item_id] ?? 0) + 1;
  assert.deepEqual(per, { "kpt-beanie": 1, "kpt-crewneck": 1 });
  // A full page load is a fresh module instance: counted once more, still once.
  const fresh = await import("../../src/lib/analytics.ts?spa-navigation-reload");
  const after = captureDataLayer(() => visitFresh(fresh));
  assert.equal(after.filter((e) => e.event === "view_item").length, 1);
  function visitFresh(m) {
    for (let run = 0; run < 3; run++) m.trackOnce("view_item:offer-a", "view_item", { currency: "USD", value: 5, items: [{ item_id: "kpt-beanie", price: 5 }] });
  }
});

test("trackOnce: with startPageScope() on every route change, A -> B -> A is three views, and re-runs inside one view stay one", async () => {
  const mod = await import("../../src/lib/analytics.ts?page-scope");
  const visit = (id, slug) => {
    mod.startPageScope();
    for (let run = 0; run < 2; run++) mod.trackOnce(`view_item:${id}`, "view_item", { currency: "USD", value: 5, items: [{ item_id: slug, price: 5 }] });
  };
  const layer = captureDataLayer(() => {
    visit("offer-a", "kpt-beanie");
    visit("offer-b", "kpt-crewneck");
    visit("offer-a", "kpt-beanie");
  });
  assert.deepEqual(layer.filter((e) => e.event === "view_item").map((e) => e.items[0].item_id), ["kpt-beanie", "kpt-crewneck", "kpt-beanie"]);
});

test("the app shell starts a page-view scope in a layout effect (it runs before the pages' own passive effects)", () => {
  const root = stripComments(read("src/components/analytics/analytics-root.tsx"));
  assert.match(root, /useLayoutEffect\(\(\) => \{\s*startPageScope\(\);\s*\}, \[pathname\]\)/);
  for (const f of ["src/components/store/product-purchase.tsx", "src/components/store/shop-catalog.tsx"]) {
    assert.doesNotMatch(stripComments(read(f)), /useLayoutEffect/, `${f} must keep its tracking in a passive effect`);
  }
});

test("view events go through trackOnce at their call sites; click and cart events use track", () => {
  const purchase = stripComments(read("src/components/store/product-purchase.tsx"));
  assert.match(purchase, /trackOnce\(`view_item:\$\{product\.id\}`,\s*"view_item"/);
  assert.doesNotMatch(purchase, /\btrack\(/);
  const catalog = stripComments(read("src/components/store/shop-catalog.tsx"));
  assert.match(catalog, /trackOnce\(listId,\s*"view_item_list"/);
  assert.doesNotMatch(catalog, /\btrack\(/);
});

/* ------------------------------------------------------------------ collector (disabled) */

const VALID_ID = "G-AB12CD34EF";

test("collector: disabled unless owner activation, a valid Measurement ID and granted consent all hold", () => {
  assert.deepEqual(collectorPlan(), { enabled: false, reason: "owner_activation_missing" });
  assert.deepEqual(collectorPlan({}), { enabled: false, reason: "owner_activation_missing" });
  assert.deepEqual(collectorPlan({ measurementId: VALID_ID, consent: "granted" }), { enabled: false, reason: "owner_activation_missing" });
  for (const bad of [false, "true", 1, "yes", null, undefined]) {
    assert.equal(collectorPlan({ measurementId: VALID_ID, consent: "granted", ownerActivation: bad }).enabled, false, `ownerActivation=${String(bad)}`);
  }
  assert.deepEqual(collectorPlan({ ownerActivation: true, consent: "granted" }), { enabled: false, reason: "no_measurement_id" });
  assert.deepEqual(collectorPlan({ ownerActivation: true, measurementId: "", consent: "granted" }), { enabled: false, reason: "no_measurement_id" });
  for (const id of ["G-XXXXXXXXXX", "G-0000000000", "g-ab12cd34ef", "G-AB12CD34E", "G-AB12CD34EFG", "UA-123456-1", "GTM-ABCDEFG", "G-AB12CD34E!", " G-AB12CD34EF", 12345, {}]) {
    assert.deepEqual(collectorPlan({ ownerActivation: true, measurementId: id, consent: "granted" }), { enabled: false, reason: "invalid_measurement_id" }, String(id));
  }
  assert.deepEqual(collectorPlan({ ownerActivation: true, measurementId: VALID_ID, consent: "denied" }), { enabled: false, reason: "consent_denied" });
  for (const c of [undefined, null, "unset", "GRANTED", true, "granted "]) {
    assert.deepEqual(collectorPlan({ ownerActivation: true, measurementId: VALID_ID, consent: c }), { enabled: false, reason: "consent_unset" }, String(c));
  }
  const on = collectorPlan({ ownerActivation: true, measurementId: VALID_ID, consent: "granted" });
  assert.equal(on.enabled, true);
  assert.equal(on.measurementId, VALID_ID);
  assert.equal(on.sendPageView, false);
  assert.equal(on.advertising, false);
  assert.ok(isMeasurementId(VALID_ID) && !isMeasurementId("G-XXXXXXXXXX"));
});

test("collector: Basic consent means no loadScript before consent, whatever else is true", () => {
  for (const consent of [undefined, "unset", "denied"]) {
    const plan = collectorPlan({ ownerActivation: true, measurementId: VALID_ID, consent });
    assert.equal(plan.enabled, false);
    assert.equal("loadScript" in plan, false);
  }
});

test("collector: wired through exactly one transport, and only the app shell imports that transport (inert until activated)", () => {
  const importers = (needle, self) => [...srcFiles, "next.config.ts"].filter((file) => file !== self && needle.test(stripComments(read(file))));
  assert.deepEqual(importers(/analytics-collector/, "src/lib/analytics-collector.ts"), ["src/lib/analytics-transport.ts"]);
  assert.deepEqual(importers(/analytics-transport/, "src/lib/analytics-transport.ts"), ["src/components/analytics/analytics-preference.tsx", "src/components/analytics/analytics-root.tsx"]);
  const contractVariant = contract.collector.variant;
  assert.deepEqual(contractVariant.importedBy, ["src/lib/analytics-transport.ts"]);
  assert.equal(contractVariant.status, "WIRED_INERT_NOT_ACTIVATED");
  assert.deepEqual(contractVariant.activationEnv, ["NEXT_PUBLIC_GA4_MEASUREMENT_ID", "NEXT_PUBLIC_GA4_OWNER_ACTIVATION"]);
});

test("collector: no side effects at import (no DOM, storage, network or script creation in its code)", () => {
  const code = stripComments(read("src/lib/analytics-collector.ts"));
  assert.doesNotMatch(code, /\b(window|document|localStorage|sessionStorage|navigator|fetch|XMLHttpRequest|sendBeacon|createElement|appendChild|setTimeout|dataLayer)\b/);
  assert.doesNotMatch(code, /^\s*import\b/m, "self-contained, no imports");
});

const GOOGLE_TAG_FILES = new Set(["src/lib/analytics-collector.ts", "src/lib/analytics-transport.ts"]);

test("a Google tag is referenced only in the collector rules and the one transport (comments excluded); no script loader anywhere", () => {
  for (const file of [...srcFiles, "next.config.ts"]) {
    const code = stripComments(read(file));
    if (!GOOGLE_TAG_FILES.has(file)) assert.doesNotMatch(code, /googletagmanager|google-analytics|gtag/i, `${file} references a Google tag`);
    assert.doesNotMatch(code, /<Script|next\/script/, `${file} uses a script loader`);
    assert.doesNotMatch(code, /<script[^>]*src\s*=/i, `${file} has an external <script src>`);
  }
  // the transport is the only place that creates a script element
  const creators = srcFiles.filter((f) => /createElement\(\s*["']script["']\s*\)/.test(stripComments(read(f))));
  assert.deepEqual(creators, ["src/lib/analytics-transport.ts"]);
});
