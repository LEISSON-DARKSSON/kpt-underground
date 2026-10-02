// Home hero guards from the UX audit of 2026-10-02 (rpt_IR52mxnTjDN7tBGir5WiUXk3l1INbeiu).
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (p) => readFile(new URL(`../../${p}`, import.meta.url), "utf8");

test("home has exactly one H1 and it states the offer, not just the brand name", async () => {
  const page = await read("src/app/page.tsx");
  assert.equal((page.match(/<h1\b|as="h1"/g) ?? []).length, 1);
  const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/.exec(page)?.[1].replace(/\s+/g, " ").trim() ?? "";
  assert.ok(h1.split(" ").length >= 6, `H1 too short: "${h1}"`);
  assert.equal(/^KEEP IT( UNDERGROUND)?\.?$/i.test(h1), false);
});

test("hero has one primary CTA and proof is rendered right after it", async () => {
  const ctas = await read("src/components/home/hero-ctas.tsx");
  assert.equal((ctas.match(/<Link\b/g) ?? []).length, 1);
  const page = await read("src/app/page.tsx");
  assert.ok(/<HeroCTAs \/>\s*<HeroStats \/>/.test(page), "proof directly under the CTA");
  const stats = await read("src/components/home/hero-stats.tsx");
  assert.equal(/"use client"/.test(stats), false, "proof is server-rendered from the live catalog");
  assert.equal(/bestseller|\d+\+?\s*(customers|reviews|orders)|★/i.test(stats), false, "no unverifiable proof");
});

test("navigation has no HOME item duplicating the logo link", async () => {
  const nav = await read("src/components/layout/navbar.tsx");
  assert.equal(/label: "HOME"/.test(nav), false);
});
