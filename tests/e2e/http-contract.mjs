// Real-HTTP contract test (KPT-03/04/12): builds and starts the site against a local mock Fourthwall
// Storefront and checks actual status codes and responses. Never talks to the real Fourthwall API.
// Run: npm run test:http   (≈2 min: it runs its own `next build`)
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
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
const run = (args, opts = {}) => spawn(process.execPath, [fileURLToPath(new URL("node_modules/next/dist/bin/next", root)), ...args], { cwd: fileURLToPath(root), env, stdio: ["ignore", "pipe", "pipe"], ...opts });
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
  await check("KPT-03: a product the public collection lists is never answered with 404 (inconsistent upstream → 5xx)", async () => {
    const r = await fetch(base + "/shop/wall-studies-signal-01");
    assert.ok(r.status >= 500, `status ${r.status}`);
  });
  await check("real product → 200 with no preselected size and a source-backed size chart (H04)", async () => {
    const r = await fetch(base + "/shop/kpt-heavyweight-tee");
    assert.equal(r.status, 200);
    const html = await r.text();
    assert.ok(html.includes("Choose a size"));
    assert.equal(/data-variant-option="[^"]+" aria-pressed="true"/.test(html), false, "no size preselected");
    assert.ok(html.includes('data-fit="sourced"') && !html.includes('data-fit="missing"'), "tee has the sourced chart, no missing notice");
    assert.ok(html.includes('data-size-chart') && html.includes('26.62&quot;') && html.includes('24.63&quot;'), "chart values are server-rendered");
    const hoodie = await (await fetch(base + "/shop/kpt-premium-hoodie")).text();
    assert.ok(hoodie.includes('data-fit="missing"') && !hoodie.includes('data-size-chart'), "hoodie without a verified source still says the chart is missing");
    const crew = await (await fetch(base + "/shop/kpt-crewneck")).text();
    assert.ok(crew.includes('data-fit="sourced"') && !crew.includes('data-fit="missing"') && crew.includes('data-size-chart'), "crewneck has the sourced chart, no missing notice");
    assert.equal((crew.match(/data-size-row="/g) ?? []).length, 6, "crewneck chart lists S-3XL");
    assert.ok(crew.includes('data-fit-model="Cotton Heritage M2480 Premium Sweatshirt"') && crew.includes('26.5&quot;') && crew.includes('23.5&quot;'), "crewneck chart values are server-rendered");
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
  await check("Signal is an open studio journal: /signal and /story answer 200 without membership, gate or invented entries", async () => {
    const signal = await fetch(base + "/signal");
    assert.equal(signal.status, 200);
    const s = await signal.text();
    assert.ok(s.includes("NO ENTRIES YET."), "honest empty state");
    assert.equal(/MEMBERS ONLY|ACCESS GRANTED|140HZ|closed channel|<form\b|type="email"/i.test(s), false, "no gate, membership wording or signup form");
    const story = await (await fetch(base + "/story")).text();
    assert.equal(/closed channel|members only|140HZ/i.test(story), false, "no closed-channel promise on /story");
    const home = await (await fetch(base + "/")).text();
    assert.equal(/FREQ: 140HZ|ENTER SIGNAL NETWORK|closed channel/i.test(home), false, "no gate hint or network promise on the home page");
    assert.ok(home.includes("WE KEEP CREATING"), "manifesto reads WE KEEP CREATING");
    assert.equal(/WE ARE INDEPENDENT|WE DO NOT ADVERTISE|NO CONVENTIONAL CHANNELS/.test(home), false, "old manifesto lines are gone");
    assert.equal(/CLASSIFIED/.test(s), false, "the open /signal page has no CLASSIFIED badge");
    assert.ok(s.includes("STUDIO JOURNAL") && /OPEN/.test(s), "/signal badges: STUDIO JOURNAL and OPEN");
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
