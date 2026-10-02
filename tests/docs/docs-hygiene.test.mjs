// Guards agent-facing docs against encoding damage and stale instructions.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
const docs = ["CLAUDE.md", ...fs.readdirSync(path.join(root, "docs")).filter((f) => f.endsWith(".md")).map((f) => `docs/${f}`)];

for (const rel of docs) {
  test(`${rel} has no BOM and no mojibake`, () => {
    const text = fs.readFileSync(path.join(root, rel), "utf8");
    assert.notEqual(text.charCodeAt(0), 0xfeff, "starts with a BOM");
    assert.doesNotMatch(text, /Ã.|â€|�/, "contains mis-decoded UTF-8");
  });
}

test("CLAUDE.md does not point agents at removed features", () => {
  const text = fs.readFileSync(path.join(root, "CLAUDE.md"), "utf8");
  assert.doesNotMatch(text, /audio-toggle\.tsx/, "audio toggle was removed in PR #5");
  assert.doesNotMatch(text, /artists\/page\.tsx/, "artist pages are out of scope");
  assert.doesNotMatch(text, /\/sessions\/[^\s]*mnt/, "stale sandbox deploy paths");
  assert.match(text, /keepitunderground\.com/, "live domain must be documented");
});
