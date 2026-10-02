// H04: source-backed size charts. Numbers come from the supplier guide; the code never generates measurements.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { dropCheckoutModelPrompt, fitStatus, normalizeProduct, parseCatalogPage } from "../../src/lib/store/core.ts";
import { FIT_SOURCES, fitSourceFor } from "../../src/lib/store/fit-sources.ts";
import { heroProduct, studioPicks } from "../../src/lib/store/merchandising.ts";

const TEE = "6c250dd6-5ebd-4a75-a9a5-d1bc584f177f";
const catalog = async () => {
  const data = JSON.parse(await readFile(new URL("./fixtures/public-catalog-2026-10-02.json", import.meta.url), "utf8"));
  return parseCatalogPage(data).products;
};

test("heavyweight tee gets a sourced chart that has a row for every size it sells", async () => {
  const tee = (await catalog()).find((p) => p.id === TEE);
  assert.ok(tee, "tee is in the public catalog fixture");
  const st = fitStatus(tee);
  assert.equal(st.missing, false);
  assert.equal(st.fit, null, "Fourthwall publishes no SIZE_AND_FIT for the tee");
  assert.ok(st.source, "source-backed chart is used");
  const rowSizes = st.source.rows.map((r) => r.size);
  assert.deepEqual(tee.variants.map((v) => v.size), rowSizes, "table sizes equal the variant sizes, in order");
});

test("chart integrity: unit, base model, source and no empty or zero cells", () => {
  for (const s of FIT_SOURCES) {
    assert.equal(s.unit, "in");
    assert.match(s.baseModel, /Comfort Colors 1717/);
    assert.ok(s.sources.length >= 2, "manufacturer sheet and the shop page are both cited");
    assert.ok(s.sources.some((x) => /SpecSheetMeasurements_1717\.pdf$/.test(x.url)), "manufacturer spec sheet cited");
    assert.ok(s.sources.some((x) => x.url === "https://keepitunderground-shop.fourthwall.com/products/kpt-heavyweight-tee"), "the shop's own product page cited");
    for (const x of s.sources) assert.match(x.retrieved, /^\d{4}-\d{2}-\d{2}$/);
    for (const r of s.rows) {
      assert.equal(r.values.length, s.columns.length, `${r.size}: one value per column`);
      for (const v of r.values) assert.match(v, /^[1-9]\d*(\.\d+)?(-[1-9]\d*)?"$/, `${r.size}: "${v}" is a published inch value or range, never 0 or blank`);
    }
    assert.ok(s.columns.every((c) => c.how.length > 20), "every column says how it was measured");
    assert.ok(s.columns.every((c) => c.kind === "garment" || c.kind === "body"), "every column is declared garment or body");
    assert.ok(s.notes.some((n) => /flat garment measurements, not body measurements/i.test(n)), "garment vs body is stated");
  }
});

// Comfort Colors 1717 "PRODUCT MEASUREMENTS" read from the manufacturer's spec sheet on 2026-10-02 (fractions as printed).
const CC = {
  length: [26 + 5 / 8, 28, 29 + 3 / 8, 30 + 3 / 4, 31 + 5 / 8, 32 + 1 / 2, 33 + 1 / 2],
  chest: [18 + 1 / 4, 20 + 1 / 4, 22, 24, 26, 27 + 3 / 4, 29 + 3 / 4],
  sleeve: [16 + 1 / 4, 17 + 3 / 4, 19, 20 + 1 / 2, 21 + 3 / 4, 23 + 1 / 4, 24 + 5 / 8],
  body: ['36-37"', '38-40"', '42-44"', '46-48"', '50-52"', '54-56"', '58-60"'],
};

test("every number equals the manufacturer's spec sheet (fractions as printed, shop rounding to 2 decimals allowed)", () => {
  const tee = fitSourceFor(TEE);
  const col = (key) => tee.rows.map((r) => r.values[tee.columns.findIndex((c) => c.key === key)]);
  for (const key of ["length", "chest", "sleeve"]) {
    col(key).forEach((v, i) => assert.ok(Math.abs(Number(v.replace('"', "")) - CC[key][i]) <= 0.01, `${key} ${tee.rows[i].size}: ${v} vs ${CC[key][i]}`));
  }
  assert.deepEqual(col("body-chest"), CC.body);
});

test("column definitions are the ones that match the numbers (sleeve is from center back, not from the set-in sleeve)", () => {
  const tee = fitSourceFor(TEE);
  const how = (k) => tee.columns.find((c) => c.key === k).how;
  assert.match(how("sleeve"), /center back neck to shoulder point to sleeve hem/i);
  assert.doesNotMatch(how("sleeve"), /set-in sleeve/i);
  assert.match(how("length"), /high point shoulder to finished hem at back/i);
  assert.match(how("chest"), /one inch below the armhole when laid flat/i);
  assert.equal(tee.columns.find((c) => c.key === "body-chest").kind, "body");
});

test("rows grow monotonically with size (catches a transposed or mistyped cell)", () => {
  const tee = fitSourceFor(TEE);
  tee.columns.forEach((c, k) => {
    const col = tee.rows.map((r) => Number(r.values[k].replace('"', "").split("-")[0]));
    for (let i = 1; i < col.length; i++) assert.ok(col[i] > col[i - 1], `${c.label}: ${tee.rows[i].size} > ${tee.rows[i - 1].size}`);
  });
});

test("a partial size run never produces a partial table; missing stays honest", async () => {
  const tee = (await catalog()).find((p) => p.id === TEE);
  const partial = { ...tee, variants: [...tee.variants, { ...tee.variants[0], id: "11111111-1111-4111-8111-111111111111", size: "5XL" }] };
  const st = fitStatus(partial);
  assert.equal(st.source, null);
  assert.equal(st.missing, true);
});

test("Fourthwall's own SIZE_AND_FIT section always wins over a sourced chart", async () => {
  const tee = (await catalog()).find((p) => p.id === TEE);
  const own = { ...tee, sections: [...tee.sections, { type: "SIZE_AND_FIT", title: "Size & fit", html: "<ul><li>x</li></ul>" }] };
  const st = fitStatus(own);
  assert.ok(st.fit);
  assert.equal(st.source, null);
});

test("hoodie and crewneck have no verified chart yet and are still reported as missing (not guessed)", async () => {
  const all = await catalog();
  for (const slug of ["kpt-premium-hoodie", "kpt-crewneck"]) {
    const p = all.find((x) => x.slug === slug);
    assert.ok(p, slug);
    const st = fitStatus(p);
    assert.equal(st.missing, true, `${slug} stays 'not published yet' until a model-verified source exists`);
    assert.equal(fitSourceFor(p.id), null);
  }
});

test("only the 'select your model at checkout' sentence is removed from the phone-case copy", () => {
  const html = "<ul><li>Sublimation printed, made to order</li></ul>\n<p>Select your iPhone model at checkout. Product images are digital mockups; printed colors may vary.</p>";
  const out = dropCheckoutModelPrompt(html);
  assert.doesNotMatch(out, /at checkout/i);
  assert.match(out, /Product images are digital mockups; printed colors may vary\./);
  assert.match(out, /Sublimation printed, made to order/);
  assert.equal(dropCheckoutModelPrompt("<p>Select your iPhone model at checkout.</p><p>Keep.</p>"), "<p>Keep.</p>");
  assert.equal(dropCheckoutModelPrompt("<p>Shipping and taxes are calculated at checkout.</p>"), "<p>Shipping and taxes are calculated at checkout.</p>");
});

test("normalizeProduct applies the checkout-prompt cleanup to descriptions", () => {
  const p = normalizeProduct({
    id: "83986574-4480-4619-8e71-2d61f4ef1bbc", slug: "kpt-magsafe-tough-case", name: "KPT - MagSafe Tough Case",
    description: "<p>Select your iPhone model at checkout. Mockups only.</p>", access: { type: "PUBLIC" }, state: { type: "AVAILABLE" },
    images: [], variants: [{ id: "3d06e755-9c5a-4be8-96f2-76ec8b1e99c8", name: "Matte, iPhone 15", unitPrice: { value: 25, currency: "USD" }, attributes: { size: { name: "iPhone 15" } }, stock: { type: "UNLIMITED" } }],
  });
  assert.doesNotMatch(p.descriptionHtml, /at checkout/i);
});

test("hero object is a real, available Studio-pick desk mat from the catalog, else nothing", async () => {
  const all = await catalog();
  const hero = heroProduct(all);
  assert.ok(hero);
  assert.match(hero.slug, /-desk-mat$/);
  assert.ok(studioPicks(all).includes(hero));
  assert.ok(hero.images[0].url.startsWith("https://"));
  assert.equal(heroProduct(all.filter((p) => !/-desk-mat$/.test(p.slug))), null, "no mat in catalog -> no hero object");
  assert.equal(heroProduct([]), null);
  const soldOut = all.map((p) => (/-desk-mat$/.test(p.slug) ? { ...p, available: false } : p));
  assert.equal(heroProduct(soldOut), null, "a sold-out mat is never presented as the hero object");
  const noImages = all.map((p) => (/-desk-mat$/.test(p.slug) ? { ...p, images: [] } : p));
  assert.equal(heroProduct(noImages), null);
});
