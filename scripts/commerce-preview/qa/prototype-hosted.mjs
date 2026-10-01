// Online QA for the hosted /commerce-preview (real Google Fonts, real Vercel Preview).
// Usage: node qa-hosted.mjs <shareUrl> <outDir>
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [, , shareUrl, outDir] = process.argv;
mkdirSync(outDir, { recursive: true });
const origin = new URL(shareUrl).origin;
const results = [];
const rec = (name, ok, extra = {}) => { results.push({ name, status: ok ? "PASS" : "FAIL", ...extra }); console.log(ok ? "PASS" : "FAIL", name); };
const browser = await chromium.launch({ channel: "chrome", headless: true });

// Establish auth cookie once via the share link.
const ctx0 = await browser.newContext();
const p0 = await ctx0.newPage();
const first = await p0.goto(shareUrl, { waitUntil: "networkidle" });
const storage = await ctx0.storageState();
rec("hosted:route returns 200 via share", first.status() === 200, { status: first.status() });
const hdr = first.headers();
rec("hosted:CSP connect-src none", (hdr["content-security-policy"] || "").includes("connect-src 'none'"));
rec("hosted:X-Robots-Tag noindex", /noindex/.test(hdr["x-robots-tag"] || ""));
rec("hosted:cache private no-store", /no-store/.test(hdr["cache-control"] || ""));
await ctx0.close();

const target = `${origin}/commerce-preview`;
for (const [width, height] of [[1440, 1000], [768, 1024], [390, 844], [320, 800]]) {
  const ctx = await browser.newContext({ storageState: storage, viewport: { width, height }, hasTouch: width <= 768, isMobile: width <= 390 });
  const page = await ctx.newPage();
  const errors = [], foreign = [], cspViolations = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => { if (/Content Security Policy/i.test(m.text())) cspViolations.push(m.text()); });
  page.on("request", (r) => { const u = new URL(r.url()); if (u.origin !== origin && !/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname) && u.protocol !== "data:") foreign.push(r.url()); });
  await page.goto(target, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  const fonts = await page.evaluate(() => ({
    bebas: document.fonts.check('400 40px "Bebas Neue"'),
    mono400: document.fonts.check('400 14px "Space Mono"'),
    mono700: document.fonts.check('700 14px "Space Mono"'),
    loaded: [...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.family} ${f.weight}`),
    statusAttr: document.querySelector("#font-status")?.getAttribute("data-state") ?? null,
    h1Font: getComputedStyle(document.querySelector("h1")).fontFamily,
    bodyFont: getComputedStyle(document.body).fontFamily,
  }));
  const loadedFams = fonts.loaded.join("|");
  rec(`${width}:Bebas Neue actually loaded`, /Bebas Neue/.test(loadedFams) && fonts.bebas, { fonts });
  rec(`${width}:Space Mono 400+700 actually loaded`, /Space Mono 400/.test(loadedFams) && /Space Mono 700/.test(loadedFams));
  rec(`${width}:page font-status says loaded`, fonts.statusAttr === "loaded", { statusAttr: fonts.statusAttr });
  const ov = () => page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  rec(`${width}:home heading`, (await page.locator("h1").innerText()).replace(/\s+/g, " ").trim() === "KEEP IT UNDERGROUND");
  rec(`${width}:home no horizontal overflow`, !(await ov()));
  await page.screenshot({ path: join(outDir, `home-${width}.png`) });
  await page.evaluate(() => { location.hash = "shop"; }); await page.waitForTimeout(250);
  rec(`${width}:two product cards`, (await page.locator(".product-card").count()) === 2);
  const ratios = await page.locator(".product-image-link img").evaluateAll((imgs) => imgs.map((el) => el.clientWidth / el.clientHeight));
  rec(`${width}:artwork proportions preserved`, ratios.length === 2 && ratios.every((x) => Math.abs(x - 1600 / 838) < 0.03), { ratios });
  rec(`${width}:shop no horizontal overflow`, !(await ov()));
  await page.screenshot({ path: join(outDir, `shop-${width}.png`), fullPage: true });
  await page.locator('.product-image-link[href="#product/signal"]').click(); await page.waitForTimeout(200);
  rec(`${width}:SIGNAL detail bound`, (await page.locator("h1").innerText()).includes("SIGNAL"));
  rec(`${width}:SIGNAL detail no overflow`, !(await ov()));
  await page.screenshot({ path: join(outDir, `signal-${width}.png`), fullPage: true });
  await page.locator('[data-pdp-qty="1"]').click();
  rec(`${width}:quantity increments`, (await page.locator("#pdp-quantity").innerText()).trim() === "2");
  await page.locator('[data-add="signal"]').click(); await page.waitForTimeout(150);
  rec(`${width}:cart opens`, await page.locator("#cart-dialog").evaluate((el) => el.open));
  rec(`${width}:subtotal 2x planned`, (await page.evaluate(() => window.KIU_PREVIEW.subtotal())) === 6800);
  await page.locator('[data-cart-qty="signal:-1"]').click();
  rec(`${width}:quantity recalculates`, (await page.evaluate(() => window.KIU_PREVIEW.subtotal())) === 3400);
  await page.keyboard.press("Escape"); await page.waitForTimeout(150);
  rec(`${width}:Escape closes cart`, !(await page.locator("#cart-dialog").evaluate((el) => el.open)));
  rec(`${width}:focus restored to trigger`, (await page.evaluate(() => document.activeElement?.dataset?.add)) === "signal");
  await page.evaluate(() => { location.hash = "product/subsurface"; }); await page.waitForTimeout(250);
  rec(`${width}:SUBSURFACE detail bound`, (await page.locator("h1").innerText()).includes("SUBSURFACE"));
  rec(`${width}:SUBSURFACE detail no overflow`, !(await ov()));
  await page.screenshot({ path: join(outDir, `subsurface-${width}.png`), fullPage: true });
  await page.locator('[data-add="subsurface"]').click(); await page.waitForTimeout(150);
  rec(`${width}:two distinct designs in cart`, (await page.locator(".cart-row").count()) === 2);
  await page.screenshot({ path: join(outDir, `cart-${width}.png`) });
  for (let i = 0; i < 18; i++) await page.keyboard.press("Tab");
  const focusInfo = await page.evaluate(() => { const a = document.activeElement; const cs = a ? getComputedStyle(a) : null; return { inDialog: document.querySelector("#cart-dialog").contains(a), outline: cs ? `${cs.outlineStyle} ${cs.outlineWidth}` : null, shadow: cs?.boxShadow }; });
  rec(`${width}:Tab focus contained in cart`, focusInfo.inDialog, focusInfo);
  rec(`${width}:visible focus indicator`, (focusInfo.outline && !/^none/.test(focusInfo.outline)) || (focusInfo.shadow && focusInfo.shadow !== "none"), focusInfo);
  await page.locator("[data-preview-checkout]").click(); await page.waitForTimeout(200);
  rec(`${width}:handoff payment button disabled`, await page.locator(".checkout-disabled").isDisabled());
  rec(`${width}:no input/form elements`, (await page.locator("input, form").count()) === 0);
  rec(`${width}:handoff no overflow`, !(await ov()));
  await page.screenshot({ path: join(outDir, `handoff-${width}.png`), fullPage: true });
  await page.locator("[data-open-cart]").first().click(); await page.locator('[data-remove="signal"]').click(); await page.locator('[data-remove="subsurface"]').click();
  rec(`${width}:empty cart state`, (await page.locator(".empty-cart").count()) === 1 && (await page.evaluate(() => window.KIU_PREVIEW.getCount())) === 0);
  await page.keyboard.press("Escape");
  if (width <= 680) { await page.locator("[data-menu]").click(); rec(`${width}:mobile menu opens`, await page.locator(".nav").evaluate((el) => el.classList.contains("open"))); }
  rec(`${width}:no JS errors`, errors.length === 0, { errors });
  rec(`${width}:no CSP violations`, cspViolations.length === 0, { cspViolations });
  rec(`${width}:no non-font third-party requests`, foreign.length === 0, { foreign });
  rec(`${width}:no cursor:none on body`, (await page.evaluate(() => getComputedStyle(document.body).cursor)) !== "none");
  await ctx.close();
}
// Reduced motion
{
  const ctx = await browser.newContext({ storageState: storage, viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto(target, { waitUntil: "networkidle" });
  rec("reduced-motion: primary button transition 0s", (await page.locator(".btn-primary").first().evaluate((el) => getComputedStyle(el).transitionDuration)) === "0s");
  const anims = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);
  rec("reduced-motion: no running animations", anims === 0, { running: anims });
  await ctx.close();
}
// Audio: no media elements autoplay
{
  const ctx = await browser.newContext({ storageState: storage });
  const page = await ctx.newPage();
  await page.goto(target, { waitUntil: "networkidle" });
  rec("no audio/video elements", (await page.locator("audio, video").count()) === 0);
  await ctx.close();
}
await browser.close();
const summary = { checkedAt: new Date().toISOString(), target, scope: "Hosted Vercel Preview /commerce-preview prototype, online fonts, Chrome headless", passed: results.filter((r) => r.status === "PASS").length, failed: results.filter((r) => r.status === "FAIL").length, checks: results };
writeFileSync(join(outDir, "hosted-qa.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ passed: summary.passed, failed: summary.failed }));
for (const r of results) if (r.status === "FAIL") console.log(JSON.stringify(r));
