// Read-only baseline capture of the live public site for side-by-side comparison.
import { chromium } from "playwright-core";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const out = process.argv[2]; mkdirSync(out, { recursive: true });
const b = await chromium.launch({ channel: "chrome", headless: true });
const meta = [];
for (const w of [1440, 390]) {
  const ctx = await b.newContext({ viewport: { width: w, height: w === 1440 ? 1000 : 844 } });
  const p = await ctx.newPage();
  for (const path of ["/", "/shop"]) {
    const r = await p.goto("https://keepitunderground.com" + path, { waitUntil: "networkidle" });
    await p.waitForTimeout(4500);
    const f = await p.evaluate(() => ({ loaded: [...document.fonts].filter((x) => x.status === "loaded").map((x) => `${x.family} ${x.weight}`), h1: document.querySelector("h1") ? getComputedStyle(document.querySelector("h1")).fontFamily : null, bg: getComputedStyle(document.body).backgroundColor }));
    const name = `live${path === "/" ? "-home" : "-shop"}-${w}.png`;
    await p.screenshot({ path: join(out, name) });
    meta.push({ url: "https://keepitunderground.com" + path, width: w, status: r.status(), ...f, file: name });
  }
  await ctx.close();
}
await b.close();
writeFileSync(join(out, "live-baseline.json"), JSON.stringify({ capturedAt: new Date().toISOString(), readOnly: true, meta }, null, 2));
console.log(JSON.stringify(meta, null, 1));
