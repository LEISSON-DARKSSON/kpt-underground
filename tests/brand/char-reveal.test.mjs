// CharReveal must wrap only between words (regression: /story "UNDERS / TOOD", "YO / U", 2026-10-02).
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const src = await readFile(new URL("../../src/components/brand/char-reveal.tsx", import.meta.url), "utf8");

test("letters are grouped into unbreakable words separated by normal spaces", () => {
  assert.ok(/data-word/.test(src) && /whiteSpace:\s*"nowrap"/.test(src), "each word is one nowrap unit");
  assert.equal(src.includes("&nbsp;"), false, "no non-breaking spaces between words");
  assert.ok(/aria-label=\{text\}/.test(src), "screen readers get the sentence, not single letters");
});
