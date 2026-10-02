// H05 browser check of the GA4 transport against a REAL build in real Chromium, with every Google host
// intercepted: nothing real is contacted, no real Measurement ID exists (G-MOCKTEST01 is fictional), the
// Fourthwall API is a loopback mock and the hosted checkout navigation is intercepted and recorded.
//
// What this proves: the app's command sequence, consent gating, route handling, URL hygiene and that
// shopping never depends on measurement. What it does NOT prove: how the real gtag.js behaves on the wire.
// The stub below plays the observable parts of gtag.js (reads the layer at load, honours ga-disable, sends one
// collect per event). Real collection stays NOT_RUN until a DebugView / report receipt exists.
//
// Run: PLAYWRIGHT_MODULE=/path/to/playwright-core/index.mjs [CHROMIUM_PATH=chrome.exe] [OUT=dir] [SKIP_BUILD=1] node tests/measurement/browser-mock.mjs
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import assert from "node:assert/strict";

import { MOCK_TOKEN, startMockFourthwall } from "../e2e/mock-fourthwall.mjs";
import { findForbiddenForms } from "./lib/forbidden-form.mjs";

const playwrightSpec = process.env.PLAYWRIGHT_MODULE ? (/^[a-z][a-z0-9+.-]+:\/\//i.test(process.env.PLAYWRIGHT_MODULE) ? process.env.PLAYWRIGHT_MODULE : pathToFileURL(process.env.PLAYWRIGHT_MODULE).href) : "playwright";
const { chromium } = await import(playwrightSpec);
const root = new URL("../../", import.meta.url);
const OUT = process.env.OUT ?? `${tmpdir()}/kpt-measurement-mock`;
await mkdir(OUT, { recursive: true });
const fixture = JSON.parse(await readFile(new URL("tests/store/fixtures/public-catalog-2026-10-02.json", root), "utf8"));
const MOCK_PORT = 39241;
const { server: mock } = await startMockFourthwall(MOCK_PORT, fixture);
const ID = "G-MOCKTEST01";
const baseEnv = { ...process.env, FOURTHWALL_STOREFRONT_TOKEN: MOCK_TOKEN, FOURTHWALL_STOREFRONT_API_BASE: `http://127.0.0.1:${MOCK_PORT}/`, NEXT_TELEMETRY_DISABLED: "1" };
delete baseEnv.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
delete baseEnv.NEXT_PUBLIC_GA4_OWNER_ACTIVATION;
const nextBin = fileURLToPath(new URL("node_modules/next/dist/bin/next", root));
const run = (args, env) => spawn(process.execPath, [nextBin, ...args], { cwd: fileURLToPath(root), env, stdio: ["ignore", "pipe", "pipe"] });
const done = (c) => new Promise((r) => c.on("exit", r));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function build(env) {
  const b = run(["build"], env);
  let log = "";
  b.stdout.on("data", (d) => (log += d));
  b.stderr.on("data", (d) => (log += d));
  if ((await done(b)) !== 0) throw new Error("build failed\n" + log.slice(-1500));
}
async function serve(port, env) {
  const app = run(["start", "-p", String(port), "-H", "127.0.0.1"], env);
  const base = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 60; i++) {
    try { await fetch(base + "/robots.txt"); break; } catch { await sleep(500); }
  }
  return { app, base };
}

/** What a real gtag.js does that matters here, and nothing more. */
const STUB = `(() => {
  const layer = window.kptGa4Layer;
  const id = new URL(document.currentScript.src).searchParams.get("id");
  const s = (window.__stub = { queueAtLoad: Array.from(layer, (a) => Array.from(a)), processed: [] });
  document.cookie = "_ga=GA1.1.mock; path=/";
  document.cookie = "_ga_" + id.slice(2) + "=GS1.1.mock; path=/";
  const handle = (a) => {
    const args = Array.from(a);
    s.processed.push(args);
    if (args[0] !== "event" || window["ga-disable-" + id] === true) return;
    const p = args[2] || {};
    const dl = p.page_location || "document:" + location.href; // real gtag falls back to the document URL
    fetch("https://www.google-analytics.com/g/collect?v=2&tid=" + id + "&en=" + encodeURIComponent(args[1]) + "&dl=" + encodeURIComponent(dl) + "&dr=" + encodeURIComponent(p.page_referrer || ""), { mode: "no-cors", keepalive: true }).catch(() => {});
  };
  layer.forEach(handle);
  const push = layer.push.bind(layer);
  layer.push = (...a) => { a.forEach(handle); return push(...a); };
})();`;

const GOOGLE = /^https?:\/\/([^/]*\.)?(google-analytics\.com|googletagmanager\.com|doubleclick\.net|analytics\.google\.com)\//;
const results = [];
const check = async (name, fn) => {
  try { results.push({ status: "PASS", name, note: (await fn()) ?? "" }); }
  catch (e) { results.push({ status: "FAIL", name, note: e.message.split("\n")[0] }); }
};

let browser;
const contexts = [];
/** mode: stub = script loads; block = script request aborted; slow = script held until release() */
async function ctx(mode = "stub", width = 1280) {
  const c = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: "block" });
  contexts.push(c);
  c.g = { scriptReq: [], collect: [], otherGoogle: [], external: [], checkout: [], pageErrors: [], console: [], release: null };
  await c.route((u) => !["127.0.0.1", "localhost"].includes(u.hostname), (r) => { c.g.external.push(r.request().url()); return r.abort(); });
  await c.route(GOOGLE, async (r) => {
    const u = new URL(r.request().url());
    if (u.pathname === "/gtag/js") {
      c.g.scriptReq.push(u.search);
      if (mode === "block") return r.abort();
      if (mode === "slow") await new Promise((res) => (c.g.release = res));
      return r.fulfill({ status: 200, contentType: "application/javascript", body: STUB });
    }
    if (u.pathname === "/g/collect") { c.g.collect.push(u); return r.fulfill({ status: 204, body: "" }); }
    c.g.otherGoogle.push(u.href);
    return r.abort();
  });
  await c.route("https://keepitunderground-shop.fourthwall.com/**", (r) => { c.g.checkout.push(r.request().url()); return r.abort(); });
  c.on("page", (p) => {
    p.on("pageerror", (e) => c.g.pageErrors.push(e.message));
    p.on("console", (m) => c.g.console.push(m.text()));
  });
  return c;
}
const events = (c, name) => c.g.collect.map((u) => u.searchParams.get("en")).filter((e) => name === undefined || e === name);
const dls = (c, name) => c.g.collect.filter((u) => u.searchParams.get("en") === name).map((u) => u.searchParams.get("dl"));
const layerCommands = (page) => page.evaluate(() => (window.kptGa4Layer ?? []).map((a) => Array.from(a)));
const settle = (page) => page.waitForLoadState("networkidle");
const MAT = "/shop/keep-it-underground-signal-01-desk-mat";

async function addMat(page, base, waitUntil = "networkidle") {
  await page.goto(base + MAT, { waitUntil });
  await page.click("[data-add-to-cart]");
  await page.waitForSelector("dialog#cart[open]");
}
/**
 * Clicks checkout and waits for the (intercepted) hosted-checkout navigation. The app page is gone after that,
 * so a snapshot of its state is taken on beforeunload and read back after returning to the shop.
 */
async function checkout(c, page, base, waitUntil = "networkidle") {
  await page.evaluate(() => {
    window.addEventListener("beforeunload", () => {
      sessionStorage.setItem("__snap", JSON.stringify({
        dataLayer: (window.dataLayer ?? []).map((e) => e.event),
        layerType: typeof window.kptGa4Layer,
        layerLength: (window.kptGa4Layer ?? []).length,
        rawArrays: (window.kptGa4Layer ?? []).some((e) => Array.isArray(e)),
        processed: window.__stub ? window.__stub.processed.map((a) => a[0] + ":" + a[1]) : null,
      }));
    });
  });
  const started = Date.now();
  await Promise.all([page.waitForRequest((r) => r.url().includes("/api/cart/checkout")), page.click("[data-checkout]")]);
  for (let i = 0; i < 40 && !c.g.checkout.some((u) => u.startsWith("https://keepitunderground-shop.fourthwall.com/checkout/")); i++) await sleep(200);
  assert.ok(c.g.checkout.some((u) => u.startsWith("https://keepitunderground-shop.fourthwall.com/checkout/")), "redirected to the hosted checkout (intercepted)");
  const ms = Date.now() - started;
  await page.goto(base + "/shop", { waitUntil });
  const snap = JSON.parse(await page.evaluate(() => sessionStorage.getItem("__snap") ?? "{}"));
  return { ...snap, checkoutMs: ms };
}
const cartLines = (page) => page.evaluate(() => JSON.parse(localStorage.getItem("kiu-cart-v1") ?? "[]").length);

try {
  browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});

  /* ================= build 1: Measurement ID present, owner activation ABSENT ================= */
  if (process.env.SKIP_BUILD !== "1") await build({ ...baseEnv, NEXT_PUBLIC_GA4_MEASUREMENT_ID: ID });
  let srv = await serve(39242, { ...baseEnv, NEXT_PUBLIC_GA4_MEASUREMENT_ID: ID });
  try {
    await check("case 1 (ID but no owner activation): no banner, no script, no collect, no layer; shopping and checkout work", async () => {
      const c = await ctx(); const page = await c.newPage();
      await page.goto(srv.base + "/shop", { waitUntil: "networkidle" });
      assert.equal(await page.locator("[data-consent-banner]").count(), 0);
      assert.equal(await page.locator("[data-analytics-preference]").count(), 0);
      await addMat(page, srv.base);
      assert.equal(await page.evaluate(() => localStorage.getItem("kpt-analytics-consent-v1")), null);
      const snap = await checkout(c, page, srv.base);
      assert.deepEqual([c.g.scriptReq.length, c.g.collect.length, c.g.otherGoogle.length], [0, 0, 0]);
      assert.equal(snap.layerType, "undefined");
      assert.ok(snap.dataLayer.includes("begin_checkout"), "the local dataLayer still records");
      assert.deepEqual(c.g.pageErrors, []);
    });
  } finally { srv.app.kill(); }

  /* ================= build 2: ID + owner activation ================= */
  const active = { ...baseEnv, NEXT_PUBLIC_GA4_MEASUREMENT_ID: ID, NEXT_PUBLIC_GA4_OWNER_ACTIVATION: "true" };
  if (process.env.SKIP_BUILD !== "1") await build(active);
  srv = await serve(39243, active);
  const B = srv.base;
  try {
    await check("case 2: consent unset: banner shown, no script, no collect; shopping and checkout work; the local dataLayer still records", async () => {
      const c = await ctx(); const page = await c.newPage();
      await page.goto(B + "/shop", { waitUntil: "networkidle" });
      await page.waitForSelector("[data-consent-banner]");
      await addMat(page, B);
      const snap = await checkout(c, page, B);
      assert.deepEqual([c.g.scriptReq.length, c.g.collect.length, c.g.otherGoogle.length], [0, 0, 0]);
      assert.equal(snap.layerType, "undefined");
      assert.ok(snap.dataLayer.includes("add_to_cart") && snap.dataLayer.includes("begin_checkout"), String(snap.dataLayer));
      assert.equal(snap.dataLayer.includes("purchase"), false);
      assert.deepEqual(c.g.pageErrors, []);
    });

    for (const w of [320, 390, 1440]) {
      await check(`banner @${w}: fits the viewport, no horizontal overflow, both buttons reachable and equally sized, does not cover the add-to-cart button`, async () => {
        const c = await ctx("stub", w); const page = await c.newPage();
        await page.goto(B + MAT, { waitUntil: "networkidle" });
        await page.waitForSelector("[data-consent-banner]");
        const m = await page.evaluate(() => {
          const r = (sel) => document.querySelector(sel).getBoundingClientRect();
          const b = r("[data-consent-banner]"), a = r("[data-consent-accept]"), d = r("[data-consent-decline]");
          return { overflow: document.documentElement.scrollWidth - innerWidth, bannerH: b.height, bannerBottom: b.bottom, vh: innerHeight, aW: a.width, dW: d.width, aH: a.height, dH: d.height, aRight: a.right, dRight: d.right, vw: innerWidth };
        });
        assert.ok(m.overflow <= 0, `overflow ${m.overflow}px`);
        assert.ok(m.bannerH < m.vh * 0.35, `banner is ${m.bannerH}px of ${m.vh}px`);
        assert.ok(m.aRight <= m.vw && m.dRight <= m.vw, "buttons inside the viewport");
        assert.ok(Math.abs(m.aH - m.dH) < 2, "equal height: the refusal is as easy as the grant");
        await page.locator("[data-add-to-cart]").scrollIntoViewIfNeeded();
        await page.click("[data-add-to-cart]"); // fails with a timeout if the banner sits on top of it
        await page.waitForSelector("dialog#cart[open]");
        await page.keyboard.press("Escape");
        await page.screenshot({ path: `${OUT}/banner-${w}.png` });
      });
    }

    await check("case 2b: denied: banner closes, nothing loads or collects, also after a reload; shopping works", async () => {
      const c = await ctx(); const page = await c.newPage();
      await page.goto(B + "/", { waitUntil: "networkidle" });
      await page.click("[data-consent-decline]");
      assert.equal(await page.locator("[data-consent-banner]").count(), 0);
      await addMat(page, B);
      await checkout(c, page, B);
      assert.equal(await page.locator("[data-consent-banner]").count(), 0, "the refusal is remembered after leaving for checkout and coming back");
      assert.equal(await page.evaluate(() => localStorage.getItem("kpt-analytics-consent-v1")), "denied");
      await page.reload({ waitUntil: "networkidle" });
      assert.equal(await page.locator("[data-consent-banner]").count(), 0, "and after a reload");
      assert.deepEqual([c.g.scriptReq.length, c.g.collect.length], [0, 0]);
    });

    await check("cases 3+4+5: grant on /shop, product, back: script loaded once after the grant, 3 page views, view_item_list only after the grant, no replay", async () => {
      const c = await ctx(); const page = await c.newPage();
      await page.goto(B + "/shop", { waitUntil: "networkidle" });
      assert.equal(c.g.scriptReq.length, 0, "no script before the choice");
      await page.click("[data-consent-accept]");
      await page.waitForFunction(() => window.__stub !== undefined);
      assert.equal(c.g.scriptReq.length, 1);
      assert.match(c.g.scriptReq[0], /id=G-MOCKTEST01&l=kptGa4Layer/);
      const q = await page.evaluate(() => window.__stub.queueAtLoad);
      assert.deepEqual(q.map((x) => x[0]).slice(0, 3), ["consent", "js", "config"]);
      assert.deepEqual(q[0][2], { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
      assert.equal(q[2][2].send_page_view, false);
      assert.equal(JSON.stringify(q).includes("view_item_list"), false, "the list impression from before the grant is not replayed");
      await page.locator("[data-product-grid] [data-product] h3 a").first().click();
      await page.waitForURL(/\/shop\/[a-z0-9-]+$/);
      await settle(page); await sleep(400);
      await page.goBack();
      await page.waitForURL(/\/shop$/);
      await settle(page); await sleep(600);
      assert.equal(events(c, "page_view").length, 3, events(c).join(","));
      assert.deepEqual(dls(c, "page_view").map((d) => new URL(d).pathname).map((p, i) => (i === 1 ? p.replace(/^\/shop\/.+/, "/shop/<product>") : p)), ["/shop", "/shop/<product>", "/shop"]);
      assert.equal(events(c, "view_item").length, 1);
      assert.equal(events(c, "view_item_list").length, 1, "only the second visit to /shop (new page-view scope)");
      assert.equal(events(c).filter((e) => e === "purchase").length, 0);
      for (const e of await layerCommands(page)) assert.ok(Array.isArray(e));
      assert.equal(await page.evaluate(() => (window.kptGa4Layer ?? []).some((e) => Array.isArray(e))), false, "no raw array in the layer");
      assert.deepEqual(c.g.pageErrors, []);
      return `collect: ${events(c).join(",")}`;
    });

    await check("case 5: add_to_cart before the grant is never sent; the same action after the grant is", async () => {
      const c = await ctx(); const page = await c.newPage();
      await addMat(page, B);
      await page.keyboard.press("Escape");
      await page.click("[data-consent-accept]");
      await page.waitForFunction(() => window.__stub !== undefined);
      await sleep(400);
      assert.equal(JSON.stringify(await page.evaluate(() => window.__stub.queueAtLoad)).includes("add_to_cart"), false);
      assert.equal(events(c, "add_to_cart").length, 0);
      await page.click("[data-add-to-cart]");
      await page.waitForSelector("dialog#cart[open]");
      for (let i = 0; i < 20 && events(c, "add_to_cart").length < 1; i++) await sleep(150);
      assert.equal(events(c, "add_to_cart").length, 1);
    });

    await check("case 6: withdrawal in the same session: nothing more leaves (clicks, route changes, cart), cookies expired, cart kept, refusal remembered", async () => {
      const c = await ctx(); const page = await c.newPage();
      await page.goto(B + "/shop", { waitUntil: "networkidle" });
      await page.click("[data-consent-accept]");
      await page.waitForFunction(() => window.__stub !== undefined);
      await sleep(500);
      assert.match(await page.evaluate(() => document.cookie), /_ga=/, "the stub set the cookie like gtag would");
      await addMat(page, B);
      await page.keyboard.press("Escape");
      await sleep(300);
      const before = c.g.collect.length;
      assert.ok(before >= 2, "events were flowing");
      await page.locator("[data-analytics-preference]").scrollIntoViewIfNeeded();
      await page.click("[data-analytics-preference]");
      const scriptReqAtWithdrawal = c.g.scriptReq.length;
      assert.match(await page.locator("[data-analytics-preference]").innerText(), /off/i);
      const lines = await cartLines(page);
      await page.click("[data-add-to-cart]");
      await page.waitForSelector("dialog#cart[open]");
      await page.keyboard.press("Escape");
      await page.goto(B + "/shop", { waitUntil: "networkidle" }); // a full load: the stored refusal must hold
      await page.locator("[data-product-grid] [data-product] h3 a").first().click();
      await page.waitForURL(/\/shop\/[a-z0-9-]+$/);
      await settle(page); await sleep(800);
      assert.equal(c.g.collect.length, before, "no request after the withdrawal");
      assert.equal(c.g.scriptReq.length, scriptReqAtWithdrawal, "and the script was not requested again after the withdrawal, not even on a full load");
      assert.doesNotMatch(await page.evaluate(() => document.cookie), /_ga/, "analytics cookies expired");
      assert.ok((await cartLines(page)) >= lines, "the cart is kept");
      assert.equal(await page.evaluate(() => localStorage.getItem("kpt-analytics-consent-v1")), "denied");
    });

    await check("case 6b: same-session withdrawal without a reload also stops route changes", async () => {
      const c = await ctx(); const page = await c.newPage();
      await page.goto(B + "/shop", { waitUntil: "networkidle" });
      await page.click("[data-consent-accept]");
      await page.waitForFunction(() => window.__stub !== undefined);
      await sleep(500);
      await page.locator("[data-analytics-preference]").scrollIntoViewIfNeeded();
      await page.click("[data-analytics-preference]");
      const before = c.g.collect.length;
      await page.locator("[data-product-grid] [data-product] h3 a").first().click(); // client-side route change
      await page.waitForURL(/\/shop\/[a-z0-9-]+$/);
      await settle(page); await sleep(800);
      await page.click("[data-add-to-cart]").catch(() => {});
      await sleep(500);
      assert.equal(c.g.collect.length, before);
    });

    await check("case 7: Google sees no query text, email, link parameters or full referrer path; no PII in console; no contact-capture form on our pages", async () => {
      const c = await ctx(); const page = await c.newPage();
      await page.goto(B + "/shop?q=jane%40example.com&email=a%40b.co&_gl=1*abc&utm_source=ig&utm_medium=qa", { waitUntil: "networkidle", referer: "https://www.google.com/search?q=secret" });
      await page.click("[data-consent-accept]");
      await page.waitForFunction(() => window.__stub !== undefined);
      await page.click('#nav a:text-is("STORY")');
      await page.waitForURL(/\/story$/);
      await settle(page); await sleep(600);
      const everything = JSON.stringify([c.g.collect.map((u) => u.href), await layerCommands(page), c.g.console]);
      assert.doesNotMatch(everything, /jane|%40|@|_gl|secret|email=|[?&]q=|a%40b/i);
      const first = new URL(dls(c, "page_view")[0]);
      assert.equal(first.pathname, "/shop");
      assert.equal(first.search, "?utm_source=ig&utm_medium=qa");
      assert.ok(c.g.collect.every((u) => !u.searchParams.get("dl").startsWith("document:")), "every hit carries our cleaned URL, never the raw document URL");
      assert.equal(new URL(c.g.collect[0].searchParams.get("dr")).href, "https://www.google.com/", "external referrer reduced to its origin");
      const fresh = await ctx(); const p2 = await fresh.newPage();
      for (const path of ["/", "/shop", MAT]) {
        await p2.goto(B + path, { waitUntil: "networkidle" });
        assert.deepEqual(findForbiddenForms(await p2.content()), [], `${path} (banner visible)`);
      }
    });

    await check("case 8a: the Google script is blocked: shopping and checkout work, no page error, nothing keeps queueing", async () => {
      const c = await ctx("block"); const page = await c.newPage();
      await page.goto(B + "/shop", { waitUntil: "networkidle" });
      await page.click("[data-consent-accept]");
      await sleep(500);
      assert.equal(c.g.scriptReq.length, 1);
      await addMat(page, B);
      const snap = await checkout(c, page, B);
      assert.ok(snap.checkoutMs < 15000);
      assert.equal(c.g.collect.length, 0);
      assert.deepEqual(c.g.pageErrors, []);
      assert.ok(snap.layerLength <= 40, `bounded layer, got ${snap.layerLength}`);
    });

    await check("case 8b: the Google script is slow (held): shopping and checkout work meanwhile; the buffer stays short", async () => {
      const c = await ctx("slow"); const page = await c.newPage();
      await page.goto(B + "/shop", { waitUntil: "networkidle" });
      await page.click("[data-consent-accept]");
      await addMat(page, B, "domcontentloaded"); // the held script keeps `load` and idle from ever happening: the page is still usable
      const snap = await checkout(c, page, B, "domcontentloaded");
      assert.ok(snap.checkoutMs < 15000, "checkout is not waiting for the tag");
      assert.deepEqual(c.g.pageErrors, []);
      assert.ok(snap.layerLength <= 40, `bounded layer, got ${snap.layerLength}`);
      c.g.release?.();
    });

    await check("case 9: no purchase leaves the app: not at checkout redirect, not anywhere", async () => {
      const c = await ctx(); const page = await c.newPage();
      await page.goto(B + "/shop", { waitUntil: "networkidle" });
      await page.click("[data-consent-accept]");
      await page.waitForFunction(() => window.__stub !== undefined);
      await addMat(page, B);
      const snap = await checkout(c, page, B);
      await sleep(500);
      assert.ok(events(c).includes("begin_checkout"));
      assert.ok(events(c).includes("checkout_redirect"));
      assert.equal(events(c).some((e) => /purchase|refund/.test(e)), false);
      assert.equal(JSON.stringify(snap.processed).includes("purchase"), false);
      assert.equal(snap.dataLayer.includes("purchase"), false);
      assert.equal(snap.rawArrays, false, "no raw array in the Google layer");
    });

    await check("safety: no request ever left for a host other than loopback, the intercepted Google hosts and the intercepted checkout", async () => {
      // every non-loopback request was aborted by the catch-all route; the fixture catalog's product images live on Fourthwall's image host
      const allowed = (u) => u.startsWith("https://keepitunderground-shop.fourthwall.com/") || u.startsWith("https://imgproxy.fourthwall.dev/");
      const bad = contexts.flatMap((c) => c.g.external.filter((u) => !allowed(u)));
      assert.deepEqual(bad, [], JSON.stringify(bad.slice(0, 5)));
      assert.equal(contexts.flatMap((c) => c.g.external).some((u) => GOOGLE.test(u)), false, "Google hosts only ever hit the dedicated interceptor");
      const other = contexts.flatMap((c) => c.g.otherGoogle);
      assert.deepEqual(other, [], JSON.stringify(other.slice(0, 5)));
    });
  } finally { srv.app.kill(); }
} finally {
  for (const c of contexts) await c.close().catch(() => {});
  await browser?.close();
  mock.close();
}

console.log(results.map((r) => `${r.status}  ${r.name}${r.note ? "  — " + r.note : ""}`).join("\n"));
await writeFile(`${OUT}/browser-mock.json`, JSON.stringify({ at: new Date().toISOString(), scope: "stubbed gtag.js, intercepted Google hosts, fictional ID; real collection NOT_RUN", results }, null, 2));
const failed = results.filter((r) => r.status === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} passed -> ${OUT}`);
process.exit(failed ? 1 : 0);
