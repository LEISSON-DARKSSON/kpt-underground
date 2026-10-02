// H05 measurement contract (run: node --test tests/store/measurement-contract.test.mjs).
// Static checks only: nothing here loads a collector or sends data anywhere.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { buildEvent, scrub, track } from "../../src/lib/analytics.ts";
import { parseCatalogPage } from "../../src/lib/store/core.ts";

const root = path.resolve(import.meta.dirname, "../..");
const read = (rel) => fs.readFileSync(path.join(root, rel), "utf8");
const contract = JSON.parse(read("docs/measurement-contract.json"));
const fixture = JSON.parse(read("tests/store/fixtures/public-catalog-2026-10-02.json"));

/* ------------------------------------------------------------------ source scanning helpers */

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return walk(p);
    return /\.(ts|tsx)$/.test(e.name) ? [p] : [];
  });
}
const srcFiles = walk(path.join(root, "src")).map((p) => path.relative(root, p).split(path.sep).join("/"));
const ANALYTICS = "src/lib/analytics.ts";

/** Splits call arguments at top level (aware of (), {}, [], quotes and template literals). */
function splitArgs(text) {
  const out = [];
  let depth = 0, cur = "", i = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '"' || c === "'" || c === "`") {
      let j = i + 1;
      while (j < text.length && text[j] !== c) j += text[j] === "\\" ? 2 : 1;
      cur += text.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if ("({[".includes(c)) depth++;
    if (")}]".includes(c)) depth--;
    if (c === "," && depth === 0) {
      out.push(cur.trim());
      cur = "";
    } else cur += c;
    i++;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** Every track()/trackOnce() call outside analytics.ts: { file, line, fn, event, args, text }. */
function callSites() {
  const sites = [];
  for (const file of srcFiles) {
    if (file === ANALYTICS) continue;
    const text = read(file);
    for (const m of text.matchAll(/\b(trackOnce|track)\(/g)) {
      let depth = 1, i = m.index + m[0].length;
      const start = i;
      while (i < text.length && depth > 0) {
        const c = text[i];
        if (c === '"' || c === "'" || c === "`") {
          i++;
          while (i < text.length && text[i] !== c) i += text[i] === "\\" ? 2 : 1;
        } else if (c === "(") depth++;
        else if (c === ")") depth--;
        i++;
      }
      const args = splitArgs(text.slice(start, i - 1));
      const eventArg = m[1] === "trackOnce" ? args[1] : args[0];
      const lit = /^["']([a-z_]+)["']$/.exec(eventArg ?? "");
      sites.push({
        file,
        line: text.slice(0, m.index).split("\n").length,
        fn: m[1],
        event: lit ? lit[1] : null,
        eventArg,
        args,
        text: text.slice(start, i - 1),
      });
    }
  }
  return sites;
}
const sites = callSites();

function stripComments(code) {
  return code.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
}

function unionMembers() {
  const m = /export type ShopEvent\s*=([^;]+);/.exec(read(ANALYTICS));
  assert.ok(m, "ShopEvent union not found in analytics.ts");
  return [...m[1].matchAll(/"([a-z_]+)"/g)].map((x) => x[1]);
}

/* ------------------------------------------------------------------ contract vs adapter vs call sites */

test("contract: status is design-only and nothing claims a verified collector", () => {
  assert.equal(contract.status, "DESIGN_ONLY_NOT_CONFIGURED");
  assert.equal(contract.collector.configured, false);
  for (const k of ["collectorReceives", "crossDomain", "consent", "purchase", "idReconciliation"]) {
    assert.equal(contract.verification[k], "NOT_RUN", k);
  }
});

test("contract: events emitted today equal the ShopEvent union exactly", () => {
  const union = unionMembers();
  assert.equal(new Set(union).size, union.length, "duplicate union members");
  const emitted = contract.events.filter((e) => e.emittedToday === true).map((e) => e.name);
  assert.deepEqual([...emitted].sort(), [...union].sort());
  assert.equal(emitted.length, 8);
  for (const name of ["hero_shop_click", "purchase"]) {
    const e = contract.events.find((x) => x.name === name);
    assert.ok(e, `${name} missing from contract`);
    assert.equal(e.emittedToday, false, `${name} must not be emitted today`);
    assert.ok(!union.includes(name), `${name} must not be in the ShopEvent union`);
  }
  assert.equal(new Set(contract.events.map((e) => e.name)).size, contract.events.length, "duplicate event names in contract");
});

test("call sites: every track()/trackOnce() uses a literal event name, and the set equals the emitted events", () => {
  assert.ok(sites.length >= 10, `expected at least 10 call sites, found ${sites.length}`);
  for (const s of sites) assert.ok(s.event, `${s.file}:${s.line} has a non-literal event name (${s.eventArg})`);
  const found = new Set(sites.map((s) => s.event));
  const emitted = contract.events.filter((e) => e.emittedToday).map((e) => e.name);
  assert.deepEqual([...found].sort(), [...emitted].sort());
  const union = new Set(unionMembers());
  for (const s of sites) assert.ok(union.has(s.event), `${s.file}:${s.line} emits ${s.event}, not in union`);
});

test("call sites: contract callSites list the same files as the code (line numbers are informational)", () => {
  for (const e of contract.events) {
    const want = e.callSites.map((c) => c.split(":")[0]).sort();
    const have = sites.filter((s) => s.event === e.name).map((s) => s.file).sort();
    assert.deepEqual(have, want, `${e.name} call-site files drifted`);
  }
});

test("call sites: every site that sends items sends item_id; exempt events are exactly the contract's itemsSentToday=false", () => {
  for (const s of sites) {
    const e = contract.events.find((x) => x.name === s.event);
    const hasItems = /\bitems\s*:/.test(s.text);
    assert.equal(hasItems, e.itemsSentToday, `${s.file}:${s.line} ${s.event}: items presence differs from contract`);
    if (hasItems) {
      assert.match(s.text, /\bitem_id\s*:/, `${s.file}:${s.line} ${s.event} sends items without item_id`);
    }
  }
  // Reported gap, not a pass: these emitted events carry no item_id today.
  const exempt = contract.events.filter((e) => e.emittedToday && !e.itemsSentToday).map((e) => e.name).sort();
  assert.deepEqual(exempt, ["checkout_error", "checkout_redirect"]);
});

test("call sites: item_id comes from the product/line slug", () => {
  for (const s of sites.filter((x) => /\bitem_id\s*:/.test(x.text))) {
    for (const m of s.text.matchAll(/\bitem_id\s*:\s*([^,}]+)/g)) {
      assert.match(m[1].trim(), /\.slug$/, `${s.file}:${s.line} item_id is not a slug (${m[1].trim()})`);
    }
  }
});

test("units: money is divided by 100 exactly once and value always travels with currency", () => {
  for (const s of sites) {
    for (const m of s.text.matchAll(/\b(price|value)\s*:\s*([^,}\]]+)/g)) {
      assert.match(m[2], /\/\s*100\b/, `${s.file}:${s.line} ${m[1]} is not cents / 100 (${m[2].trim()})`);
    }
    if (/\bvalue\s*:/.test(s.text)) assert.match(s.text, /currency\s*:\s*"USD"/, `${s.file}:${s.line} value without currency USD`);
  }
  for (const file of srcFiles) {
    const code = stripComments(read(file));
    assert.doesNotMatch(code, /\/\s*100\s*\/\s*100|\/\s*10000\b/, `${file} divides cents twice`);
  }
});

test("purchase is never emitted from src/ (calls, event payloads, union, literals)", () => {
  assert.ok(!unionMembers().includes("purchase"), "purchase in ShopEvent union");
  for (const s of sites) assert.notEqual(s.event, "purchase", `${s.file}:${s.line} emits purchase`);
  for (const file of srcFiles) {
    const code = stripComments(read(file));
    assert.doesNotMatch(code, /event\s*:\s*["'`]purchase["'`]/, `${file} builds a purchase event object`);
    assert.doesNotMatch(code, /["'`]purchase["'`]/, `${file} contains a "purchase" string literal`);
    assert.doesNotMatch(code, /\btransaction_id\b/, `${file} references transaction_id`);
  }
});

test("no vendor script or collector is wired in src/ (dataLayer only)", () => {
  for (const file of srcFiles) {
    const code = stripComments(read(file));
    assert.doesNotMatch(code, /googletagmanager|google-analytics|\bgtag\s*\(|posthog|plausible|fbq\s*\(|connect\.facebook\.net|analytics\.tiktok/i, `${file} references a collector`);
  }
});

/* ------------------------------------------------------------------ scrub / privacy */

test("scrub removes email/address/phone/token/cookie/card keys at any depth, in arrays too", () => {
  const dirty = {
    currency: "USD",
    value: 12,
    email: "a@b.co",
    customer_email: "a@b.co",
    shipping_address: "x",
    address: "x",
    phone: "1",
    phone_number: "1",
    api_token: "t",
    token: "t",
    cookie: "c",
    cookies: "c",
    card: "4111",
    card_number: "4111",
    nested: { Email: "a@b.co", item_id: "ok", deeper: [{ phone: "1", item_id: "ok2" }] },
    items: [{ item_id: "kpt-beanie", price: 1, address_line1: "x" }],
  };
  const out = scrub(dirty);
  const keys = [];
  (function collect(o) {
    if (Array.isArray(o)) return o.forEach(collect);
    if (o && typeof o === "object") {
      for (const [k, v] of Object.entries(o)) {
        keys.push(k);
        collect(v);
      }
    }
  })(out);
  for (const bad of contract.forbiddenParams.keysRequiredForbiddenByContract) {
    assert.ok(!keys.some((k) => k.toLowerCase().includes(bad)), `scrub left a key containing ${bad}: ${keys.filter((k) => k.toLowerCase().includes(bad))}`);
  }
  assert.equal(out.currency, "USD");
  assert.equal(out.value, 12);
  assert.equal(out.items[0].item_id, "kpt-beanie");
  assert.equal(out.nested.item_id, "ok");
  assert.equal(out.nested.deeper[0].item_id, "ok2");
});

test("scrub redacts string values that look like an email or a payment token", () => {
  assert.equal(scrub("someone@example.com"), "[redacted]");
  assert.equal(scrub("ptkn_abc123"), "[redacted]");
  assert.deepEqual(scrub({ note: "mail me@x.io", reason: "NETWORK" }), { note: "[redacted]", reason: "NETWORK" });
});

test("buildEvent keeps the event name and scrubs params", () => {
  const e = buildEvent("add_to_cart", { currency: "USD", value: 5, email: "a@b.co", items: [{ item_id: "kpt-beanie", token: "t" }] });
  assert.deepEqual(e, { event: "add_to_cart", currency: "USD", value: 5, items: [{ item_id: "kpt-beanie" }] });
});

test("track pushes to dataLayer only, and a broken or blocked dataLayer never throws (shopping is never broken)", () => {
  const saved = globalThis.window;
  try {
    globalThis.window = { dataLayer: [] };
    track("view_item", { currency: "USD", value: 1, items: [{ item_id: "x" }], email: "a@b.co" });
    assert.equal(globalThis.window.dataLayer.length, 1);
    assert.equal(globalThis.window.dataLayer[0].event, "view_item");
    assert.equal("email" in globalThis.window.dataLayer[0], false);
    globalThis.window = { dataLayer: Object.freeze([]) };
    assert.doesNotThrow(() => track("add_to_cart", { items: [{ item_id: "x" }] }));
    globalThis.window = { get dataLayer() { throw new Error("blocked"); } };
    assert.doesNotThrow(() => track("begin_checkout", { items: [{ item_id: "x" }] }));
  } finally {
    if (saved === undefined) delete globalThis.window;
    else globalThis.window = saved;
  }
});

/* ------------------------------------------------------------------ id map vs fixture */

test("id map: contract matches the raw fixture (22 offers, 55 variants, ids and slugs)", () => {
  const raw = fixture.results.map((p) => ({ slug: p.slug, offerId: p.id, variantIds: p.variants.map((v) => v.id) }));
  assert.equal(raw.length, 22);
  assert.equal(raw.reduce((n, p) => n + p.variantIds.length, 0), 55);
  assert.equal(contract.idMap.productCount, 22);
  assert.equal(contract.idMap.variantCount, 55);
  assert.deepEqual(contract.idMap.products, raw);
  assert.equal(new Set(raw.map((p) => p.slug)).size, raw.length, "slugs are unique");
  assert.equal(new Set(raw.flatMap((p) => p.variantIds)).size, 55, "variant ids are unique");
  assert.equal(contract.idMap.reconciliation, "NOT_RUN");
  assert.match(contract.idMap.note, /may differ/);
});

test("id map: the normalized catalog the site uses yields the same slug, offer id and variant ids", () => {
  const { products } = parseCatalogPage(fixture);
  const local = products.map((p) => ({ slug: p.slug, offerId: p.id, variantIds: p.variants.map((v) => v.id) }));
  assert.deepEqual(local, contract.idMap.products);
});
