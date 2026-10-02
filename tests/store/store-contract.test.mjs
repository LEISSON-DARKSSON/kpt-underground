// KPT-01/02/03/04/06/07/08/09/12/14 regressions (run: npm run test:store).
// Fixture = read-only Storefront snapshot of the live public catalog (real offer/variant ids and prices).
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

import {
  MAX_LINES, choiceKind, choiceLabel, fitStatus, galleryFor, groupModels, normalizeProduct, parseCatalogPage, priceChanges,
  resolveVariantParam, sameOrigin, validateAgainstCatalog, validateCheckoutLines, UpstreamShapeError,
} from "../../src/lib/store/core.ts";
import {
  CATEGORIES, STUDIO_PICKS, displayName, filterByCategory, keyAttribute, searchProducts, sortForShop, studioPicks, unclassified,
} from "../../src/lib/store/merchandising.ts";
import { addLine, applyPriceChanges, checkoutBody, parseStoredCart } from "../../src/lib/store/cart-model.ts";
import { buildEvent, scrub } from "../../src/lib/analytics.ts";
import { productJsonLd, productJsonLdObject } from "../../src/lib/store/seo.ts";

const root = new URL("../../", import.meta.url);
const fixture = JSON.parse(await readFile(new URL("tests/store/fixtures/public-catalog-2026-10-02.json", root), "utf8"));
const { products: catalog } = parseCatalogPage(fixture);
const bySlug = (s) => catalog.find((p) => p.slug === s);
const tee = bySlug("kpt-heavyweight-tee");
const phone = bySlug("kpt-magsafe-tough-case");
const mat = bySlug("keep-it-underground-signal-01-desk-mat");
const clone = (o) => JSON.parse(JSON.stringify(o));
const rawOf = (slug) => clone(fixture.results.find((p) => p.slug === slug));

/* ---------------------------------------------------------------- KPT-00 / A01 catalog snapshot */

test("A01: the whole public snapshot normalizes — 22 offers, 55 variants, nothing dropped", () => {
  const page = parseCatalogPage(fixture);
  assert.equal(page.products.length, 22);
  assert.equal(page.dropped, 0);
  assert.equal(page.products.reduce((n, p) => n + p.variants.length, 0), 55);
  assert.equal(new Set(page.products.map((p) => p.id)).size, 22, "no duplicate offer ids");
  for (const p of page.products) for (const v of p.variants) assert.equal(v.currency, "USD");
});

/* ---------------------------------------------------------------- KPT-03/04 upstream contract */

test("A03: malformed upstream is an error, never an empty or available catalog", () => {
  for (const bad of [null, {}, { results: null }, { results: "x" }, []]) {
    assert.throws(() => parseCatalogPage(bad), (e) => e instanceof UpstreamShapeError);
  }
  assert.deepEqual(parseCatalogPage({ results: [], paging: { hasNextPage: false } }).products, [], "a real empty shop stays empty");
  const r = rawOf("signal-studio-tote");
  assert.equal(normalizeProduct({ ...r, variants: r.variants.map((v) => ({ ...v, unitPrice: { value: 29, currency: "EUR" } })) }), null, "foreign currency");
  assert.equal(normalizeProduct({ ...r, variants: r.variants.map((v) => ({ ...v, unitPrice: { value: 29 } })) }), null, "missing currency is not assumed USD");
  assert.equal(normalizeProduct({ ...r, variants: r.variants.map((v) => ({ ...v, unitPrice: { value: "abc", currency: "USD" } })) }), null);
  assert.equal(normalizeProduct({ ...r, access: { type: "SOMETHING_NEW" } }), null, "unknown visibility is not public");
  assert.equal(normalizeProduct({ ...r, access: { type: "HIDDEN" } }), null);
  assert.equal(normalizeProduct({ ...r, variants: r.variants.map((v) => ({ ...v, stock: { type: "WEIRD" } })) }).available, false, "unknown stock state fails closed");
  assert.equal(normalizeProduct({ ...r, variants: r.variants.map((v) => ({ ...v, stock: { type: "LIMITED", inStock: 0 } })) }).available, false);
  assert.equal(normalizeProduct({ ...r, variants: r.variants.map((v) => ({ ...v, stock: { type: "LIMITED", inStock: 3 } })) }).available, true);
});

test("A07: cached-available but now out of stock → not sellable, and the from-price ignores sold-out variants", () => {
  const raw = rawOf("kpt-heavyweight-tee");
  raw.variants = raw.variants.map((v) => (v.attributes.size.name === "S" ? { ...v, stock: { type: "OUT_OF_STOCK" } } : v));
  const live = normalizeProduct(raw);
  const s = tee.variants.find((v) => v.size === "S");
  assert.throws(() => validateCheckoutLines({ items: [{ variantId: s.id, quantity: 1 }] }, [live]), /VARIANT_UNAVAILABLE/);
  // all sizes sold out except 4XL → "from" is the real buyable price, not the cheaper sold-out one
  raw.variants = raw.variants.map((v) => (v.attributes.size.name === "4XL" ? v : { ...v, stock: { type: "OUT_OF_STOCK" } }));
  assert.equal(normalizeProduct(raw).priceFromCents, 4100);
});

test("A05/A06: one fresh read for a just-published variant; a truly invalid one is rejected, no retry storm", async () => {
  const s = tee.variants[0];
  let fresh = 0;
  const lines = await validateAgainstCatalog({ items: [{ variantId: s.id, quantity: 1 }] }, async () => [mat], async () => { fresh++; return catalog; });
  assert.deepEqual(lines, [{ variantId: s.id, quantity: 1 }]);
  assert.equal(fresh, 1);
  await assert.rejects(validateAgainstCatalog({ items: [{ variantId: "00000000-0000-4000-8000-000000000000", quantity: 1 }] }, async () => catalog, async () => { fresh++; return catalog; }), /UNKNOWN_VARIANT/);
  assert.equal(fresh, 2, "exactly one fresh read per checkout attempt");
});

test("A08: repeated rows add up; above 10 is refused (never silently reduced); 21 lines refused", () => {
  const id = mat.variants[0].id;
  assert.deepEqual(validateCheckoutLines({ items: [{ variantId: id, quantity: 4 }, { variantId: id, quantity: 6 }] }, catalog), [{ variantId: id, quantity: 10 }]);
  assert.throws(() => validateCheckoutLines({ items: [{ variantId: id, quantity: 6 }, { variantId: id, quantity: 5 }] }, catalog), /INVALID_QUANTITY/);
  assert.throws(() => validateCheckoutLines({ items: [{ variantId: id, quantity: 11 }] }, catalog), /INVALID_QUANTITY/);
  const many = catalog.flatMap((p) => p.variants).slice(0, MAX_LINES + 1).map((v) => ({ variantId: v.id, quantity: 1 }));
  assert.throws(() => validateCheckoutLines({ items: many }, catalog), /INVALID_ITEM_COUNT/);
});

test("A04/A10: client price/name fields never change the platform line; a stale display price is reported", () => {
  const v = tee.variants.find((x) => x.size === "4XL");
  const body = { items: [{ variantId: v.id, quantity: 1, priceCents: 1, name: "free", expectedCents: 3500 }] };
  assert.deepEqual(validateCheckoutLines(body, catalog), [{ variantId: v.id, quantity: 1 }]);
  assert.deepEqual(priceChanges(body, catalog), [{ variantId: v.id, unitCents: 4100 }]);
  assert.deepEqual(priceChanges({ items: [{ variantId: v.id, quantity: 1, expectedCents: 4100 }] }, catalog), []);
});

test("checkout origin check refuses foreign and malformed Origin headers instead of crashing", () => {
  assert.equal(sameOrigin("https://keepitunderground.com", "keepitunderground.com"), true);
  assert.equal(sameOrigin("https://evil.example", "keepitunderground.com"), false);
  assert.equal(sameOrigin("null", "keepitunderground.com"), false);
  assert.equal(sameOrigin("::::", "keepitunderground.com"), false);
  assert.equal(sameOrigin(null, "keepitunderground.com"), true);
});

/* ---------------------------------------------------------------- KPT-01 deliberate choice */

test("KPT-01: size/model products need a choice; single-variant products do not", () => {
  assert.equal(choiceKind(tee), "size");
  assert.equal(choiceKind(bySlug("kpt-premium-hoodie")), "size");
  assert.equal(choiceKind(bySlug("kpt-crewneck")), "size");
  assert.equal(choiceKind(phone), "model");
  assert.equal(choiceKind(mat), "none");
  for (const p of catalog) if (p.variants.length === 1) assert.equal(choiceKind(p), "none", p.slug);
});

test("A09/B04: the shown size, price and sent variant id are the same Fourthwall variant", () => {
  const xl4 = tee.variants.find((v) => v.size === "4XL");
  assert.equal(xl4.id, "13698b07-9fb3-4500-9fe0-afe48a36e003");
  assert.equal(xl4.priceCents, 4100);
  assert.equal(choiceLabel(tee, xl4), "4XL");
  for (const size of ["S", "M", "L", "XL"]) assert.equal(tee.variants.find((v) => v.size === size).priceCents, 3500);
  assert.deepEqual(checkoutBody([{ variantId: xl4.id, slug: tee.slug, name: tee.name, variantLabel: xl4.label, unitCents: xl4.priceCents, image: null, qty: 1 }]).items, [{ variantId: xl4.id, quantity: 1, expectedCents: 4100 }]);
});

test("B05: all 18 phone models are offered, grouped newest first, each with its own id and $29", () => {
  const groups = groupModels(phone.variants);
  assert.equal(groups.flatMap((g) => g.variants).length, 18);
  assert.equal(groups[0].group, "iPhone 18");
  assert.deepEqual(groups.map((g) => g.group), ["iPhone 18", "iPhone 17", "iPhone 16", "iPhone 15", "iPhone 14"]);
  assert.equal(new Set(phone.variants.map((v) => v.id)).size, 18);
  for (const v of phone.variants) assert.equal(v.priceCents, 2900);
});

test("?variant= preselects only this product's own available variant", () => {
  const xl = tee.variants.find((v) => v.size === "XL");
  assert.equal(resolveVariantParam(tee, xl.id)?.id, xl.id);
  assert.equal(resolveVariantParam(tee, phone.variants[0].id), null, "another product's id");
  assert.equal(resolveVariantParam(tee, "../../etc"), null);
  assert.equal(resolveVariantParam(tee, null), null);
});

/* ---------------------------------------------------------------- KPT-08 gallery ↔ selection */

test("KPT-08: a phone model shows its own images; apparel sizes share the product gallery (labelled general)", () => {
  const m = phone.variants.find((v) => v.size === "iPhone 15 Pro");
  const g = galleryFor(phone, m);
  assert.equal(g.specific, true);
  assert.ok(g.images.length >= 1 && g.images.length < phone.images.length);
  assert.deepEqual(g.images.map((i) => i.id), m.imageIds);
  assert.equal(galleryFor(phone, null).specific, false);
  assert.equal(galleryFor(tee, tee.variants[0]).specific, false);
});

/* ---------------------------------------------------------------- KPT-02 fit coverage report */

test("KPT-02: fit info comes from Fourthwall; missing apparel measurements are reported, not generated", () => {
  const missing = catalog.filter((p) => fitStatus(p).missing).map((p) => p.slug).sort();
  // Snapshot 2026-10-02: Fourthwall has no SIZE_AND_FIT section / sizeGuide for these three.
  assert.deepEqual(missing, ["kpt-crewneck", "kpt-heavyweight-tee", "kpt-premium-hoodie"]);
  for (const s of ["kpt-crew-socks", "kpt-beanie", "offline-embroidered-beanie", "transit-signal-laptop-sleeve", "transit-subsurface-laptop-sleeve"]) {
    const f = fitStatus(bySlug(s));
    assert.equal(f.needsFit, true, s);
    assert.ok(f.fit && f.fit.html.length > 0, `${s} has a published Size & Fit section`);
  }
  assert.equal(fitStatus(phone).missing, false, "phone case fit = model choice");
  for (const p of catalog) {
    const sec = p.sections.find((s) => s.type === "GUARANTEE_AND_RETURNS");
    assert.ok(sec, `${p.slug} carries the quality/returns section`);
    assert.equal(/style=|<span|<a /.test(p.sections.map((s) => s.html).join("")), false, "section HTML is sanitized");
  }
});

/* ---------------------------------------------------------------- KPT-06/07 merchandising */

test("KPT-06: four categories cover all 22 offers exactly once; unknown public products stay under All", () => {
  assert.deepEqual(CATEGORIES.map((c) => c.label), ["Desk & Studio", "Wear", "Carry", "Wall Art"]);
  const counts = CATEGORIES.map((c) => filterByCategory(catalog, c.key).length);
  assert.deepEqual(counts, [9, 6, 5, 2]);
  const ids = CATEGORIES.flatMap((c) => filterByCategory(catalog, c.key).map((p) => p.id));
  assert.equal(ids.length, 22);
  assert.equal(new Set(ids).size, 22);
  assert.deepEqual(unclassified(catalog), []);
  const newcomer = normalizeProduct({ ...rawOf("signal-studio-tote"), id: "99999999-9999-4999-8999-999999999999", slug: "brand-new-thing" });
  assert.equal(unclassified([...catalog, newcomer]).length, 1);
  assert.equal(filterByCategory([...catalog, newcomer], null).length, 23, "All shows it");
});

test("KPT-06: Studio picks = six live offers in editorial order; missing ids are ignored, not invented", () => {
  assert.equal(STUDIO_PICKS.length, 6);
  assert.deepEqual(studioPicks(catalog).map((p) => p.slug), [
    "keep-it-underground-signal-01-desk-mat", "keep-it-underground-subsurface-desk-mat", "kpt-heavyweight-tee",
    "signal-studio-tote", "night-shift-studio-mug", "project-notes-signal-01",
  ]);
  assert.equal(studioPicks(catalog.filter((p) => p.slug !== "kpt-heavyweight-tee")).length, 5);
});

test("KPT-06: search and price sort", () => {
  assert.deepEqual(searchProducts(catalog, "desk mat").map((p) => p.slug).sort(), ["keep-it-underground-signal-01-desk-mat", "keep-it-underground-subsurface-desk-mat"]);
  assert.ok(searchProducts(catalog, "mug").some((p) => p.slug === "night-shift-studio-mug"));
  const asc = sortForShop(catalog, "price-asc").map((p) => p.priceFromCents);
  assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
  assert.equal(sortForShop(catalog, "featured")[0].slug, catalog[0].slug);
});

test("KPT-07: cards say what the object is", () => {
  assert.equal(displayName("KEEP IT UNDERGROUND Signal 01 Desk Mat"), "Signal 01 Desk Mat");
  assert.equal(displayName("KPT - Heavyweight Tee"), "Heavyweight Tee");
  assert.equal(displayName("SIGNAL - Studio Tote"), "SIGNAL - Studio Tote");
  assert.equal(keyAttribute(mat), '15.5" × 31.5"');
  assert.equal(keyAttribute(tee), "S–4XL");
  assert.equal(keyAttribute(phone), "18 phone models");
  assert.equal(keyAttribute(bySlug("signal-studio-tote")), null, "'One size' is not a decisive attribute");
});

/* ---------------------------------------------------------------- KPT-14 cart snapshot */

test("KPT-14: stored cart — corrupt JSON, wrong shapes and bad rows are dropped without losing good rows", () => {
  const good = { variantId: mat.variants[0].id, slug: mat.slug, name: mat.name, variantLabel: "x", unitCents: 3400, image: null, qty: 2 };
  assert.deepEqual(parseStoredCart("{not json"), []);
  assert.deepEqual(parseStoredCart('{"a":1}'), []);
  assert.deepEqual(parseStoredCart(null), []);
  const parsed = parseStoredCart(JSON.stringify([good, { ...good, variantId: "nope" }, { ...good, variantId: tee.variants[0].id, unitCents: "35" }, { ...good, variantId: tee.variants[1].id, qty: 99 }, 7]));
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].qty, 2);
  assert.equal(parsed[1].qty, 10, "qty clamped to the limit");
  assert.equal(parseStoredCart(JSON.stringify([{ ...good, image: { url: "javascript:x", width: 1, height: 1 } }]))[0].image, null);
});

test("KPT-14 / B10: the 21st distinct item is refused, never by dropping an earlier line", () => {
  let lines = [];
  const vs = catalog.flatMap((p) => p.variants.map((v) => ({ p, v })));
  for (const { p, v } of vs.slice(0, 20)) lines = addLine(lines, { variantId: v.id, slug: p.slug, name: p.name, variantLabel: v.label, unitCents: v.priceCents, image: null }, 1).lines;
  assert.equal(lines.length, 20);
  const { p, v } = vs[20];
  const r = addLine(lines, { variantId: v.id, slug: p.slug, name: p.name, variantLabel: v.label, unitCents: v.priceCents, image: null }, 1);
  assert.equal(r.result, "line-limit");
  assert.equal(r.lines, lines, "unchanged");
  const first = lines[0];
  assert.equal(addLine(lines, { ...first }, 15).result, "capped");
  assert.equal(addLine(lines, { ...first }, 15).lines[0].qty, 10);
});

test("KPT-14: a server price change updates the display snapshot only for that line", () => {
  const a = { variantId: tee.variants[0].id, slug: "a", name: "a", variantLabel: "", unitCents: 3300, image: null, qty: 1 };
  const b = { ...a, variantId: tee.variants[1].id };
  const next = applyPriceChanges([a, b], [{ variantId: a.variantId, unitCents: 3500 }, { variantId: b.variantId, unitCents: -1 }]);
  assert.deepEqual(next.map((l) => l.unitCents), [3500, 3300]);
});

/* ---------------------------------------------------------------- KPT-09 measurement */

test("KPT-09: events carry ids/prices only — no PII or secrets; no purchase event exists in the browser code", async () => {
  const e = buildEvent("add_to_cart", { currency: "USD", email: "a@b.c", items: [{ item_id: "x", address: "street", note: "me@x.com" }], token: "ptkn_abc" });
  assert.deepEqual(e, { event: "add_to_cart", currency: "USD", items: [{ item_id: "x", note: "[redacted]" }] });
  assert.equal(scrub("ptkn_123"), "[redacted]");
  const files = [];
  async function walk(u) {
    for (const d of await readdir(u, { withFileTypes: true })) {
      const n = new URL(d.name + (d.isDirectory() ? "/" : ""), u);
      if (d.isDirectory()) await walk(n); else if (/\.tsx?$/.test(d.name)) files.push(n);
    }
  }
  await walk(new URL("src/", root));
  for (const f of files) {
    const src = await readFile(f, "utf8");
    assert.equal(/track\(\s*"purchase"|event:\s*"purchase"/.test(src), false, `${f.pathname} must not emit purchase from the browser`);
  }
});

/* ---------------------------------------------------------------- KPT-12 structured data */

test("KPT-12: JSON-LD price/currency/availability match the normalized product; no invented reviews", () => {
  const t = productJsonLdObject(tee, "https://keepitunderground.com");
  assert.equal(t.offers["@type"], "AggregateOffer");
  assert.equal(t.offers.lowPrice, "35.00");
  assert.equal(t.offers.highPrice, "41.00");
  assert.equal(t.offers.priceCurrency, "USD");
  const m = productJsonLdObject(mat, "https://keepitunderground.com");
  assert.equal(m.offers["@type"], "Offer");
  assert.equal(m.offers.price, "34.00");
  assert.equal(m.url, "https://keepitunderground.com/shop/keep-it-underground-signal-01-desk-mat");
  for (const x of [t, m]) assert.equal("aggregateRating" in x || "review" in x || "gtin" in x, false);
  const evil = { ...mat, name: "</script><script>alert(1)</script>" };
  assert.equal(productJsonLd(evil, "https://k").includes("</script>"), false);
});

/* ---------------------------------------------------------------- source guards */

test("KPT-03: the product page no longer turns every upstream error into notFound()", async () => {
  const page = await readFile(new URL("src/app/shop/[slug]/page.tsx", root), "utf8");
  assert.equal(/catch\s*\{\s*return null;?\s*\}/.test(page), false);
  const fw = await readFile(new URL("src/lib/store/fourthwall.ts", root), "utf8");
  assert.ok(/res\.status === 404\) return null/.test(fw), "only 404 means not found");
  const { existsSync } = await import("node:fs");
  assert.ok(existsSync(new URL("src/app/shop/[slug]/error.tsx", root)), "temporary-failure boundary exists");
  // A root/shop loading.tsx flushes a 200 shell before the product is resolved (soft 404, seen live 2026-10-02).
  for (const f of ["src/app/loading.tsx", "src/app/shop/loading.tsx", "src/app/shop/[slug]/loading.tsx"]) assert.equal(existsSync(new URL(f, root)), false, f);
  const cfg = await readFile(new URL("next.config.ts", root), "utf8");
  assert.ok(/htmlLimitedBots:\s*\/\.\*\//.test(cfg), "metadata resolves before streaming so status can be 404/5xx");
});

test("content gate: no unproven delivery, free-shipping, bestseller or review claims in shop UI", async () => {
  const dirs = ["src/components/store/", "src/app/shop/", "src/app/help/", "src/lib/store/"];
  for (const d of dirs) {
    for (const f of await readdir(new URL(d, root), { recursive: true })) {
      if (!/\.tsx?$/.test(f)) continue;
      const src = await readFile(new URL(d + f, root), "utf8");
      const text = src.split("\n").filter((l) => !/^\s*(\*|\/\/|\/\*)/.test(l)).join("\n");
      assert.equal(/free shipping|bestseller|best seller|ships in \d|delivered in \d|\d+\s*(?:business )?days? delivery|★|aggregateRating/i.test(text), false, `${d}${f}`);
    }
  }
});
