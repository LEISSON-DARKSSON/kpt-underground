// Negative control for the "no contact-capture form on our pages" check: the fixture WITH a signup form must
// make the check fail, the fixture WITHOUT one must pass. Neither fixture is ever served by the app.
// run: node --test tests/measurement/forbidden-form.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import { PATTERNS, assertNoControlCharacters, findForbiddenForms } from "./lib/forbidden-form.mjs";

const fixture = (name) => fs.readFileSync(new URL(`./fixtures/${name}`, import.meta.url), "utf8");

test("the scanner flags a page with a signup form (all three rules fire)", () => {
  assert.deepEqual(findForbiddenForms(fixture("page-with-signup-form.html")).sort(), ["emailInput", "formTag", "hintedField"]);
});

test("the scanner passes a page without any form", () => {
  assert.deepEqual(findForbiddenForms(fixture("page-without-form.html")), []);
});

test("each rule works on its own (so removing one would not go unnoticed)", () => {
  assert.deepEqual(findForbiddenForms('<form action="/x"></form>'), ["formTag"]);
  assert.deepEqual(findForbiddenForms('<input type="email">'), ["emailInput"]);
  assert.deepEqual(findForbiddenForms('<input name="newsletter">'), ["hintedField"]);
  assert.deepEqual(findForbiddenForms('<input type="text" name="q" placeholder="Search">'), []);
  assert.deepEqual(findForbiddenForms('<form role="search" action="/shop"><input type="search" name="q"></form>'), [], "a catalog search box is not contact capture");
});

test("the patterns contain no control character (a raw backspace once made a pattern match nothing)", () => {
  assert.doesNotThrow(assertNoControlCharacters);
  assert.ok(PATTERNS.hintedField.source.includes("\\b"), "the word boundary is the two-character token, not a raw character");
  assert.throws(() => {
    const bad = new RegExp("a\bb"); // a real backspace: the failure this test exists to catch
    for (const ch of bad.source) if (ch.charCodeAt(0) < 32) throw new Error("control character");
  });
});
