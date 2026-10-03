// Online QA for the React port: /commerce-preview/shop on a hosted Vercel Preview.
// Usage: node qa-react.mjs <shareUrl (any path on the deployment)> <outDir>
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [, , shareUrl, outDir] = process.argv;
mkdirSync(outDir, { recursive: true });
const origin = new URL(shareUrl).origin;
const results = [];
const rec = (name, ok, extra = {}) => { results.push({ name, status: ok ? "PASS" : "FAIL", ...extra }); console.log(ok ? "PASS" : "FAIL", name); };
const browser = await chromium.launch({ channel: "chrome", headless: true });

const c0 = await browser.newContext();
const p0 = await c0.newPage();
await p0.goto(shareUrl, { waitUntil: "load" });
const storage = await c0.storageState();
await c0.close();

const SHOP = `${origin}/commerce-preview/shop`;
const waitIntro = async (page) => { await page.waitForTimeout(3600); }; // site PageLoader (2.8s) + Navbar reveal (3s)

for (const [width, height] of [[1440, 1000], [768, 1024], [390, 844], [320, 800]]) {
  const ctx = await browser.newContext({ storageState: storage, viewport: { width, height }, hasTouch: width <= 768, isMobile: width <= 390 });
  const page = await ctx.newPage();
  const errors = [], badReq = [], media = [], toolbar = [], failed = [];
  await page.addInitScript(() => { window.__plays = 0; const o = HTMLMediaElement.prototype.play; HTMLMediaElement.prototype.play = function () { window.__plays++; return o.call(this); }; });
  page.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (m.type() === "error") errors.push("console: " + m.text()); });
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (/\/api\/checkout|stripe|fourthwall\.com/i.test(r.url())) badReq.push(r.url());
    if (u.origin !== origin && u.protocol !== "data:" && u.hostname !== "vercel.live") badReq.push(r.url());
    if (u.hostname === "vercel.live") toolbar.push(r.url());
    if (r.resourceType() === "media") media.push(r.url());
  });
  const resp = await page.goto(SHOP, { waitUntil: "networkidle" });
  rec(`${width}:shop 200`, resp.status() === 200, { status: resp.status() });
  rec(`${width}:shop X-Robots-Tag noindex`, /noindex/.test(resp.headers()["x-robots-tag"] || ""));
  await waitIntro(page);
  await page.evaluate(() => document.fonts.ready);
  const f = await page.evaluate(() => ({
    loaded: [...document.fonts].filter((x) => x.status === "loaded").map((x) => `${x.family}|${x.weight}`),
    h1: getComputedStyle(document.querySelector("h1")).fontFamily,
    body: getComputedStyle(document.body).fontFamily,
    bg: getComputedStyle(document.body).backgroundColor,
    h1Color: getComputedStyle(document.querySelector("h1 span")).color,
  }));
  const fams = f.loaded.join(" ");
  rec(`${width}:Bebas Neue (next/font) loaded and on h1`, /Bebas/i.test(fams) && /Bebas/i.test(f.h1), f);
  const bold = await page.evaluate(async () => (await document.fonts.load('700 14px "Space Mono"')).map((x) => `${x.family}|${x.weight}|${x.status}`));
  rec(`${width}:Space Mono 400 in use + 700 face loads`, /Space Mono\|400/.test(fams) && /Space/i.test(f.body) && bold.some((x) => /Space Mono\|700\|loaded/.test(x)), { fams, bold });
  rec(`${width}:ink background #050505`, f.bg === "rgb(5, 5, 5)", { bg: f.bg });
  rec(`${width}:green accent #8ACE00`, f.h1Color === "rgb(138, 206, 0)", { c: f.h1Color });
  const ov = () => page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  rec(`${width}:shop no overflow`, !(await ov()));
  rec(`${width}:two product cards`, (await page.locator(".kiu-product-card").count()) === 2);
  const cols = await page.locator(".kiu-product-card").evaluateAll((els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().top))).size);
  rec(`${width}:grid columns (${width >= 1024 ? "2 side-by-side" : "stacked"})`, width >= 1024 ? cols === 1 : cols === 2, { rows: cols });
  const ratios = await page.locator(".kiu-product-card img").evaluateAll((imgs) => imgs.map((el) => ({ r: el.clientWidth / el.clientHeight, ok: el.complete && el.naturalWidth > 0 })));
  rec(`${width}:artwork loaded, proportion 1600x838 kept`, ratios.length === 2 && ratios.every((x) => x.ok && Math.abs(x.r - 1600 / 838) < 0.03), { ratios });
  rec(`${width}:legacy cart trigger hidden`, (await page.locator('nav#nav button[aria-label^="Shopping cart"]:visible').count()) === 0);
  await page.screenshot({ path: join(outDir, `react-shop-${width}.png`), fullPage: true });

  for (const [slug, key, label] of [["signal-01", "signal", "SIGNAL"], ["subsurface-02", "subsurface", "SUBSURFACE"]]) {
    await page.goto(`${SHOP}/${slug}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    rec(`${width}:${label} detail bound`, (await page.locator("h1").innerText()).includes(label));
    rec(`${width}:${label} offer id`, (await page.locator("article[data-offer-id]").getAttribute("data-offer-id")) === (key === "signal" ? "74c2ace1-4f7c-469b-a607-5555432019b4" : "97704a85-a6b6-4090-894f-a7b5bc71a374"));
    const main = await page.locator(".kiu-main-image").evaluate((el) => ({ r: el.clientWidth / el.clientHeight, src: el.getAttribute("src"), ok: el.naturalWidth > 0 }));
    rec(`${width}:${label} main image own artwork, not stretched`, main.ok && main.src.includes(`${key}-art`) && Math.abs(main.r - 1600 / 838) < 0.03, main);
    await page.locator('button[aria-label="Show desk mockup"]').click();
    const mock = await page.locator(".kiu-main-image").evaluate((el) => ({ r: el.clientWidth / el.clientHeight, src: el.getAttribute("src") }));
    rec(`${width}:${label} thumbnail switches to mockup 4:3`, mock.src.includes(`${key}-mockup`) && Math.abs(mock.r - 4 / 3) < 0.03, mock);
    rec(`${width}:${label} detail no overflow`, !(await ov()));
    await page.screenshot({ path: join(outDir, `react-${key}-${width}.png`), fullPage: true });
  }
  // Cart flow on SUBSURFACE page (current), then SIGNAL.
  await page.locator('button[aria-label="Increase quantity"]').click();
  rec(`${width}:pdp quantity increments`, (await page.locator("[data-pdp-qty]").innerText()).trim() === "2");
  const addBtn = page.locator("button[data-add]");
  await addBtn.click(); await page.waitForTimeout(250);
  rec(`${width}:cart dialog opens modal`, await page.locator("#preview-cart").evaluate((d) => d.open && d.matches(":modal")));
  rec(`${width}:planned subtotal 2x34`, (await page.locator("[data-subtotal-cents]").getAttribute("data-subtotal-cents")) === "6800");
  await page.locator('button[aria-label="Decrease SUBSURFACE / 02"]').click();
  rec(`${width}:cart qty recalculates`, (await page.locator("[data-subtotal-cents]").getAttribute("data-subtotal-cents")) === "3400");
  for (let i = 0; i < 15; i++) await page.keyboard.press("Tab");
  const fi = await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { inDialog: document.querySelector("#preview-cart").contains(a), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, tag: a.tagName }; });
  rec(`${width}:Tab stays inside cart`, fi.inDialog, fi);
  rec(`${width}:visible focus ring`, !/^none/.test(fi.outline), fi);
  await page.keyboard.press("Escape"); await page.waitForTimeout(200);
  rec(`${width}:Escape closes cart`, !(await page.locator("#preview-cart").evaluate((d) => d.open)));
  rec(`${width}:focus returns to Add button`, await page.evaluate(() => document.activeElement?.hasAttribute("data-add")));
  rec(`${width}:body scroll unlocked`, (await page.evaluate(() => document.body.style.overflow)) === "");
  await page.goto(`${SHOP}/signal-01`, { waitUntil: "networkidle" });
  // client-side nav keeps state? full reload resets it by design; re-add both via client nav
  await page.locator("button[data-add]").click(); await page.waitForTimeout(200);
  await page.keyboard.press("Escape");
  await page.locator('a[href="/commerce-preview/shop/subsurface-02"]').last().click(); await page.waitForURL(/subsurface-02/); await page.waitForTimeout(300);
  await page.locator("button[data-add]").click(); await page.waitForTimeout(250);
  rec(`${width}:two distinct designs survive client navigation`, (await page.locator(".kiu-cart-row").count()) === 2);
  await page.screenshot({ path: join(outDir, `react-cart-${width}.png`) });
  await page.locator('a[href="/commerce-preview/shop/handoff"]').click(); await page.waitForURL(/handoff/); await page.waitForTimeout(300);
  rec(`${width}:handoff subtotal carried`, (await page.locator("[data-handoff-subtotal]").getAttribute("data-handoff-subtotal")) === "6800");
  rec(`${width}:handoff checkout disabled`, await page.locator(".kiu-checkout-disabled").isDisabled());
  rec(`${width}:no inputs/forms anywhere`, (await page.locator("main input, main form").count()) === 0);
  rec(`${width}:handoff no overflow`, !(await ov()));
  await page.screenshot({ path: join(outDir, `react-handoff-${width}.png`), fullPage: true });
  await page.locator("[data-open-preview-cart]").click(); await page.waitForTimeout(200);
  for (const k of ["signal", "subsurface"]) {
    // A plain click fails if anything (e.g. an overflowing price) covers the button — that is the overlap check.
    try { await page.locator(`[data-remove="${k}"]`).click({ timeout: 5000 }); rec(`${width}:Remove ${k} clickable (no overlap)`, true); }
    catch (e) { rec(`${width}:Remove ${k} clickable (no overlap)`, false, { error: String(e).split("\n")[0] }); await page.locator(`[data-remove="${k}"]`).click({ force: true }); }
  }
  rec(`${width}:empty cart state`, (await page.locator(".kiu-empty-cart").count()) === 1);
  await page.keyboard.press("Escape");
  rec(`${width}:no JS errors / failed own requests`, errors.filter((e) => !/status of 40[34]/.test(e)).length === 0 && failed.filter((u) => !/vercel\.live|favicon/.test(u)).length === 0, { errors, failed });
  rec(`${width}:no checkout/third-party requests`, badReq.length === 0, { badReq });
  rec(`${width}:no audio play() in preview (preload only)`, (await page.evaluate(() => window.__plays)) === 0, { mediaRequests: media.length, toolbarRequests: toolbar.length });
  await ctx.close();
}
{
  const ctx = await browser.newContext({ storageState: storage, viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(SHOP, { waitUntil: "networkidle" }); await page.waitForTimeout(3600);
  const t = await page.locator(".kiu-product-card img").first().evaluate((el) => getComputedStyle(el).transitionDuration);
  rec("reduced-motion: card image transition effectively off", parseFloat(t) < 0.001, { t });
  rec("reduced-motion: content visible (no hidden reveal)", await page.locator(".kiu-product-card").first().isVisible());
  await ctx.close();
}
await browser.close();
const summary = { checkedAt: new Date().toISOString(), target: SHOP, scope: "React port on hosted Vercel Preview; Chrome headless; online fonts via next/font", passed: results.filter((r) => r.status === "PASS").length, failed: results.filter((r) => r.status === "FAIL").length, checks: results };
writeFileSync(join(outDir, "react-qa.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ passed: summary.passed, failed: summary.failed }));
for (const r of results) if (r.status === "FAIL") console.log(JSON.stringify(r));
