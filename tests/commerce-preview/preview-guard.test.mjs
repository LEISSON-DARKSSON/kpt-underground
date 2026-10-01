// Guards for the gated /commerce-preview design demo (run: npm run test:commerce-preview).
// Imports the exact module the Next route ships, not the handoff copy.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  isCommercePreviewAllowed,
  DESIGN_PREVIEW_HTML,
  DESIGN_PREVIEW_CSP,
} from "../../src/lib/kiu-commerce-preview.mjs";

test("allows Vercel Preview", () => assert.equal(isCommercePreviewAllowed("preview", "production"), true));
test("blocks Production", () => assert.equal(isCommercePreviewAllowed("production", "production"), false));
test("Production cannot be overridden by development NODE_ENV", () =>
  assert.equal(isCommercePreviewAllowed("production", "development"), false));
test("blocks unknown hosted environment", () => assert.equal(isCommercePreviewAllowed("staging", "development"), false));
test("allows local development", () => assert.equal(isCommercePreviewAllowed(undefined, "development"), true));
test("blocks unclassified production server (e.g. next start)", () =>
  assert.equal(isCommercePreviewAllowed(undefined, "production"), false));

test("CSP forbids network, forms, frames", () => {
  for (const d of ["connect-src 'none'", "form-action 'none'", "frame-src 'none'", "object-src 'none'", "frame-ancestors 'none'"]) {
    assert.ok(DESIGN_PREVIEW_CSP.includes(d), d);
  }
});

test("no payment/shipping inputs or forms", () => assert.equal(/<(?:input|form)\b/i.test(DESIGN_PREVIEW_HTML), false));

test("no credentials or embedded font binaries", () =>
  assert.equal(/ptkn_|fw_api_|sk_live_|sk_test_|Bearer\s|data:(?:font|application\/(?:font|x-font))/i.test(DESIGN_PREVIEW_HTML), false));

test("no checkout/order endpoints referenced", () =>
  assert.equal(/\/api\/checkout|checkout\.stripe|api\.fourthwall\.com|storefront-api\.fourthwall/i.test(DESIGN_PREVIEW_HTML), false));

test("every inline script matches a CSP hash", () => {
  const scripts = [...DESIGN_PREVIEW_HTML.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((m) => m[1]);
  assert.ok(scripts.length >= 1);
  for (const s of scripts) {
    const h = createHash("sha256").update(s).digest("base64");
    assert.ok(DESIGN_PREVIEW_CSP.includes(`'sha256-${h}'`), "missing CSP hash for inline script");
  }
});

test("both product offer IDs and planned-price labelling present", () => {
  assert.ok(DESIGN_PREVIEW_HTML.includes("74c2ace1-4f7c-469b-a607-5555432019b4"));
  assert.ok(DESIGN_PREVIEW_HTML.includes("97704a85-a6b6-4090-894f-a7b5bc71a374"));
  assert.match(DESIGN_PREVIEW_HTML, /planned price/i);
});

test("route returns 404 outside preview/dev and sets noindex", async () => {
  const src = await readFile(new URL("../../src/app/commerce-preview/route.ts", import.meta.url), "utf8");
  assert.match(src, /isCommercePreviewAllowed\(process\.env\.VERCEL_ENV, process\.env\.NODE_ENV\)/);
  assert.match(src, /status: 404/);
  assert.match(src, /X-Robots-Tag': 'noindex, nofollow'/);
});
