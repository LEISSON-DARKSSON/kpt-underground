// H03 claim register guard. The register (docs/claim-register.json) lists every visible brand,
// Signal, membership, event, access, advertising and history claim. This test does not judge
// whether a claim is approved (pending owner decisions are allowed). It checks that:
//   1. the register is well-formed,
//   2. every registered string still occurs verbatim in its file (a copy edit forces a register update),
//   3. every risky keyword hit in the scanned source is covered by a registered string.
import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const read = async (rel) => (await readFile(new URL(rel, root), "utf8")).replace(/\r\n/g, "\n");

const CLASSES = ["SHOP_FACT", "BRAND_POETRY", "SERVICE_PROMISE", "UNSUPPORTED"];
const STATUSES = ["OK", "OWNER_DECISION_NEEDED", "REWRITE_PROPOSED"];

const FIXED_FILES = [
  "src/app/page.tsx",
  "src/app/story/page.tsx",
  "src/app/signal/page.tsx",
  "src/app/layout.tsx",
  "src/app/help/page.tsx",
  "src/components/layout/footer.tsx",
  "src/components/layout/navbar.tsx",
];
const COMPONENT_DIRS = ["src/components/home", "src/components/story", "src/components/signal"];

async function scannedFiles() {
  const files = [...FIXED_FILES];
  for (const dir of COMPONENT_DIRS) {
    const names = (await readdir(new URL(`${dir}/`, root))).filter((n) => /\.tsx?$/.test(n)).sort();
    for (const n of names) files.push(`${dir}/${n}`);
  }
  return files;
}

// Left boundary only: skips baseFrequency, refunded, pointer-events, MouseEvent; still catches MEMBERS ONLY.
const RISKY = /(?<![\w-])(members?|membership|closed channel|exclusive|events?|frequency|we do not advertise|no conventional channels|artists?|fund)/gi;

// Code-only lines that contain a keyword but render nothing. Keep this list tiny and exact.
const CODE_ONLY = [
  {
    file: "src/components/signal/signal-feed.tsx",
    pattern: /^\s*type: "LOCATION" \| "FREQUENCY" \| "EVENT" \| "DROP" \| "BROADCAST";\s*$/,
    why: "TypeScript union of entry types (the visible badges are registered via their data lines)",
  },
  {
    file: "src/components/signal/signal-feed.tsx",
    pattern: /^\s*case "(FREQUENCY|EVENT)": return "var\(--[a-z]+\)";\s*$/,
    why: "colour mapping for the type badge",
  },
];

/** Remove what is never visible: comments, import lines and the FrequencyGate identifiers. */
function visibleLines(source) {
  const noBlock = source.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ""));
  return noBlock.split("\n").map((line) => {
    if (/^\s*\/\//.test(line)) return "";
    if (/^\s*import\b/.test(line)) return "";
    return line.replace(/\bFrequencyGate\w*/g, "");
  });
}

const register = JSON.parse(await readFile(new URL("docs/claim-register.json", root), "utf8"));
const files = await scannedFiles();

test("register is a non-empty array with the required schema", () => {
  assert.ok(Array.isArray(register) && register.length > 0, "docs/claim-register.json must be a non-empty array");
  const ids = new Set();
  for (const r of register) {
    const label = `entry ${r?.id}`;
    assert.deepEqual(
      Object.keys(r).sort(),
      ["class", "evidence", "file", "id", "line", "proposed", "status", "text"],
      `${label}: unexpected or missing fields`,
    );
    assert.match(r.id, /^H03-\d{3}$/, `${label}: id format`);
    assert.ok(!ids.has(r.id), `${label}: duplicate id`);
    ids.add(r.id);
    assert.equal(typeof r.file, "string", `${label}: file`);
    assert.ok(Number.isInteger(r.line) && r.line > 0, `${label}: line must be a positive integer`);
    assert.equal(typeof r.text, "string", `${label}: text`);
    assert.ok(r.text.trim().length > 0 && !r.text.includes("\n"), `${label}: text must be one non-empty line`);
    assert.ok(CLASSES.includes(r.class), `${label}: class "${r.class}" not in ${CLASSES.join("/")}`);
    assert.ok(STATUSES.includes(r.status), `${label}: status "${r.status}" not in ${STATUSES.join("/")}`);
    assert.equal(typeof r.evidence, "string", `${label}: evidence`);
    assert.ok(r.evidence.trim().length > 0, `${label}: evidence must be a file, URL or "none" (never empty)`);
    assert.equal(typeof r.proposed, "string", `${label}: proposed`);
    if (r.status !== "OK") assert.ok(r.proposed.trim().length > 0, `${label}: status ${r.status} needs a proposed rewrite`);
  }
});

test("register rules: unsupported claims are never OK, promises need evidence", () => {
  for (const r of register) {
    if (r.class === "UNSUPPORTED") assert.notEqual(r.status, "OK", `${r.id}: UNSUPPORTED claim cannot be OK`);
    if (r.class === "SERVICE_PROMISE" && r.status === "OK") {
      assert.doesNotMatch(r.evidence, /^none\b/i, `${r.id}: SERVICE_PROMISE marked OK without evidence`);
    }
  }
});

test("registered files are part of the scanned set and exist", async () => {
  for (const r of register) {
    assert.ok(files.includes(r.file), `${r.id}: ${r.file} is not in the scanned file list`);
    const src = await read(r.file);
    assert.ok(r.line <= src.split("\n").length, `${r.id}: line ${r.line} is beyond the end of ${r.file}`);
  }
});

test("every registered text still occurs verbatim in its file", async () => {
  const wanted = new Map(); // "file\0text" -> { ids, count }
  for (const r of register) {
    const key = `${r.file}\0${r.text}`;
    const w = wanted.get(key) ?? { r, ids: [] };
    w.ids.push(r.id);
    wanted.set(key, w);
  }
  const stale = [];
  for (const { r, ids } of wanted.values()) {
    const src = await read(r.file);
    let found = 0;
    for (let i = src.indexOf(r.text); i !== -1; i = src.indexOf(r.text, i + 1)) found += 1;
    if (found < ids.length) stale.push(`${ids.join(",")} ${r.file}: expected ${ids.length} occurrence(s) of ${JSON.stringify(r.text)}, found ${found}`);
  }
  assert.deepEqual(stale, [], `Copy changed. Update docs/claim-register.json and docs/claim-register.md:\n${stale.join("\n")}`);
});

test("every risky keyword hit in the listed sources is covered by a register entry", async () => {
  const uncovered = [];
  let totalHits = 0;
  for (const file of files) {
    const src = await read(file);

    // Lines covered by registered texts (every occurrence, not just the recorded line).
    const covered = new Set();
    for (const r of register.filter((x) => x.file === file)) {
      for (let i = src.indexOf(r.text); i !== -1; i = src.indexOf(r.text, i + 1)) {
        const first = src.slice(0, i).split("\n").length;
        const last = first + (r.text.match(/\n/g) ?? []).length;
        for (let l = first; l <= last; l += 1) covered.add(l);
      }
    }

    const rawLines = src.split("\n");
    visibleLines(src).forEach((line, idx) => {
      const lineNo = idx + 1;
      if (CODE_ONLY.some((c) => c.file === file && c.pattern.test(rawLines[idx]))) return;
      const hits = [...line.matchAll(RISKY)].map((m) => m[0]);
      if (hits.length === 0) return;
      totalHits += hits.length;
      if (!covered.has(lineNo)) uncovered.push(`${file}:${lineNo} [${hits.join(", ")}] ${rawLines[idx].trim()}`);
    });
  }
  assert.ok(totalHits > 0, "keyword scan found nothing: the scan itself is broken");
  assert.deepEqual(
    uncovered,
    [],
    `Risky wording not in the claim register. Add an entry (class, evidence, status) to docs/claim-register.json:\n${uncovered.join("\n")}`,
  );
});

test("keyword scan sees the claims it is meant to guard (self-check)", () => {
  const sample = ['<span>MEMBERS ONLY</span>', "A closed channel for all", '"WE DO NOT ADVERTISE",', "baseFrequency refunded pointer-events-none"];
  const hits = sample.map((s) => [...s.matchAll(RISKY)].length);
  assert.deepEqual(hits, [1, 1, 1, 0]);
});
