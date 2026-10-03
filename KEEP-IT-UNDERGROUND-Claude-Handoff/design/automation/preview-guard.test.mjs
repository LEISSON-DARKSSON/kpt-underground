import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { isCommercePreviewAllowed, DESIGN_PREVIEW_HTML, DESIGN_PREVIEW_CSP } from '../next-preview/src/lib/kiu-commerce-preview.mjs';

test('allows Vercel Preview',()=>assert.equal(isCommercePreviewAllowed('preview','production'),true));
test('blocks Production',()=>assert.equal(isCommercePreviewAllowed('production','production'),false));
test('cannot override Production with development Node mode',()=>assert.equal(isCommercePreviewAllowed('production','development'),false));
test('blocks unknown hosted environment',()=>assert.equal(isCommercePreviewAllowed('staging','development'),false));
test('allows local development',()=>assert.equal(isCommercePreviewAllowed(undefined,'development'),true));
test('blocks unclassified production server',()=>assert.equal(isCommercePreviewAllowed(undefined,'production'),false));
test('no actual checkout network calls',()=>{
 assert.ok(DESIGN_PREVIEW_CSP.includes("connect-src 'none'"));
 assert.ok(DESIGN_PREVIEW_CSP.includes("form-action 'none'"));
 assert.ok(DESIGN_PREVIEW_CSP.includes("frame-src 'none'"));
});
test('preview contains no payment or shipping inputs',()=>assert.equal(/<(?:input|form)\b/i.test(DESIGN_PREVIEW_HTML),false));
test('no credentials or font binaries are embedded',()=>{
 assert.equal(/ptkn_|fw_api_|Bearer\s|data:(?:font|application\/(?:font|x-font))/i.test(DESIGN_PREVIEW_HTML),false);
});
test('inline script matches CSP hash',async()=>{
 const js=await readFile(new URL('../storefront.js',import.meta.url),'utf8');
 const hash=createHash('sha256').update(js).digest('base64');
 assert.ok(DESIGN_PREVIEW_CSP.includes(`'sha256-${hash}'`));
 assert.ok(DESIGN_PREVIEW_HTML.includes(`<script>${js}</script>`));
});
