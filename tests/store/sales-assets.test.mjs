// H07 regressions: the sales-asset manifest matches the real public catalog and the draft copy stays honest.
// Run: node --test tests/store/sales-assets.test.mjs  (not part of npm run test:store)
import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("docs/sales-assets-manifest.json", root), "utf8"));
const fixture = JSON.parse(await readFile(new URL("tests/store/fixtures/public-catalog-2026-10-02.json", root), "utf8"));
const md = await readFile(new URL("docs/sales-assets.md", root), "utf8");

const ORIGINS = ["FOURTHWALL_DIGITAL_MOCKUP", "ARTWORK_SOURCE", "PHYSICAL_SAMPLE_PHOTO"];
const USES = ["hero", "detail", "usage-context"];
const MAT_SLUGS = ["keep-it-underground-signal-01-desk-mat", "keep-it-underground-subsurface-desk-mat"];
const FORBIDDEN = [
  /\binsulat\w*/i, /\bwaterproof\w*/i, /\bpremium\b/i, /\bbest[\s-]?sellers?\b/i, /\blimited\b/i,
  /\bonly\b[^.\n]{0,30}\bleft\b/i, /\bsales?\b/i, /\bdiscount\w*/i, /\breviews?\b/i, /\bergonomic\w*/i, /\bprotect\w*/i,
];

const products = fixture.results;
const productBySlug = (slug) => products.find((p) => p.slug === slug);
const isMockup = (a) => a.origin === "FOURTHWALL_DIGITAL_MOCKUP";

test("manifest covers exactly the two desk mats with one entry per asset", () => {
  assert.ok(Array.isArray(manifest.assets) && manifest.assets.length > 0);
  const ids = manifest.assets.map((a) => a.assetId);
  assert.equal(new Set(ids).size, ids.length, "duplicate assetId");
  assert.deepEqual([...new Set(manifest.assets.map((a) => a.slug))].sort(), [...MAT_SLUGS].sort());
  for (const a of manifest.assets) {
    for (const k of ["assetId", "offerId", "slug", "variantIds", "origin", "width", "height", "label", "allowedUses", "notes"]) {
      assert.ok(k in a, `${a.assetId}: missing ${k}`);
    }
    assert.ok(Number.isInteger(a.width) && Number.isInteger(a.height) && a.width > 0 && a.height > 0);
    assert.ok(a.notes.length > 0);
  }
});

test("every entry has an allowed origin and allowed uses", () => {
  assert.deepEqual(manifest.allowedOrigins, ORIGINS);
  for (const a of manifest.assets) {
    assert.ok(ORIGINS.includes(a.origin), `${a.assetId}: origin ${a.origin}`);
    for (const u of a.allowedUses) assert.ok(USES.includes(u), `${a.assetId}: use ${u}`);
  }
});

test("offer ids, slugs, variant ids and image ids exist in the public catalog fixture", () => {
  for (const a of manifest.assets) {
    const product = productBySlug(a.slug);
    assert.ok(product, `${a.slug} not in fixture`);
    assert.equal(product.id, a.offerId, `${a.assetId}: offerId does not match ${a.slug}`);
    assert.ok(a.variantIds.length > 0);
    for (const vid of a.variantIds) {
      assert.ok(product.variants.some((v) => v.id === vid), `${a.assetId}: variant ${vid} not on ${a.slug}`);
    }
    if (isMockup(a)) {
      const image = product.images.find((i) => i.id === a.assetId);
      assert.ok(image, `${a.assetId}: image id not on ${a.slug}`);
      assert.equal(a.width, image.width, `${a.assetId}: width`);
      assert.equal(a.height, image.height, `${a.assetId}: height`);
      for (const vid of a.variantIds) {
        const variant = product.variants.find((v) => v.id === vid);
        assert.ok(variant.images.some((i) => i.id === a.assetId), `${a.assetId}: not attached to variant ${vid}`);
      }
    }
  }
});

test("every listing image of both mats is in the manifest", () => {
  for (const slug of MAT_SLUGS) {
    const product = productBySlug(slug);
    for (const image of product.images) {
      assert.ok(manifest.assets.some((a) => a.assetId === image.id && a.slug === slug), `${slug}: image ${image.id} missing from manifest`);
    }
  }
});

test("every digital render is labelled and no physical photo is claimed without evidence", () => {
  const renders = manifest.assets.filter(isMockup);
  assert.ok(renders.length >= 6);
  for (const a of renders) assert.equal(a.label, manifest.digitalRenderLabel, `${a.assetId}: render not labelled`);
  assert.equal(manifest.digitalRenderLabel, "digital visualisation");
  const photos = manifest.assets.filter((a) => a.origin === "PHYSICAL_SAMPLE_PHOTO");
  assert.equal(manifest.physicalSamplePhotos.count, photos.length, "physicalSamplePhotos.count must match entries");
  assert.equal(photos.length, 0, "no physical sample photo exists on disk");
  for (const a of manifest.assets.filter((x) => x.origin === "ARTWORK_SOURCE")) {
    assert.ok(!a.allowedUses.includes("hero"), `${a.assetId}: print file must not be a hero`);
    assert.ok(/\b[0-9a-f]{64}\b/.test(a.notes), `${a.assetId}: SHA-256 missing`);
  }
  for (const a of manifest.assets) assert.ok(!a.allowedUses.includes("usage-context"), `${a.assetId}: no usage-context asset exists`);
});

const drafts = [...md.matchAll(/<!-- DRAFT (\d+) START -->([\s\S]*?)<!-- DRAFT \1 END -->/g)].map((m) => ({ n: Number(m[1]), text: m[2] }));

test("exactly six drafts, all marked DRAFT_NOT_APPROVED", () => {
  assert.deepEqual(drafts.map((d) => d.n), [1, 2, 3, 4, 5, 6]);
  for (const d of drafts) assert.ok(d.text.includes("DRAFT_NOT_APPROVED"), `draft ${d.n}: not marked`);
  assert.ok(/utm_source/.test(md) && /utm_medium/.test(md) && /utm_campaign/.test(md) && /utm_content/.test(md));
});

test("drafts contain none of the forbidden claim words", () => {
  for (const d of drafts) {
    for (const re of FORBIDDEN) assert.doesNotMatch(d.text, re, `draft ${d.n}: forbidden wording ${re}`);
  }
});

test("drafts reference only manifest assets and label every render", () => {
  const ids = new Set(manifest.assets.map((a) => a.assetId));
  for (const d of drafts) {
    const used = [...d.text.matchAll(/`((?:artwork:)?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|artwork:[\w.-]+)`/g)].map((m) => m[1]);
    for (const id of used) assert.ok(ids.has(id), `draft ${d.n}: unknown asset ${id}`);
    const rendersUsed = used.filter((id) => manifest.assets.find((a) => a.assetId === id && isMockup(a)));
    if (rendersUsed.length > 0) assert.ok(d.text.includes("digital visualisation"), `draft ${d.n}: render without label`);
    for (const m of d.text.matchAll(/\/shop\/([\w-]+)/g)) assert.ok(MAT_SLUGS.includes(m[1]), `draft ${d.n}: landing ${m[1]} is not a desk mat`);
  }
});
