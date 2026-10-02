// Real-HTTP contract test (KPT-03/04/12): builds and starts the site against a local mock Fourthwall
// Storefront and checks actual status codes and responses. Never talks to the real Fourthwall API.
// Run: npm run test:http   (≈2 min: it runs its own `next build`)
import { spawn } from "node:child_process";
import { MOCK_TOKEN, startMockFourthwall } from "./mock-fourthwall.mjs";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const root = new URL("../../", import.meta.url);
const fixture = JSON.parse(await readFile(new URL("tests/store/fixtures/public-catalog-2026-10-02.json", root), "utf8"));
const MOCK_PORT = 39217;
const APP_PORT = 39218;
const { server: mock, cartBodies } = await startMockFourthwall(MOCK_PORT, fixture);

const env = {
  ...process.env,
  FOURTHWALL_STOREFRONT_TOKEN: MOCK_TOKEN,
  FOURTHWALL_STOREFRONT_API_BASE: `http://127.0.0.1:${MOCK_PORT}/`,
  NEXT_TELEMETRY_DISABLED: "1",
};
const run = (args, opts = {}) => spawn(process.execPath, [new URL("node_modules/next/dist/bin/next", root).pathname, ...args], { cwd: root.pathname, env, stdio: ["ignore", "pipe", "pipe"], ...opts });
const exit = (child) => new Promise((r) => child.on("exit", r));

const results = [];
const check = async (name, fn) => {
  try { await fn(); results.push(["PASS", name]); } catch (e) { results.push(["FAIL", name, e.message.split("\n")[0]]); }
};

let server;
try {
  const build = run(["build"]);
  let buildLog = ""; build.stdout.on("data", (d) => (buildLog += d)); build.stderr.on("data", (d) => (buildLog += d));
  if ((await exit(build)) !== 0) throw new Error("build failed:\n" + buildLog.slice(-2000));
  server = run(["start", "-p", String(APP_PORT), "-H", "127.0.0.1"]);
  const base = `http://127.0.0.1:${APP_PORT}`;
  for (let i = 0; i < 60; i++) { try { await fetch(base + "/robots.txt"); break; } catch { await new Promise((r) => setTimeout(r, 500)); } }

  await check("B13: unknown slug → 404", async () => {
    assert.equal((await fetch(base + "/shop/does-not-exist")).status, 404);
  });
  await check("real product → 200 with no preselected size and a missing-size-chart notice", async () => {
    const r = await fetch(base + "/shop/kpt-heavyweight-tee");
    assert.equal(r.status, 200);
    const html = await r.text();
    assert.ok(html.includes("Choose a size"));
    assert.equal(/data-variant-option="[^"]+" aria-pressed="true"/.test(html), false, "no size preselected");
    assert.ok(html.includes('data-fit="missing"'));
    assert.ok(html.includes('"@type":"AggregateOffer"') && html.includes('"lowPrice":"35.00"') && html.includes('"highPrice":"41.00"'));
    assert.ok(html.includes('rel="canonical" href="https://keepitunderground.com/shop/kpt-heavyweight-tee"'));
  });
  for (const [slug, why] of [["boom-product", "upstream 500"], ["busy-product", "upstream 429"], ["junk-product", "invalid JSON"], ["slow-product", "upstream timeout"]]) {
    await check(`B12/KPT-03: ${why} is not reported as 404 / not found`, async () => {
      const r = await fetch(base + `/shop/${slug}`);
      const html = await r.text();
      assert.notEqual(r.status, 404, `status ${r.status}`);
      assert.ok(r.status >= 500, `expected 5xx, got ${r.status}`);
      assert.equal(/This page could not be found|404/.test(html.replace(/<script[\s\S]*?<\/script>/g, "")) && !html.includes("SIGNAL LOST"), false);
    });
  }

  const tee4xl = "13698b07-9fb3-4500-9fe0-afe48a36e003";
  const post = (body, headers = {}) => fetch(base + "/api/cart/checkout", { method: "POST", headers: { "content-type": "application/json", origin: base, ...headers }, body: typeof body === "string" ? body : JSON.stringify(body) });

  await check("checkout: valid line → 200 hosted Fourthwall URL; only id+quantity reach Fourthwall", async () => {
    const r = await post({ items: [{ variantId: tee4xl, quantity: 1, expectedCents: 4100, priceCents: 1 }] });
    assert.equal(r.status, 200);
    const { url } = await r.json();
    assert.ok(url.startsWith("https://keepitunderground-shop.fourthwall.com/checkout/"));
    assert.deepEqual(cartBodies.at(-1), { items: [{ variantId: tee4xl, quantity: 1 }] });
  });
  await check("A10: stale displayed price → 409 PRICE_CHANGED and no cart created", async () => {
    const before = cartBodies.length;
    const r = await post({ items: [{ variantId: tee4xl, quantity: 1, expectedCents: 3500 }] });
    assert.equal(r.status, 409);
    assert.deepEqual((await r.json()).lines, [{ variantId: tee4xl, unitCents: 4100 }]);
    assert.equal(cartBodies.length, before);
  });
  await check("foreign Origin → 403; malformed Origin → 403 (not 500)", async () => {
    assert.equal((await post({ items: [] }, { origin: "https://evil.example" })).status, 403);
    assert.equal((await post({ items: [] }, { origin: "null" })).status, 403);
  });
  await check("oversized body → 413; bad JSON → 400; unknown variant → 400; qty 11 → 400", async () => {
    assert.equal((await post("x".repeat(20000))).status, 413);
    assert.equal((await post("{oops")).status, 400);
    assert.equal((await post({ items: [{ variantId: "00000000-0000-4000-8000-000000000000", quantity: 1 }] })).status, 400);
    assert.equal((await post({ items: [{ variantId: tee4xl, quantity: 11 }] })).status, 400);
  });
  await check("KPT-12: sitemap lists the 22 public products + static pages; robots blocks api/preview/filters", async () => {
    const xml = await (await fetch(base + "/sitemap.xml")).text();
    assert.equal((xml.match(/\/shop\/[a-z0-9-]+<\/loc>/g) ?? []).length, 22);
    assert.ok(xml.includes("https://keepitunderground.com/help</loc>"));
    const robots = await (await fetch(base + "/robots.txt")).text();
    for (const d of ["/api/", "/commerce-preview", "/shop?*"]) assert.ok(robots.includes(`Disallow: ${d}`), d);
  });
  await check("/help and /shop render; shop SSR shows all 22 cards for no-JS visitors", async () => {
    assert.equal((await fetch(base + "/help")).status, 200);
    const html = await (await fetch(base + "/shop")).text();
    const cards = new Set(html.match(/data-product="[a-z0-9-]+"/g)).size;
    assert.equal(cards, 22, `cards ${cards}`);
  });
} finally {
  server?.kill();
  mock.close();
}

for (const r of results) console.log(r.join("  "));
const failed = results.filter((r) => r[0] === "FAIL").length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
