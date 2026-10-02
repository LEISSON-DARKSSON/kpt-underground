// Browser QA for the buy journey (KPT-01/06/07/08/13/14, ACCEPTANCE B01–B11, C01–C03) against a local
// build + mock Fourthwall. Real fonts, real Chromium, 320/390/768/1440. Never reaches Fourthwall checkout:
// navigation to the hosted checkout origin is intercepted and recorded.
// Run: PLAYWRIGHT_MODULE=/path/to/node_modules/playwright/index.mjs OUT=evidence-dir node tests/e2e/browser-qa.mjs
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import assert from "node:assert/strict";

import { MOCK_TOKEN, startMockFourthwall } from "./mock-fourthwall.mjs";

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const root = new URL("../../", import.meta.url);
const OUT = process.env.OUT ?? fileURLToPath(new URL("evidence/browser-qa/", root));
await mkdir(OUT, { recursive: true });
const fixture = JSON.parse(await readFile(new URL("tests/store/fixtures/public-catalog-2026-10-02.json", root), "utf8"));
const MOCK_PORT = 39227, APP_PORT = 39228;
const { server: mock } = await startMockFourthwall(MOCK_PORT, fixture);
const env = { ...process.env, FOURTHWALL_STOREFRONT_TOKEN: MOCK_TOKEN, FOURTHWALL_STOREFRONT_API_BASE: `http://127.0.0.1:${MOCK_PORT}/`, NEXT_TELEMETRY_DISABLED: "1" };
const next = (args) => spawn(process.execPath, [fileURLToPath(new URL("node_modules/next/dist/bin/next", root)), ...args], { cwd: fileURLToPath(root), env, stdio: ["ignore", "pipe", "pipe"] });
const done = (c) => new Promise((r) => c.on("exit", r));

const results = [];
const check = async (name, fn) => {
  try { const note = await fn(); results.push({ status: "PASS", name, note: note ?? "" }); }
  catch (e) { results.push({ status: "FAIL", name, note: e.message.split("\n")[0] }); }
};

let app, browser;
try {
  if (process.env.SKIP_BUILD !== "1") {
    const b = next(["build"]);
    let log = ""; b.stdout.on("data", (d) => (log += d)); b.stderr.on("data", (d) => (log += d));
    if ((await done(b)) !== 0) throw new Error("build failed\n" + log.slice(-1500));
  }
  app = next(["start", "-p", String(APP_PORT), "-H", "127.0.0.1"]);
  const base = `http://127.0.0.1:${APP_PORT}`;
  for (let i = 0; i < 60; i++) { try { await fetch(base + "/robots.txt"); break; } catch { await new Promise((r) => setTimeout(r, 500)); } }

  browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
  const ctx = async (width, height = 900) => {
    const c = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    await c.route("https://keepitunderground-shop.fourthwall.com/**", (r) => { c.checkoutHits = (c.checkoutHits ?? []).concat(r.request().url()); return r.abort(); });
    return c;
  };
  const dl = (page) => page.evaluate(() => (window.dataLayer ?? []).map((e) => e.event));
  const settle = (page) => page.waitForFunction(() => document.fonts.status === "loaded").then(() => page.waitForTimeout(400));

  for (const w of [320, 390, 768, 1440]) {
    await check(`shop @${w}: 22 products, no horizontal overflow, brand fonts loaded`, async () => {
      const c = await ctx(w); const page = await c.newPage();
      await page.goto(base + "/shop", { waitUntil: "networkidle" }); await settle(page);
      assert.equal(await page.locator("#loader").count(), 0, "no intro overlay on the buy path");
      const cards = await page.locator("[data-product-grid] [data-product]").count();
      assert.equal(cards, 22);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(overflow <= 0, `overflow ${overflow}px`);
      const fonts = await page.evaluate(() => [document.fonts.check('16px "Bebas Neue"') || [...document.fonts].some((f) => /bebas/i.test(f.family) && f.status === "loaded"), [...document.fonts].some((f) => /space mono/i.test(f.family) && f.status === "loaded")]);
      assert.deepEqual(fonts, [true, true], "Bebas Neue + Space Mono");
      await page.screenshot({ path: `${OUT}/shop-${w}.png`, fullPage: false });
      await page.goto(base + "/shop/kpt-heavyweight-tee", { waitUntil: "networkidle" }); await settle(page);
      const o2 = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      assert.ok(o2 <= 0, `PDP overflow ${o2}px`);
      await page.screenshot({ path: `${OUT}/pdp-tee-${w}.png`, fullPage: true });
      await c.close();
    });
  }

  for (const w of [320, 390, 768, 1440]) {
    await check(`headings @${w}: no word is split across lines on /, /story, /signal`, async () => {
      const c = await ctx(w); const page = await c.newPage();
      const split = [];
      for (const path of ["/", "/story", "/signal"]) {
        await page.goto(base + path, { waitUntil: "networkidle" }); await settle(page);
        split.push(...(await page.evaluate((p) => [...document.querySelectorAll("[data-word]")].filter((wd) => {
          const tops = [...wd.children].map((ch) => ch.offsetTop); // layout position, ignores reveal transforms
          return new Set(tops).size > 1;
        }).map((wd) => `${p}:${wd.textContent}`), path)));
        const hOverflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        if (hOverflow > 0) split.push(`${path}: page overflow ${hOverflow}px`);
      }
      assert.deepEqual(split, [], split.slice(0, 6).join(" | "));
      await page.goto(base + "/story", { waitUntil: "networkidle" }); await settle(page); await page.waitForTimeout(1500);
      await page.screenshot({ path: `${OUT}/story-${w}.png` });
      await c.close();
    });
  }

  for (const w of [390, 1440]) {
    await check(`home @${w}: one H1 with the offer, one hero CTA, proof right under it`, async () => {
      const c = await ctx(w); const page = await c.newPage();
      await page.goto(base + "/", { waitUntil: "networkidle" }); await settle(page); await page.waitForTimeout(3800);
      assert.equal(await page.locator("h1").count(), 1);
      assert.match(await page.locator("h1").innerText(), /desk mats/i);
      assert.equal(await page.locator("#hero a[href]").count(), 1, "one link in the hero");
      const gap = await page.evaluate(() => document.querySelector("[data-hero-proof]").getBoundingClientRect().top - document.querySelector("[data-hero-cta]").getBoundingClientRect().bottom);
      assert.ok(gap >= 0 && gap < 80, `proof ${gap}px below CTA`);
      assert.equal(await page.locator('#nav a:text-is("HOME")').count(), 0);
      await page.screenshot({ path: `${OUT}/home-${w}.png` });
      await c.close();
    });
  }

  await check("B01/B02: category filter in URL survives detail → Back; bogus filter falls back to All", async () => {
    const c = await ctx(390); const page = await c.newPage();
    await page.goto(base + "/shop", { waitUntil: "networkidle" });
    await page.click('[data-category-link="wear"]');
    await page.waitForURL(/category=wear/);
    assert.equal(await page.locator("[data-product-grid] [data-product]").count(), 6);
    await page.locator("[data-product-grid] [data-product] h3 a").first().click();
    await page.waitForURL(/\/shop\/[a-z0-9-]+$/);
    await page.goBack(); await page.waitForURL(/category=wear/); await page.waitForTimeout(300);
    assert.equal(await page.locator("[data-product-grid] [data-product]").count(), 6, "filter restored after Back");
    await page.goto(base + "/shop?category=bogus&sort=nope", { waitUntil: "networkidle" });
    assert.equal(await page.locator("[data-product-grid] [data-product]").count(), 22);
    await page.goto(base + "/shop?q=zzzz", { waitUntil: "networkidle" });
    assert.equal(await page.locator("[data-filter-empty]").count(), 1, "empty filter state");
    await c.close();
  });

  await check("C01: view_item_list fires once per list view, not per render", async () => {
    const c = await ctx(1440); const page = await c.newPage();
    await page.goto(base + "/shop", { waitUntil: "networkidle" }); await page.waitForTimeout(500);
    await page.mouse.wheel(0, 2000); await page.waitForTimeout(300);
    const ev = await dl(page);
    assert.equal(ev.filter((e) => e === "view_item_list").length, 1, ev.join(","));
    await c.close();
  });

  await check("B04/A09/KPT-01: tee — nothing preselected; add without size prompts; 4XL → $41 in buy box and cart", async () => {
    const c = await ctx(390); const page = await c.newPage();
    await page.goto(base + "/shop/kpt-heavyweight-tee", { waitUntil: "networkidle" });
    assert.equal(await page.locator('[data-variant-option][aria-pressed="true"]').count(), 0);
    await page.click("[data-add-to-cart]");
    assert.equal(await page.locator("dialog#cart[open]").count(), 0, "cart must not open without a size");
    assert.match(await page.locator("[data-choice-hint]").innerText(), /No size selected/);
    assert.equal(await page.locator('[data-fit="missing"]').count(), 0, "tee no longer says the chart is missing");
    assert.equal(await page.locator('[data-fit="sourced"] [data-size-row]').count(), 7, "source-backed chart lists every size");
    await page.click('[data-variant-option="13698b07-9fb3-4500-9fe0-afe48a36e003"]');
    assert.equal(await page.locator("[data-price-cents]").getAttribute("data-price-cents"), "4100");
    await page.click("[data-add-to-cart]");
    await page.waitForSelector("dialog#cart[open]");
    assert.match(await page.locator("[data-cart-row] [data-cart-variant]").innerText(), /4XL.*\$41/);
    assert.equal(await page.locator("[data-subtotal-cents]").getAttribute("data-subtotal-cents"), "4100");
    await page.screenshot({ path: `${OUT}/cart-tee-4xl-390.png` });
    await c.close();
  });

  await check("B05/KPT-08: phone case — model select (18), gallery switches to that model, cart gets that id", async () => {
    const c = await ctx(1440); const page = await c.newPage();
    await page.goto(base + "/shop/kpt-magsafe-tough-case", { waitUntil: "networkidle" });
    assert.equal(await page.locator("[data-variant-select] option:not([value=''])").count(), 18);
    assert.match(await page.locator("[data-gallery-note]").innerText(), /Choose your phone model/);
    const id = "6d828beb-2d56-4813-8607-061efe01269f"; // iPhone 15 Pro
    await page.selectOption("[data-variant-select]", id);
    assert.match(await page.locator("[data-gallery-note]").innerText(), /iPhone 15 Pro/);
    const thumbs = await page.locator('[data-gallery] [aria-label^="Show image"]').count();
    assert.ok(thumbs <= 2, `model-specific gallery, got ${thumbs} thumbs`);
    await page.click("[data-add-to-cart]");
    await page.waitForSelector("dialog#cart[open]");
    assert.equal(await page.locator("[data-cart-row]").getAttribute("data-variant"), id);
    await page.screenshot({ path: `${OUT}/pdp-phone-1440.png`, fullPage: true });
    await c.close();
  });

  await check("B06/B09/B11/C02/C03: mat adds in one step; qty/remove/empty; checkout leaves to Fourthwall without purchase event", async () => {
    const c = await ctx(390); const page = await c.newPage();
    await page.goto(base + "/shop/keep-it-underground-signal-01-desk-mat", { waitUntil: "networkidle" });
    await page.click("[data-add-to-cart]");
    await page.waitForSelector("dialog#cart[open]");
    await page.click('dialog#cart button[aria-label^="Increase"]');
    assert.equal(await page.locator("[data-subtotal-cents]").getAttribute("data-subtotal-cents"), "6800");
    await Promise.all([page.waitForRequest((r) => r.url().includes("/api/cart/checkout")), page.click("[data-checkout]")]);
    await page.waitForTimeout(1500);
    assert.ok((c.checkoutHits ?? []).some((u) => u.startsWith("https://keepitunderground-shop.fourthwall.com/checkout/")), "redirected to hosted checkout (intercepted)");
    const ev = await dl(page).catch(() => []);
    assert.equal(ev.includes("purchase"), false);
    // cart survives leaving for checkout
    await page.goto(base + "/shop", { waitUntil: "networkidle" });
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("kiu-cart-v1") ?? "[]").length);
    assert.equal(stored, 1, "cart is kept until a real purchase is confirmed elsewhere");
    await page.click('button[aria-label*="art"]').catch(() => {});
    await c.close();
  });

  await check("B09: Escape closes the cart and focus returns to the trigger", async () => {
    const c = await ctx(1440); const page = await c.newPage();
    await page.goto(base + "/shop/night-shift-studio-mug", { waitUntil: "networkidle" });
    await page.click("[data-add-to-cart]");
    await page.waitForSelector("dialog#cart[open]");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(200);
    assert.equal(await page.locator("dialog#cart[open]").count(), 0);
    assert.equal(await page.evaluate(() => document.activeElement?.hasAttribute("data-add-to-cart")), true);
    await page.click("[data-add-to-cart]"); await page.waitForSelector("dialog#cart[open]");
    await page.click('[data-cart-row] button:has-text("Remove")');
    assert.equal(await page.locator("[data-empty-cart]").count(), 1);
    await c.close();
  });

  await check("B10/KPT-14: corrupt storage does not break the app; 21st item refused with a notice, nothing dropped", async () => {
    const c = await ctx(390); const page = await c.newPage();
    await page.goto(base + "/shop", { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.setItem("kiu-cart-v1", "{corrupt"));
    await page.goto(base + "/shop/control-mouse-pad", { waitUntil: "networkidle" });
    await page.click("[data-add-to-cart]"); await page.waitForSelector("dialog#cart[open]");
    assert.equal(await page.locator("[data-cart-row]").count(), 1);
    const twenty = fixture.results.flatMap((p) => p.variants.map((v) => ({ variantId: v.id, slug: p.slug, name: p.name, variantLabel: v.attributes.description, unitCents: Math.round(v.unitPrice.value * 100), image: null, qty: 1 }))).filter((l) => l.slug !== "night-shift-studio-mug").slice(0, 20);
    await page.evaluate((l) => localStorage.setItem("kiu-cart-v1", JSON.stringify(l)), twenty);
    await page.goto(base + "/shop/night-shift-studio-mug", { waitUntil: "networkidle" });
    await page.click("[data-add-to-cart]"); await page.waitForSelector("dialog#cart[open]");
    assert.equal(await page.locator("[data-cart-row]").count(), 20);
    assert.match(await page.locator("[data-cart-notice]").innerText(), /up to 20 different items/);
    assert.equal(await page.locator(`[data-cart-row][data-variant="${twenty[0].variantId}"]`).count(), 1, "first line kept");
    await c.close();
  });

  await check("no-JS: server HTML shows the full catalog (nothing hidden behind reveal classes)", async () => {
    const c = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
    const page = await c.newPage();
    await page.goto(base + "/shop");
    const visible = await page.locator("[data-product-grid] [data-product]").evaluateAll((els) => els.filter((e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.height > 0 && s.visibility !== "hidden" && Number(s.opacity) > 0.1; }).length);
    assert.equal(visible, 22);
    // nothing may sit on top of the catalog (e.g. a loader overlay that needs JS to go away)
    const topEl = await page.evaluate(() => { const el = document.querySelector("[data-product-grid] [data-product]"); el.scrollIntoView({ behavior: "instant", block: "center" }); const r = el.getBoundingClientRect(); const hit = document.elementFromPoint(r.left + r.width / 2, r.top + 20); return el.contains(hit); });
    assert.equal(topEl, true, "catalog is not covered by an overlay without JS");
    await c.close();
  });
} finally {
  await browser?.close();
  app?.kill();
  mock.close();
}

const lines = results.map((r) => `${r.status}  ${r.name}${r.note ? "  — " + r.note : ""}`);
console.log(lines.join("\n"));
await writeFile(`${OUT}/browser-qa.json`, JSON.stringify({ at: new Date().toISOString(), chromium: "playwright bundled", results }, null, 2));
const failed = results.filter((r) => r.status === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} passed → ${OUT}`);
process.exit(failed ? 1 : 0);
