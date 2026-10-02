// H05 transport: the one gtag sender, run against a fake browser. No network, nothing real is contacted.
// run: node --test tests/measurement/transport.test.mjs
import test from "node:test";
import assert from "node:assert/strict";

import { createGa4Transport, MAX_QUEUED_WHILE_LOADING } from "../../src/lib/analytics-transport.ts";
import { setForwarder, startPageScope, track, trackOnce } from "../../src/lib/analytics.ts";
import { safePageLocation, safeReferrer } from "../../src/lib/analytics-collector.ts";
import { ACTIVE, GOOD_ID, makeEnv } from "./lib/fake-env.mjs";

const view = { currency: "USD", value: 5, items: [{ item_id: "kpt-beanie", price: 5 }] };
const cartParams = { currency: "USD", value: 5, items: [{ item_id: "kpt-beanie", item_variant: "v1", price: 5, quantity: 1 }] };
const built = (event = "add_to_cart") => ({ event, ...cartParams });

/** Runs fn with a fake window (for track()) and the transport registered as the one forwarder. */
function withShop(ga, fn) {
  const saved = globalThis.window;
  globalThis.window = { dataLayer: [] };
  setForwarder(ga.forward);
  try {
    return fn(globalThis.window);
  } finally {
    setForwarder(null);
    if (saved === undefined) delete globalThis.window;
    else globalThis.window = saved;
  }
}

/* ---- case 1: no ID or no owner permission -> nothing loads, nothing collects */

test("case 1: without ID or owner activation the transport does nothing at all, whatever is called", () => {
  const bad = [{}, { ownerActivation: true }, { measurementId: GOOD_ID }, { measurementId: GOOD_ID, ownerActivation: "true" }, { measurementId: "G-XXXXXXXXXX", ownerActivation: true }, { measurementId: "UA-1-1", ownerActivation: true }];
  for (const config of bad) {
    const f = makeEnv({ stored: "granted" });
    const ga = createGa4Transport(config, f.env);
    assert.equal(ga.configured, false, JSON.stringify(config));
    ga.restore(); ga.grant(); ga.deny(); ga.pageView(); ga.forward(built());
    assert.equal(f.state.scripts.length, 0, "no script");
    assert.equal(f.rawEntries().length, 0, "no gtag command");
    assert.equal(f.state.store.get("kpt-analytics-consent-v1"), "granted", "nothing was written (the value is only the seed)");
    assert.equal(f.state.cookieWrites.length, 0);
  }
});

/* ---- case 2: unset and denied -> no load, no collect */

test("case 2: consent unset or denied: no script, no gtag command, forward is silent", () => {
  const f = makeEnv();
  const ga = createGa4Transport(ACTIVE, f.env);
  assert.equal(ga.configured, true);
  assert.equal(ga.consent(), "unset");
  ga.restore(); ga.pageView(); ga.forward(built());
  assert.equal(f.state.scripts.length, 0);
  assert.equal(f.rawEntries().length, 0);
  ga.deny();
  ga.pageView(); ga.forward(built()); ga.restore();
  assert.equal(f.state.scripts.length, 0);
  assert.equal(f.rawEntries().length, 0);
  assert.equal(ga.consent(), "denied");
  assert.equal(f.state.store.get("kpt-analytics-consent-v1"), "denied");
  assert.equal(f.state.win[`ga-disable-${GOOD_ID}`], true);
});

test("case 2b: a stored refusal is honoured on the next visit; a stored grant resumes without asking", () => {
  const denied = makeEnv({ stored: "denied" });
  const a = createGa4Transport(ACTIVE, denied.env);
  a.restore(); a.pageView(); a.forward(built());
  assert.equal(denied.state.scripts.length + denied.rawEntries().length, 0);
  const granted = makeEnv({ stored: "granted" });
  const b = createGa4Transport(ACTIVE, granted.env);
  assert.equal(granted.state.scripts.length, 0, "nothing at construction");
  b.restore();
  assert.equal(granted.state.scripts.length, 1);
  assert.equal(granted.events("page_view").length, 1);
});

/* ---- case 3: granted -> one correct page view, then the events */

test("case 3: grant sends consent default, js, config, then exactly one page_view; the script loads once, async, after the grant", () => {
  const f = makeEnv({ href: "https://keepitunderground.com/shop?q=jane@example.com&utm_source=newsletter&utm_medium=email&_gl=1*abc", referrer: "https://www.google.com/search?q=secret" });
  const ga = createGa4Transport(ACTIVE, f.env);
  ga.grant();
  const cmds = f.commands();
  assert.deepEqual(cmds.map((c) => c[0]), ["consent", "js", "config", "set", "event"]);
  assert.deepEqual(cmds[0], ["consent", "default", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }]);
  assert.equal(cmds[2][1], GOOD_ID);
  assert.equal(cmds[2][2].send_page_view, false);
  assert.equal(cmds[2][2].allow_google_signals, false);
  assert.equal(cmds[2][2].allow_ad_personalization_signals, false);
  assert.equal(f.events("page_view").length, 1);
  assert.equal(f.events("page_view")[0][2].page_location, "https://keepitunderground.com/shop?utm_source=newsletter&utm_medium=email");
  assert.equal(f.events("page_view")[0][2].page_referrer, "https://www.google.com/");
  assert.equal(f.state.scripts.length, 1);
  assert.equal(f.state.scripts[0].src, `https://www.googletagmanager.com/gtag/js?id=${GOOD_ID}&l=kptGa4Layer`);
  ga.grant(); // a second click is not a second load, nor a second page view
  assert.equal(f.state.scripts.length, 1);
  ga.forward(built("view_item"));
  assert.equal(f.events("view_item").length, 1);
  assert.equal(f.events("page_view").length, 1);
});

test("case 3b: every command is a real gtag arguments object, never a raw array", () => {
  const f = makeEnv();
  const ga = createGa4Transport(ACTIVE, f.env);
  ga.grant(); ga.forward(built()); ga.deny();
  assert.ok(f.rawEntries().length >= 6);
  for (const e of f.rawEntries()) {
    assert.equal(Array.isArray(e), false);
    assert.equal(Object.prototype.toString.call(e), "[object Arguments]");
  }
  assert.equal(f.state.win.gtag, undefined, "no global gtag is left on window");
  assert.equal(f.state.win.dataLayer, undefined, "the shop's own dataLayer is never touched by the transport");
});

/* ---- case 4: SPA A -> B -> A */

test("case 4: A -> B -> A is three page views; a StrictMode double call on one path is one", () => {
  const f = makeEnv({ href: "https://keepitunderground.com/shop/a" });
  const ga = createGa4Transport(ACTIVE, f.env);
  ga.grant();
  ga.pageView(); ga.pageView(); // StrictMode double effect
  f.go("/shop/b"); ga.pageView(); ga.pageView();
  f.go("/shop/a"); ga.pageView();
  const pv = f.events("page_view").map((c) => c[2]);
  assert.deepEqual(pv.map((p) => new URL(p.page_location).pathname), ["/shop/a", "/shop/b", "/shop/a"]);
  assert.equal(pv[0].page_referrer, undefined);
  assert.equal(pv[1].page_referrer, "https://keepitunderground.com/shop/a", "the previous page is the referrer");
  assert.equal(pv[2].page_referrer, "https://keepitunderground.com/shop/b");
});

test("case 4b: with a page-view scope per route the second visit to A counts again; re-renders inside one visit do not", () => {
  const f = makeEnv({ href: "https://keepitunderground.com/shop/a" });
  const ga = createGa4Transport(ACTIVE, f.env);
  withShop(ga, () => {
    ga.grant();
    const visit = (path) => {
      f.go(path);
      startPageScope();
      ga.pageView();
      for (let i = 0; i < 2; i++) trackOnce("view_item:offer-a", "view_item", view); // StrictMode runs the effect twice
    };
    visit("/shop/a"); visit("/shop/b"); visit("/shop/a");
    assert.equal(f.events("view_item").length, 3, "A, B (same key, new scope), A");
    assert.equal(f.events("page_view").length, 3);
    trackOnce("view_item:offer-a", "view_item", view); // a plain re-render of the same visit
    assert.equal(f.events("view_item").length, 3);
  });
});

/* ---- case 5: unset -> granted never replays the past */

test("case 5: an add_to_cart made before the grant is never sent, neither queued nor replayed", () => {
  const f = makeEnv();
  const ga = createGa4Transport(ACTIVE, f.env);
  withShop(ga, (win) => {
    track("add_to_cart", cartParams);
    assert.equal(win.dataLayer.length, 1, "the local dataLayer still records it");
    assert.equal(f.rawEntries().length, 0, "nothing queued for Google before the grant");
    ga.grant();
    assert.equal(JSON.stringify(f.commands()).includes("add_to_cart"), false, "not anywhere in the Google layer after the grant");
    track("add_to_cart", cartParams);
    assert.equal(f.events("add_to_cart").length, 1, "only the action after the grant");
  });
});

/* ---- case 6: granted -> denied in the same session */

test("case 6: after a withdrawal no event and no page view leaves; cookies are expired; a re-grant resumes", () => {
  const f = makeEnv({ href: "https://shop.keepitunderground.com/a" });
  const ga = createGa4Transport(ACTIVE, f.env);
  ga.grant();
  f.state.scripts[0].onLoad();
  const before = f.rawEntries().length;
  ga.deny();
  const afterDeny = f.rawEntries().length;
  assert.equal(afterDeny, before + 1, "exactly one command after the withdrawal: the consent update");
  assert.deepEqual(Array.from(f.rawEntries().at(-1)), ["consent", "update", { analytics_storage: "denied" }]);
  assert.equal(f.state.win[`ga-disable-${GOOD_ID}`], true);
  ga.forward(built()); f.go("/b"); ga.pageView(); ga.forward(built("view_item"));
  assert.equal(f.rawEntries().length, afterDeny, "nothing queued after the withdrawal");
  const writes = f.state.cookieWrites.join("\n");
  assert.match(writes, /^_ga=; Max-Age=0; path=\//m);
  assert.match(writes, /^_ga_MOCKTEST01=; Max-Age=0; path=\//m);
  assert.match(writes, /domain=\.keepitunderground\.com/);
  assert.doesNotMatch(writes, /domain=\.com\b/, "never a bare TLD");
  ga.grant();
  assert.equal(f.state.win[`ga-disable-${GOOD_ID}`], false);
  assert.equal(f.state.scripts.length, 1, "the script is not loaded twice");
  assert.equal(f.events("page_view").length, 2, "first view, then the current page after the re-grant");
});

/* ---- case 7: no personal data, no automatic URL parameters, no error text */

test("case 7: Google only ever sees origin + path (+ plain utm tags); no search text, email, ids or link parameters", () => {
  const origin = "https://keepitunderground.com";
  const cases = [
    ["/shop?q=jane@example.com", "/shop"],
    ["/shop?category=wear&sort=price&q=x", "/shop"],
    ["/?_gl=1*1abc*_ga*MTIz&fbclid=zzz&gclid=yyy", "/"],
    ["/shop/kpt-beanie?email=a@b.co&token=ptkn_123", "/shop/kpt-beanie"],
    ["/?utm_source=ig&utm_medium=social&utm_campaign=h05", "/?utm_source=ig&utm_medium=social&utm_campaign=h05"],
    ["/?utm_source=jane%40example.com", "/"],
    ["/?utm_campaign=has space", "/"],
    ["/shop/jane@example.com", "/shop/redacted"],
  ];
  for (const [input, want] of cases) assert.equal(safePageLocation(origin + input, origin), origin + want, input);
  assert.equal(safePageLocation("https://evil.example/x", origin), undefined, "another origin is never reported as our page");
  assert.equal(safePageLocation("not a url", origin), undefined);
  assert.equal(safeReferrer("https://keepitunderground-shop.fourthwall.com/checkout/ptkn_abc?cartId=9", origin), "https://keepitunderground-shop.fourthwall.com/", "an external referrer keeps only its origin");
  assert.equal(safeReferrer("https://keepitunderground.com/shop?q=a@b.co", origin), "https://keepitunderground.com/shop");
  assert.equal(safeReferrer("", origin), undefined);
  assert.equal(safeReferrer("javascript:alert(1)", origin), undefined);
});

test("case 7b: forwarded events keep only allowlisted parameters; polluted input and a purchase never reach the layer", () => {
  const f = makeEnv({ href: "https://keepitunderground.com/shop/a?q=jane@example.com" });
  const ga = createGa4Transport(ACTIVE, f.env);
  withShop(ga, () => {
    ga.grant();
    track("add_to_cart", { currency: "USD", value: 5, email: "jane@example.com", checkout_url: "https://keepitunderground-shop.fourthwall.com/checkout/ptkn_x", items: [{ item_id: "kpt-beanie", price: 5, quantity: 1, customer: "Jane" }] });
    track("purchase", { transaction_id: "T1", value: 5, currency: "USD" });
    const sent = JSON.stringify(f.commands());
    assert.doesNotMatch(sent, /jane|@|ptkn_|checkout_url|customer|purchase|transaction_id/i);
    assert.equal(f.events("purchase").length, 0);
    const [, , params] = f.events("add_to_cart")[0];
    assert.deepEqual(Object.keys(params).sort(), ["currency", "items", "page_location", "page_referrer", "value"].filter((k) => k in params).sort());
    assert.equal(params.page_location, "https://keepitunderground.com/shop/a");
  });
});

/* ---- case 8: blocked, failing or slow measurement never stops shopping */

test("case 8: a failing or slow script, blocked storage or a throwing loader never throws into the shop", () => {
  const failing = makeEnv();
  const a = createGa4Transport(ACTIVE, failing.env);
  assert.doesNotThrow(() => { a.grant(); failing.state.scripts[0].onError(); a.forward(built()); a.pageView(); });
  const afterFail = failing.rawEntries().length;
  a.forward(built()); a.forward(built("view_item"));
  assert.equal(failing.rawEntries().length, afterFail, "after a blocked script nothing keeps queueing");

  const throwing = makeEnv({ throwOnScript: true });
  const b = createGa4Transport(ACTIVE, throwing.env);
  assert.doesNotThrow(() => { b.grant(); b.forward(built()); });

  const noStorage = makeEnv({ storageBlocked: true });
  const c = createGa4Transport(ACTIVE, noStorage.env);
  assert.doesNotThrow(() => { c.restore(); c.grant(); c.deny(); });
  assert.equal(c.consent(), "denied", "the choice still holds for this page");

  const slow = makeEnv();
  const d = createGa4Transport(ACTIVE, slow.env);
  d.grant();
  for (let i = 0; i < MAX_QUEUED_WHILE_LOADING + 20; i++) d.forward(built());
  assert.equal(slow.events("add_to_cart").length, MAX_QUEUED_WHILE_LOADING - 1, "the buffer while the script loads is short and capped (the page_view used one slot)");
  slow.state.scripts[0].onLoad();
  d.forward(built());
  assert.equal(slow.events("add_to_cart").length, MAX_QUEUED_WHILE_LOADING, "after the load there is no cap");
});

/* ---- case 10: the whole funnel goes out, begin_checkout included (no hosted-side sender while the Fourthwall pixel is empty) */

test("case 10: begin_checkout is forwarded like the other funnel events (the Fourthwall Tracking pixel is empty, so nothing else sends it)", () => {
  const f = makeEnv();
  const ga = createGa4Transport(ACTIVE, f.env);
  withShop(ga, () => {
    ga.grant();
    track("add_to_cart", cartParams);
    track("begin_checkout", cartParams);
    track("checkout_redirect", { currency: "USD", value: 5, items: [{ item_id: "kpt-beanie", item_variant: "v1", quantity: 1 }] });
    assert.deepEqual(f.events().map((c) => c[1]), ["page_view", "add_to_cart", "begin_checkout", "checkout_redirect"]);
  });
});

/* ---- case 9: this app never sends purchase */

test("case 9: only schema events and page_view can reach the layer; a purchase handed to the transport is refused", () => {
  const f = makeEnv();
  const ga = createGa4Transport(ACTIVE, f.env);
  ga.grant();
  ga.forward({ event: "purchase", transaction_id: "T1", value: 1, currency: "USD" });
  ga.forward({ event: "refund", transaction_id: "T1" });
  ga.forward({ event: "view_item", ...view });
  const names = f.events().map((c) => c[1]);
  assert.deepEqual(names, ["page_view", "view_item"]);
});
