// Live store guards (run: npm run test:store).
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

import {
  CHECKOUT_ORIGIN, SHOP_ID, checkoutUrl, normalizeProduct, sanitizeDescription, sortProducts, validateCheckoutLines,
  validateAgainstCatalog,
} from "../../src/lib/store/core.ts";

const root = new URL("../../", import.meta.url);
const V1 = "3d06e755-9c5a-4be8-96f2-76ec8b1e99c8";
const V2 = "4a8e5a76-c382-47a9-b4a8-f159b2875821";
const raw = (over = {}) => ({
  id: "11c30deb-6d02-4590-82e6-83061fc4b21d", name: "SIGNAL - Studio Tote", slug: "signal-studio-tote",
  description: '<p onclick="x()">Carry <strong>it</strong>.</p><script>alert(1)</script><a href="javascript:x">l</a><img src=x onerror=y>',
  state: { type: "AVAILABLE" }, access: { type: "PUBLIC" },
  images: [{ url: "https://imgproxy.fourthwall.dev/a.webp", width: 1536, height: 2048 }],
  variants: [{ id: V1, name: "Black, One size", unitPrice: { value: 29, currency: "USD" }, attributes: { description: "Black, One size" }, stock: { type: "UNLIMITED" } }],
  ...over,
});

test("pinned shop and hosted checkout origin", () => {
  assert.equal(SHOP_ID, "sh_1f2e8f65-2b29-4be9-9167-7f42314361fb");
  assert.equal(CHECKOUT_ORIGIN, "https://keepitunderground-shop.fourthwall.com");
  assert.equal(checkoutUrl("abc123-XYZ"), "https://keepitunderground-shop.fourthwall.com/checkout/?cartCurrency=USD&cartId=abc123-XYZ");
  assert.throws(() => checkoutUrl("../evil"));
  assert.throws(() => checkoutUrl("https://evil.example"));
});

test("sanitizer keeps text tags, drops scripts, links, images and all attributes", () => {
  assert.equal(sanitizeDescription(raw().description), "<p>Carry <strong>it</strong>.</p>l");
});

test("normalize: price in cents from API dollars, public only", () => {
  const p = normalizeProduct(raw());
  assert.equal(p.priceFromCents, 2900);
  assert.equal(p.variants[0].label, "Black, One size");
  assert.equal(p.available, true);
  assert.equal(normalizeProduct(raw({ access: { type: "HIDDEN" } })), null);
  assert.equal(normalizeProduct(raw({ access: { type: "PRIVATE" } })), null);
  assert.equal(normalizeProduct(raw({ variants: [] })), null);
  assert.equal(normalizeProduct(raw({ slug: "../x" })), null);
  assert.equal(normalizeProduct(raw({ state: { type: "SOLD_OUT" } })).available, false);
});

test("desk mats lead the catalog", () => {
  const a = normalizeProduct(raw());
  const b = normalizeProduct(raw({ id: "x", slug: "keep-it-underground-signal-01-desk-mat", variants: [{ ...raw().variants[0], id: V2 }] }));
  assert.deepEqual(sortProducts([a, b]).map((p) => p.slug), ["keep-it-underground-signal-01-desk-mat", "signal-studio-tote"]);
  // regression: the SUBSURFACE / 02 notebook must not be ranked as a desk mat
  const n = normalizeProduct(raw({ id: "n", slug: "project-notes-subsurface-02", variants: [{ ...raw().variants[0], id: V2 }] }));
  const m = normalizeProduct(raw({ id: "m", slug: "keep-it-underground-subsurface-desk-mat", variants: [{ ...raw().variants[0], id: V2 }] }));
  assert.deepEqual(sortProducts([n, a, m]).map((p) => p.slug), ["keep-it-underground-subsurface-desk-mat", "project-notes-subsurface-02", "signal-studio-tote"]);
});

test("checkout validation: only live variants, sane quantities, no client prices", () => {
  const catalog = [normalizeProduct(raw())];
  assert.deepEqual(validateCheckoutLines({ items: [{ variantId: V1, quantity: 2 }, { variantId: V1, quantity: 1, priceCents: 1 }] }, catalog), [{ variantId: V1, quantity: 3 }]);
  assert.throws(() => validateCheckoutLines({ items: [{ variantId: V2, quantity: 1 }] }, catalog), /UNKNOWN_VARIANT/);
  assert.throws(() => validateCheckoutLines({ items: [{ variantId: V1, quantity: 0 }] }, catalog), /INVALID_QUANTITY/);
  assert.throws(() => validateCheckoutLines({ items: [{ variantId: V1, quantity: 1.5 }] }, catalog), /INVALID_QUANTITY/);
  assert.throws(() => validateCheckoutLines({ items: [] }, catalog), /INVALID_ITEM_COUNT/);
  assert.throws(() => validateCheckoutLines(null, catalog), /INVALID_BODY/);
  const soldOut = [normalizeProduct(raw({ state: { type: "SOLD_OUT" } }))];
  assert.throws(() => validateCheckoutLines({ items: [{ variantId: V1, quantity: 1 }] }, soldOut), /VARIANT_UNAVAILABLE/);
});

test("legacy concept-site code is gone (Stripe, artist fund, fake catalog)", async () => {
  const pkg = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  assert.equal(Boolean(pkg.dependencies.stripe || pkg.dependencies["@stripe/stripe-js"]), false);
  const files = [];
  async function walk(u) {
    for (const e of await readdir(u, { withFileTypes: true })) {
      const n = new URL(e.name + (e.isDirectory() ? "/" : ""), u);
      if (e.isDirectory()) await walk(n); else if (/\.tsx?$/.test(e.name)) files.push(n);
    }
  }
  await walk(new URL("src/", root));
  for (const f of files) {
    if (/\/(commerce-preview|commerce)\//.test(f.pathname)) continue;
    const src = await readFile(f, "utf8");
    assert.equal(/artist fund|10% of every|from "stripe"|\/api\/checkout"|href="\/artists"/i.test(src), false, f.pathname);
  }
});

test("no background music: no audio element, toggle or audio assets ship", async () => {
  const layout = await readFile(new URL("src/app/layout.tsx", root), "utf8");
  assert.equal(/AudioToggle|<audio|new Audio\(/.test(layout), false);
  const { existsSync } = await import("node:fs");
  assert.equal(existsSync(new URL("src/components/brand/audio-toggle.tsx", root)), false);
  assert.equal(existsSync(new URL("public/audio/", root)), false);
});

test("checkout re-reads a fresh catalog once when the cached one does not know the variant", async () => {
  const cached = [normalizeProduct(raw())];
  const fresh = [normalizeProduct(raw()), normalizeProduct(raw({ id: "n", slug: "night-shift-studio-mug", variants: [{ ...raw().variants[0], id: V2 }] }))];
  let freshCalls = 0;
  const loadFresh = async () => { freshCalls++; return fresh; };
  // just-published product: unknown in cache, known fresh -> passes with exactly one fresh read
  assert.deepEqual(await validateAgainstCatalog({ items: [{ variantId: V2, quantity: 1 }] }, async () => cached, loadFresh), [{ variantId: V2, quantity: 1 }]);
  assert.equal(freshCalls, 1);
  // known in cache -> no fresh read at all
  await validateAgainstCatalog({ items: [{ variantId: V1, quantity: 1 }] }, async () => cached, loadFresh);
  assert.equal(freshCalls, 1);
  // client errors never trigger a fresh read
  await assert.rejects(validateAgainstCatalog({ items: [{ variantId: V1, quantity: 0 }] }, async () => cached, loadFresh), /INVALID_QUANTITY/);
  assert.equal(freshCalls, 1);
  // truly unknown variant still fails after one fresh read
  await assert.rejects(validateAgainstCatalog({ items: [{ variantId: "00000000-0000-4000-8000-000000000000", quantity: 1 }] }, async () => cached, loadFresh), /UNKNOWN_VARIANT/);
  assert.equal(freshCalls, 2);
});

test("checkout route validates against the live catalog before creating a cart", async () => {
  const src = await readFile(new URL("src/app/api/cart/checkout/route.ts", root), "utf8");
  const v = src.indexOf("validateAgainstCatalog(");
  assert.ok(v > 0 && v < src.indexOf("createHostedCheckout("), "validate before creating a cart");
  assert.ok(src.includes("getProducts({ fresh: true })"), "fresh catalog fallback wired");
});
