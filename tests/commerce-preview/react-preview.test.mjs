// Guards for the React port of the commerce design preview (/commerce-preview/shop).
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";

import { isCommercePreviewAllowed as gateTs } from "../../src/lib/commerce/gate.ts";
import { isCommercePreviewAllowed as gateMjs } from "../../src/lib/kiu-commerce-preview.mjs";
import { DESK_MATS, getDeskMatByVariant, MAX_QTY } from "../../src/lib/commerce/desk-mats.ts";
import { PREVIEW_ASSETS } from "../../src/lib/commerce/preview-assets.generated.mjs";

const root = new URL("../../", import.meta.url);
const EXPECTED = {
  signal: { offerId: "74c2ace1-4f7c-469b-a607-5555432019b4", variantId: "b28b8e38-0bd5-4303-8641-7aed66648b45" },
  subsurface: { offerId: "97704a85-a6b6-4090-894f-a7b5bc71a374", variantId: "d479a574-d42e-4767-9725-f940ce0e165c" },
};

test("React gate has identical truth table to prototype gate", () => {
  const envs = [undefined, "", "preview", "production", "development", "staging"];
  const nodes = [undefined, "development", "production", "test"];
  for (const v of envs) for (const n of nodes) assert.equal(gateTs(v, n), gateMjs(v, n), `VERCEL_ENV=${v} NODE_ENV=${n}`);
  assert.equal(gateTs("production", "development"), false);
});

test("registry binds the two verified offer/variant IDs to the right artwork", () => {
  assert.equal(DESK_MATS.length, 2);
  for (const mat of DESK_MATS) {
    assert.deepEqual({ offerId: mat.offerId, variantId: mat.variantId }, EXPECTED[mat.key]);
    assert.equal(mat.platformStatus, "PRIVATE");
    assert.ok(mat.images.every((img) => img.file.startsWith(`${mat.key}-`)), `${mat.key} images must be its own artwork`);
    assert.equal(getDeskMatByVariant(mat.variantId), mat);
  }
});

test("34 USD is a planned, not applied, price", () => {
  for (const mat of DESK_MATS) assert.deepEqual(mat.plannedPrice, { amountCents: 3400, currency: "USD", applied: false });
  assert.ok(MAX_QTY >= 1 && MAX_QTY <= 10);
});

test("every referenced image exists in the gated asset bundle with matching dimensions", () => {
  for (const mat of DESK_MATS) for (const img of mat.images) {
    const a = PREVIEW_ASSETS[img.file];
    assert.ok(a, img.file);
    assert.equal(a.width, img.width, `${img.file} width`);
    assert.equal(a.height, img.height, `${img.file} height`);
  }
});

test("generated asset module matches source files (no stale bundle)", async () => {
  const dir = new URL("design/commerce-preview/assets/", root);
  for (const name of (await readdir(dir)).filter((f) => f.endsWith(".webp"))) {
    const sha = createHash("sha256").update(await readFile(new URL(name, dir))).digest("hex");
    assert.equal(PREVIEW_ASSETS[name]?.sha256, sha, name);
  }
});

test("preview images are not shipped through /public (would bypass the gate)", async () => {
  const files = execFileSync("git", ["ls-files", "public"], { cwd: root, encoding: "utf8" });
  assert.equal(/signal-(art|mockup)|subsurface-(art|mockup)/.test(files), false);
});

test("commerce components never touch the legacy cart, Stripe or /api/checkout", async () => {
  const dirs = ["src/components/commerce/", "src/app/commerce-preview/"];
  const files = [];
  async function walk(u) {
    for (const e of await readdir(u, { withFileTypes: true })) {
      const next = new URL(e.name + (e.isDirectory() ? "/" : ""), u);
      if (e.isDirectory()) await walk(next);
      else if (/\.(tsx?|mjs)$/.test(e.name) && !e.name.endsWith(".generated.mjs") && e.name !== "kiu-commerce-preview.mjs") files.push(next);
    }
  }
  for (const d of dirs) await walk(new URL(d, root));
  assert.ok(files.length >= 8);
  for (const f of files) {
    // Strip comments: explanatory comments may name the legacy flow they avoid.
    const src = (await readFile(f, "utf8")).replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
    assert.equal(/@\/lib\/cart-context|useCart\(|stripe|\/api\/checkout|fetch\(|<form|<input/i.test(src), false, f.pathname);
  }
});

test("every gated React route enforces the gate", async () => {
  const proxy = await readFile(new URL("src/proxy.ts", root), "utf8");
  assert.match(proxy, /commercePreviewEnabled\(\)/);
  assert.match(proxy, /status: 404/);
  assert.match(proxy, /"\/commerce-preview\/:path\*"/);
  for (const p of ["src/app/commerce-preview/shop/layout.tsx", "src/app/commerce-preview/shop/page.tsx", "src/app/commerce-preview/shop/[slug]/page.tsx", "src/app/commerce-preview/shop/handoff/page.tsx", "src/app/commerce-preview/assets/[file]/route.ts"]) {
    const src = await readFile(new URL(p, root), "utf8");
    assert.match(src, /commercePreviewEnabled\(\)/, p);
  }
});
