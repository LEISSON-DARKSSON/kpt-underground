import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk("src").filter((f) => /\.(tsx|css)$/.test(f) && !f.includes("commerce"));

const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

test("muted text token meets WCAG AA on ink", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  const m = css.match(/--muted:\s*(#[0-9a-fA-F]{6})/)[1];
  assert.ok(ratio(m, "#050505") >= 4.5, `muted ${m} contrast too low`);
});

test("no readable text below 10px in app source", () => {
  const bad = [];
  for (const f of files) {
    const s = readFileSync(f, "utf8");
    if (/text-\[(?:[0-9])px\]/.test(s)) bad.push(f);
  }
  assert.deepEqual(bad.filter((f) => !f.includes("cursor-engine")), []);
});

test("navbar is visible immediately and mobile menu is inert when closed", () => {
  const s = readFileSync("src/components/layout/navbar.tsx", "utf8");
  assert.doesNotMatch(s, /setTimeout\(\(\) => setShow/);
  assert.match(s, /inert=\{!menuOpen\}/);
  assert.match(s, /aria-controls="mobile-menu"/);
  assert.match(s, /Escape/);
});

test("custom cursor is limited to fine pointers", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)\s*\{\s*body \{ cursor: none; \}/);
});
