// H04: source-backed size charts. Numbers come from the supplier guide; the code never generates measurements.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { dropCheckoutModelPrompt, fitStatus, normalizeProduct, parseCatalogPage } from "../../src/lib/store/core.ts";
import { FIT_SOURCES, fitSourceFor } from "../../src/lib/store/fit-sources.ts";
import { heroProduct, studioPicks } from "../../src/lib/store/merchandising.ts";

const TEE = "6c250dd6-5ebd-4a75-a9a5-d1bc584f177f";
const CREW = "9b4af8fc-347b-4e56-8808-2aacea619a32";
const HOODIE = "caf3e2ed-8b80-4b29-bd94-46427a9fef39";
const catalog = async () => {
  const data = JSON.parse(await readFile(new URL("./fixtures/public-catalog-2026-10-02.json", import.meta.url), "utf8"));
  return parseCatalogPage(data).products;
};

// Manufacturer constants, read from the manufacturer's spec sheets on 2026-10-02 (Blankstyle-hosted copies, fractions as printed).
// Comfort Colors 1717 "PRODUCT MEASUREMENTS".
const CC = {
  length: [26 + 5 / 8, 28, 29 + 3 / 8, 30 + 3 / 4, 31 + 5 / 8, 32 + 1 / 2, 33 + 1 / 2],
  chest: [18 + 1 / 4, 20 + 1 / 4, 22, 24, 26, 27 + 3 / 4, 29 + 3 / 4],
  sleeve: [16 + 1 / 4, 17 + 3 / 4, 19, 20 + 1 / 2, 21 + 3 / 4, 23 + 1 / 4, 24 + 5 / 8],
  body: ['36-37"', '38-40"', '42-44"', '46-48"', '50-52"', '54-56"', '58-60"'],
};
// Cotton Heritage M2480 "MEASUREMENTS" rows, sizes S..3XL only (the sheet also has XS and empty 4XL-6XL columns).
// The sheet's labels are Body Length / Chest Width / Sleeve Length; it prints no unit and no measuring point.
const M2480 = {
  "Body Length": [27, 28, 29, 30, 31, 32],
  "Chest Width": [20, 21, 23, 25, 26.5, 28],
  "Sleeve Length": [23.5, 24, 24, 24, 24, 24],
};

// Per-offer expectations. Adding an entry to FIT_SOURCES without adding it here fails the first test below.
const EXPECT = {
  [TEE]: {
    slug: "kpt-heavyweight-tee",
    model: /Comfort Colors 1717/,
    spec: /SpecSheetMeasurements_1717\.pdf$/,
    shop: "https://keepitunderground-shop.fourthwall.com/products/kpt-heavyweight-tee",
    sizes: ["S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    columns: ["length", "chest", "sleeve", "body-chest"],
    bodyColumns: ["body-chest"],
    // measuring wording as the manufacturer gives it
    how: {
      length: /high point shoulder to finished hem at back/i,
      chest: /one inch below the armhole when laid flat/i,
      sleeve: /center back neck to shoulder point to sleeve hem/i,
    },
    flatColumns: [],
  },
  [CREW]: {
    slug: "kpt-crewneck",
    model: /^Cotton Heritage M2480 Premium Sweatshirt$/,
    spec: /M2480_ProductSpecs\.pdf$/,
    catalog: "https://products.fourthwall.com/cotton-heritage-premium-sweatshirt-dtg",
    shop: "https://keepitunderground-shop.fourthwall.com/products/kpt-crewneck",
    sizes: ["S", "M", "L", "XL", "2XL", "3XL"],
    columns: ["length", "width", "sleeve"],
    bodyColumns: [],
    // Fourthwall product-page wording (the manufacturer sheet gives none)
    how: {
      length: /collar at the top \(high point shoulder\)/i,
      width: /seam below one sleeve.*seam below the other sleeve/i,
      sleeve: /top of the set-in sleeve/i,
    },
    // Sleeve length is genuinely flat from M to 3XL on the manufacturer sheet (24 in), so it may not grow strictly.
    flatColumns: ["sleeve"],
  },
};

test("every FIT_SOURCES entry has an expectations block here (a new chart cannot skip these checks)", () => {
  assert.deepEqual(FIT_SOURCES.map((s) => s.offerId).sort(), Object.keys(EXPECT).sort());
});

test("sourced charts get a row for every size the product sells; Fourthwall publishes no SIZE_AND_FIT for them", async () => {
  const all = await catalog();
  for (const [id, e] of Object.entries(EXPECT)) {
    const p = all.find((x) => x.id === id);
    assert.ok(p, `${e.slug} is in the public catalog fixture`);
    assert.equal(p.slug, e.slug);
    const st = fitStatus(p);
    assert.equal(st.missing, false, e.slug);
    assert.equal(st.fit, null, `Fourthwall publishes no SIZE_AND_FIT for ${e.slug}`);
    assert.ok(st.source, `${e.slug}: source-backed chart is used`);
    const rowSizes = st.source.rows.map((r) => r.size);
    assert.deepEqual(p.variants.map((v) => v.size), rowSizes, `${e.slug}: table sizes equal the variant sizes, in order`);
    assert.deepEqual(rowSizes, e.sizes);
  }
});

test("chart integrity: unit, base model, sources and no empty or zero cells", () => {
  for (const s of FIT_SOURCES) {
    const e = EXPECT[s.offerId];
    assert.equal(s.unit, "in");
    assert.match(s.baseModel, e.model);
    assert.ok(s.sources.length >= 2, "manufacturer sheet and the shop page are both cited");
    assert.ok(s.sources.some((x) => e.spec.test(x.url)), "manufacturer spec sheet cited");
    assert.ok(s.sources.some((x) => x.url === e.shop), "the shop's own product page cited");
    if (e.catalog) assert.ok(s.sources.some((x) => x.url === e.catalog), "Fourthwall catalog size guide cited");
    for (const x of s.sources) assert.match(x.retrieved, /^\d{4}-\d{2}-\d{2}$/);
    assert.deepEqual(s.columns.map((c) => c.key), e.columns);
    assert.deepEqual(s.columns.filter((c) => c.kind === "body").map((c) => c.key), e.bodyColumns);
    for (const r of s.rows) {
      assert.equal(r.values.length, s.columns.length, `${r.size}: one value per column`);
      for (const v of r.values) assert.match(v, /^[1-9]\d*(\.\d+)?(-[1-9]\d*)?"$/, `${r.size}: "${v}" is a published inch value or range, never 0 or blank`);
    }
    assert.ok(s.columns.every((c) => c.how.length > 20), "every column says how it was measured");
    assert.ok(s.columns.every((c) => c.kind === "garment" || c.kind === "body"), "every column is declared garment or body");
    assert.ok(s.notes.some((n) => /flat garment measurements, not body measurements/i.test(n)), "garment vs body is stated");
    for (const [k, re] of Object.entries(e.how)) assert.match(s.columns.find((c) => c.key === k).how, re, `${s.baseModel}: ${k} wording`);
  }
});

test("tee: every number equals the manufacturer's spec sheet (fractions as printed, shop rounding to 2 decimals allowed)", () => {
  const tee = fitSourceFor(TEE);
  const col = (key) => tee.rows.map((r) => r.values[tee.columns.findIndex((c) => c.key === key)]);
  for (const key of ["length", "chest", "sleeve"]) {
    col(key).forEach((v, i) => assert.ok(Math.abs(Number(v.replace('"', "")) - CC[key][i]) <= 0.01, `${key} ${tee.rows[i].size}: ${v} vs ${CC[key][i]}`));
  }
  assert.deepEqual(col("body-chest"), CC.body);
});

test("tee: column definitions are the ones that match the numbers (sleeve is from center back, not from the set-in sleeve)", () => {
  const tee = fitSourceFor(TEE);
  const how = (k) => tee.columns.find((c) => c.key === k).how;
  assert.doesNotMatch(how("sleeve"), /set-in sleeve/i);
  assert.equal(tee.columns.find((c) => c.key === "body-chest").kind, "body");
});

test("crewneck: every cell equals the manufacturer sheet AND the Fourthwall catalog size guide (they agree for S-3XL)", () => {
  const crew = fitSourceFor(CREW);
  const col = (key) => crew.rows.map((r) => Number(r.values[crew.columns.findIndex((c) => c.key === key)].replace('"', "")));
  // Fourthwall catalog size guide for M2480 (pro_c49cab91050c41dd96), inches, read 2026-10-02 through the offer-to-catalog join.
  const fourthwall = { length: [27, 28, 29, 30, 31, 32], width: [20, 21, 23, 25, 26.5, 28], sleeve: [23.5, 24, 24, 24, 24, 24] };
  for (const [key, label] of [["length", "Body Length"], ["width", "Chest Width"], ["sleeve", "Sleeve Length"]]) {
    assert.deepEqual(col(key), fourthwall[key], `${key} vs Fourthwall catalog size guide`);
    assert.deepEqual(col(key), M2480[label], `${key} vs manufacturer row '${label}'`);
  }
});

test("crewneck: OPEN items are recorded in the chart text, not resolved (label meaning, fit verdict, colours)", () => {
  const crew = fitSourceFor(CREW);
  // The manufacturer's Chest Width / Body Length / Sleeve Length carry the same numbers as Fourthwall's Width / Length / Sleeve length,
  // but the manufacturer sheet states no measuring point. The chart says whose wording the instructions are and claims nothing more.
  assert.ok(crew.notes.some((n) => /Fourthwall's product-page wording/.test(n) && /row labels only/.test(n) && /no measuring point/.test(n)));
  assert.ok(crew.notes.some((n) => /Black only/.test(n) && /heather/i.test(n)), "heather blends are not described");
  // No fit verdict is shown: Fourthwall's own sources disagree (catalog 'Fits as expected.' vs shop page 'tends to be smaller in size').
  for (const n of crew.notes) assert.doesNotMatch(n, /fits as expected|runs small|true to size|size up|size larger/i);
  // Sleeve wording is NOT the tee's center-back definition: for the crewneck there is no manufacturer definition to anchor that to.
  assert.doesNotMatch(crew.columns.find((c) => c.key === "sleeve").how, /center back/i);
});

test("rows grow with size (catches a transposed or mistyped cell); flat only where the manufacturer's own numbers are flat", () => {
  for (const s of FIT_SOURCES) {
    const flat = EXPECT[s.offerId].flatColumns;
    s.columns.forEach((c, k) => {
      const col = s.rows.map((r) => Number(r.values[k].replace('"', "").split("-")[0]));
      for (let i = 1; i < col.length; i++) {
        const label = `${s.baseModel} ${c.label}: ${s.rows[i].size} vs ${s.rows[i - 1].size}`;
        if (flat.includes(c.key)) assert.ok(col[i] >= col[i - 1], label);
        else assert.ok(col[i] > col[i - 1], label);
      }
    });
  }
});

test("a partial size run never produces a partial table; missing stays honest", async () => {
  const all = await catalog();
  for (const id of [TEE, CREW]) {
    const p = all.find((x) => x.id === id);
    const partial = { ...p, variants: [...p.variants, { ...p.variants[0], id: "11111111-1111-4111-8111-111111111111", size: "5XL" }] };
    const st = fitStatus(partial);
    assert.equal(st.source, null, p.slug);
    assert.equal(st.missing, true, p.slug);
  }
});

test("Fourthwall's own SIZE_AND_FIT section always wins over a sourced chart", async () => {
  const all = await catalog();
  for (const id of [TEE, CREW]) {
    const p = all.find((x) => x.id === id);
    const own = { ...p, sections: [...p.sections, { type: "SIZE_AND_FIT", title: "Size & fit", html: "<ul><li>x</li></ul>" }] };
    const st = fitStatus(own);
    assert.ok(st.fit, p.slug);
    assert.equal(st.source, null, p.slug);
  }
});

test("hoodie has no chart: its 2XL width is an OPEN conflict (Fourthwall 26 vs manufacturer mirror 26.5), so nothing is shown", async () => {
  // docs/fit-hoodie-2xl-conflict.md. Do not add a hoodie entry until the conflict is closed; never pick or average.
  const p = (await catalog()).find((x) => x.slug === "kpt-premium-hoodie");
  assert.ok(p);
  assert.equal(p.id, HOODIE);
  const st = fitStatus(p);
  assert.equal(st.missing, true, "hoodie stays 'not published yet' until the 2XL width conflict is resolved");
  assert.equal(fitSourceFor(p.id), null);
  assert.equal(FIT_SOURCES.some((s) => /M2580/.test(s.baseModel)), false);
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
