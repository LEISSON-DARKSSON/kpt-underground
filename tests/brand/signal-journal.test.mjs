// Pins the Signal open-journal change (docs/signal-journal-proposal.md, section f): no gate, no membership
// or event promise, no invented journal entries, no signup, and the honest empty state.
import test from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const read = async (rel) => (await readFile(new URL(rel, root), "utf8")).replace(/\r\n/g, "\n");

async function sourceFiles(dir = "src") {
  const out = [];
  for (const e of await readdir(new URL(`${dir}/`, root), { withFileTypes: true })) {
    const rel = `${dir}/${e.name}`;
    if (e.isDirectory()) out.push(...(await sourceFiles(rel)));
    else if (/\.(tsx?|css)$/.test(e.name)) out.push(rel);
  }
  return out;
}

const FORBIDDEN_COPY = [
  "MEMBERS ONLY", "ACCESS GRANTED", "ACCESS RESTRICTED", "FREQ-GATED", "LIVE FEED", "DIRECT ACCESS", "DIRECT EVENT ACCESS",
  "SIGNAL NETWORK", "ENTER SIGNAL", "closed channel", "closed, non-algorithmic", "no public existence", "140HZ",
  "WE DO NOT ADVERTISE", "NO CONVENTIONAL CHANNELS", "before the brand existed",
  "CORRECT_CODE", "NEOONDREED", "Krematoorium", "Field Jacket", "SS-2025", "Warehouse district", "Arch 42",
];

test("no gate, members-only or invented-entry wording remains in src/", async () => {
  const files = await sourceFiles();
  const hits = [];
  for (const f of files) {
    const src = await read(f);
    for (const w of FORBIDDEN_COPY) if (src.includes(w)) hits.push(`${f}: ${w}`);
    if (/\d+\.\d+°[NS]/.test(src)) hits.push(`${f}: coordinate pattern`);
  }
  assert.deepEqual(hits, []);
});

test("the frequency gate component is gone", () => {
  assert.equal(existsSync(new URL("src/components/signal/frequency-gate.tsx", root)), false);
});

test("/signal has no form, email field or signup promise", async () => {
  for (const f of ["src/app/signal/page.tsx", "src/components/signal/signal-page-client.tsx", "src/components/signal/signal-feed.tsx"]) {
    const src = await read(f);
    assert.doesNotMatch(src, /<form\b|type="email"|subscribe|newsletter|"use client"/i, f);
  }
});

test("/signal shows the honest empty state and an open page", async () => {
  const feed = await read("src/components/signal/signal-feed.tsx");
  assert.match(feed, /NO ENTRIES YET\./);
  assert.match(feed, /href="\/shop"/);
  assert.match(feed, /data-cursor="shop"/);
});

test("/signal metadata is open and honest", async () => {
  const page = await read("src/app/signal/page.tsx");
  assert.match(page, /title: "Signal",/);
  assert.match(page, /description: "Studio notes from KEEP IT UNDERGROUND: design process and new objects\. Open to everyone\."/);
  const meta = page.slice(page.indexOf("export const metadata"), page.indexOf("export default"));
  assert.doesNotMatch(meta, /network|member|closed/i);
});

test("home Signal CTA reads the Signal and links to /signal", async () => {
  const page = await read("src/app/page.tsx");
  assert.match(page, /href="\/signal"[\s\S]*?READ THE SIGNAL/);
  assert.doesNotMatch(page, /NETWORK/);
});

test("nav and footer still link to /signal", async () => {
  assert.match(await read("src/components/layout/navbar.tsx"), /href: "\/signal"/);
  assert.match(await read("src/components/layout/footer.tsx"), /href: "\/signal"/);
});

test("owner final edits: WE KEEP CREATING in the manifesto, STUDIO JOURNAL badge on /signal (OPEN stays)", async () => {
  const strip = await read("src/components/home/manifesto-strip.tsx");
  const story = await read("src/components/story/story-manifesto.tsx");
  assert.match(strip, /"WE KEEP CREATING"/);
  assert.match(story, /"WE KEEP CREATING\."/);
  for (const s of [strip, story]) assert.doesNotMatch(s, /WE ARE INDEPENDENT|WE DO NOT ADVERTISE|NO CONVENTIONAL CHANNELS/);
  const sig = await read("src/app/signal/page.tsx");
  const heroBadges = sig.slice(sig.indexOf("export default"));
  assert.doesNotMatch(heroBadges, /CLASSIFIED/, "no restricted-sounding badge on the open /signal page");
  assert.match(heroBadges, /STUDIO JOURNAL/);
  assert.match(heroBadges, /\bOPEN\b/);
});
