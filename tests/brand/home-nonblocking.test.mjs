// H01 + H02 source-level guards. Real behaviour (pointer events, overlay, widths) is checked in tests/e2e/browser-qa.mjs.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (p) => readFile(new URL(`../../${p}`, import.meta.url), "utf8");

test("H01: the home intro is a transparent, non-interactive, non-delaying sweep", async () => {
  const loader = await read("src/components/brand/page-loader.tsx");
  assert.match(loader, /pathname !== "\/"/, "intro is home-only");
  assert.match(loader, /aria-hidden="true"/);
  const css = await read("src/app/globals.css");
  const block = /#boot-sweep\s*\{[^}]*\}/.exec(css)?.[0] ?? "";
  assert.ok(block, "#boot-sweep rule exists");
  assert.match(block, /pointer-events:\s*none/);
  assert.doesNotMatch(block, /background:\s*var\(--ink\)|background:\s*#0|background-color/i, "never an opaque cover");
  assert.match(block, /height:\s*2px/, "a thin line, not a full-screen layer");
  const anim = /animation:\s*boot-sweep\s+([\d.]+)s\s+[^;]*?\s([\d.]+)s\s/.exec(block);
  assert.ok(anim, "animation has a duration and a delay");
  assert.ok(Number(anim[2]) <= 0.2, `start delay ${anim[2]}s must stay tiny`);
  assert.ok(Number(anim[1]) <= 1.2, `duration ${anim[1]}s must stay short`);
  assert.match(css, /prefers-reduced-motion: reduce\)\s*\{[^}]*#boot-sweep\s*\{\s*display:\s*none/, "no intro under reduced motion");
});

test("H01: the old blocking loader is gone (no #loader, no loader-out/loader-fill/loader-pulse)", async () => {
  const loader = await read("src/components/brand/page-loader.tsx");
  const css = await read("src/app/globals.css");
  assert.doesNotMatch(loader, /id="loader"|loader-out|INITIALIZING|position:\s*"fixed"/);
  assert.doesNotMatch(css, /@keyframes loader-(out|fill|pulse)|#loader\b/);
});

test("H02: hero keeps one H1 and one CTA, shows a real object, proof directly under the CTA", async () => {
  const page = await read("src/app/page.tsx");
  assert.equal((page.match(/<h1\b/g) ?? []).length, 1);
  assert.ok(/<HeroProduct \/>/.test(page), "hero shows a real catalog object");
  assert.ok(/<HeroCTAs \/>\s*<HeroStats \/>/.test(page), "proof stays directly under the CTA");
  const product = await read("src/components/home/hero-product.tsx");
  assert.match(product, /getProducts\(\)/, "image comes from the live catalog");
  assert.doesNotMatch(product, /https?:\/\/(?!fourthwall)[^"'\s]*\.(png|jpe?g|webp)/i, "no hard-coded picture URL");
  assert.match(product, /Digital visualisation/, "renders are labelled as renders");
  assert.match(product, /if \(!product\) return null/, "no product -> no invented picture");
  assert.equal(/\$\s?\d{2}/.test(product), false, "no hard-coded price");
});

test("H02: the manifesto comes after the product picks, and the picks have an honest title", async () => {
  const page = await read("src/app/page.tsx");
  const picks = page.indexOf("<ProductGrid picks />");
  const manifesto = page.indexOf("<ManifestoStrip />");
  assert.ok(picks > 0 && manifesto > picks, "ManifestoStrip is rendered after the Studio picks");
  assert.match(page, /STUDIO <span[^>]*>PICKS<\/span>/);
  assert.doesNotMatch(page, /DESK OBJECTS\.|WALL STUDIES/, "the six picks contain no wall print");
});

test("H02: hero is not forced to 100vh and the hero image box keeps a 3:2 window without hard crops of the artwork", async () => {
  const page = await read("src/app/page.tsx");
  assert.doesNotMatch(page, /minHeight:\s*"100vh"/);
  const css = await read("src/app/globals.css");
  assert.match(css, /\.hero-figure-frame\s*\{[^}]*aspect-ratio:\s*3\s*\/\s*2/);
});
