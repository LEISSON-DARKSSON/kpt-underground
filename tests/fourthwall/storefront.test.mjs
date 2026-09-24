import test from 'node:test';
import assert from 'node:assert/strict';
import { createStorefrontClient } from '../../src/lib/fourthwall-storefront.ts';
const token = process.env.FOURTHWALL_TEST_TOKEN;
if (!token) throw new Error('Set FOURTHWALL_TEST_TOKEN to a dummy Storefront-format value for mocked tests.');
const shop = { id:'test-shop', name:'TEST SHOP', domain:'test.fourthwall.com', publicDomain:'test.fourthwall.com' };
const page = (results = [], hasNextPage = false) => ({ results, paging:{ hasNextPage } });
function client(replies, opts = {}) {
  const calls = [];
  const fetchImpl = async (url, init) => {
    calls.push({url:new URL(url), init});
    const next = replies.shift();
    if (next instanceof Error) throw next;
    if (next instanceof Response) return next;
    return Response.json(next);
  };
  return { api:createStorefrontClient({token,fetchImpl,...opts}), calls };
}
test('rejects credentials that are not Storefront tokens', () => {
  assert.throws(() => createStorefrontClient({token:'secret-password'}), {code:'INVALID_STOREFRONT_TOKEN_FORMAT'});
});
test('accepts copied Markdown escape without changing token payload', async () => {
  const {api,calls} = client([shop], {token:token.replace('_','\\_')});
  await api.getShop(); assert.equal(calls[0].url.searchParams.get('storefront_token'),token);
});
test('empty public catalog is a successful connection, not a sales-ready shop', async () => {
  const {api,calls} = client([shop,page(),page()]);
  const r = await api.inspect();
  assert.equal(r.connection,'ok'); assert.equal(r.publicProductCount,0);
  assert.equal(r.identityPinned,false); assert.equal(r.salesReady,false);
  assert.ok(calls.every(c => c.init.method === 'GET' && c.init.redirect === 'error'));
  assert.ok(!JSON.stringify(r).includes(token));
});
test('pins the expected shop id', async () => {
  const {api} = client([shop,page(),page()], {expectedShopId:shop.id});
  assert.equal((await api.inspect()).identityPinned,true);
});
test('wrong shop stops before fetching products', async () => {
  const {api,calls} = client([shop], {expectedShopId:'different-shop'});
  await assert.rejects(api.inspect(), {code:'SHOP_ID_MISMATCH'}); assert.equal(calls.length,1);
});
test('paginates and deduplicates products by id', async () => {
  const {api,calls} = client([page([{id:'a',name:'A'}],true),page([{id:'a',name:'A'},{id:'b',name:'B'}])]);
  assert.equal((await api.getPublicProducts()).length,2);
  assert.deepEqual(calls.map(c => c.url.searchParams.get('page')),['0','1']);
});
test('does not silently truncate a catalog at page limit', async () => {
  const {api} = client([page([{id:'a',name:'A'}],true)],{maxPages:1});
  await assert.rejects(api.getPublicProducts(), {code:'PAGINATION_LIMIT_REACHED'});
});
test('rejects a malformed list rather than returning zero products', async () => {
  const {api} = client([{results:[]}]);
  await assert.rejects(api.getCollections(), {code:'INVALID_LIST_RESPONSE'});
});
test('auth rejection is different from network failure', async () => {
  const {api} = client([new Response('denied', {status:401})]);
  await assert.rejects(api.getShop(), {code:'AUTH_REJECTED',status:401});
});
test('network errors redact request URL and token', async () => {
  const {api} = client([new Error(`Could not fetch ?storefront_token=${token}`)]);
  await assert.rejects(api.getShop(), e => e.code === 'NETWORK_ERROR' && !e.message.includes(token));
});
test('rate limit errors are not reported as invalid credentials', async () => {
  const {api} = client([new Response('slow down', {status:429})]);
  await assert.rejects(api.getShop(), {code:'RATE_LIMITED'});
});
test('valid HTTP with malformed JSON is not a successful connection', async () => {
  const {api} = client([new Response('<html>not JSON</html>')]);
  await assert.rejects(api.getShop(), {code:'INVALID_JSON'});
});
test('invalid shop schema is not an authenticated identity', async () => {
  const {api} = client([{name:'TEST SHOP'}]);
  await assert.rejects(api.getShop(), {code:'INVALID_SHOP_RESPONSE'});
});
test('request timeout terminates the diagnostic without exposing URL', async () => {
  const api = createStorefrontClient({token,timeoutMs:5,fetchImpl:async (_url,init) =>
    new Promise((_resolve,reject) => init.signal.addEventListener('abort',()=>reject(new Error(token))))});
  await assert.rejects(api.getShop(), {code:'TIMEOUT'});
});


// Exercise the actual GET handler without a Next.js server. Only its path alias
// is resolved here; every upstream request remains mocked.
const { readFile } = await import('node:fs/promises');
const routeSource = await readFile(new URL('../../src/app/api/fourthwall/status/route.ts', import.meta.url), 'utf8');
const clientUrl = new URL('../../src/lib/fourthwall-storefront.ts', import.meta.url).href;
const { GET } = await import('data:text/javascript;base64,' + Buffer.from(
  routeSource.replace("'@/lib/fourthwall-storefront'", JSON.stringify(clientUrl)),
).toString('base64'));
const verifiedShop = { id:'sh_1f2e8f65-2b29-4be9-9167-7f42314361fb',
  name:'KEEP IT UNDERGROUND', domain:'keepitunderground-shop', publicDomain:'keepitunderground.com' };
async function runRoute(replies, overrides = {}) {
  const values = { FOURTHWALL_READONLY_ENABLED:'true', FOURTHWALL_STOREFRONT_TOKEN:token,
    FOURTHWALL_EXPECTED_SHOP_ID:undefined, ...overrides };
  const previous = Object.fromEntries(Object.keys(values).map(k => [k, process.env[k]]));
  const originalFetch = globalThis.fetch;
  const calls = [];
  try {
    for (const [key,value] of Object.entries(values)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    globalThis.fetch = async (url, init) => {
      calls.push({url:new URL(url),init});
      if (!replies.length) throw new Error('Unexpected mocked request');
      return Response.json(replies.shift());
    };
    const response = await GET();
    return { status:response.status, headers:response.headers, body:await response.json(), calls };
  } finally {
    globalThis.fetch = originalFetch;
    for (const [key,value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
}
test('status handler pins the browser-verified shop without an environment override', async () => {
  const r = await runRoute([verifiedShop,page(),page()]);
  assert.equal(r.status,200); assert.equal(r.body.identityPinned,true);
  assert.equal(r.body.shop.id,verifiedShop.id); assert.equal(r.body.publicProductCount,0);
  assert.equal(r.body.salesReady,false); assert.equal(r.calls.length,3);
  assert.equal(r.headers.get('cache-control'),'no-store');
  assert.ok(!JSON.stringify(r.body).includes(token));
});
test('status handler refuses a conflicting shop-id environment value before network access', async () => {
  const r = await runRoute([], {FOURTHWALL_EXPECTED_SHOP_ID:'another-shop'});
  assert.equal(r.status,503); assert.equal(r.body.code,'SHOP_ID_CONFIGURATION_MISMATCH');
  assert.equal(r.calls.length,0); assert.equal(r.body.salesReady,false);
});
test('status handler blocks a different actual shop before catalog reads', async () => {
  const r = await runRoute([shop]);
  assert.equal(r.status,502); assert.equal(r.body.code,'SHOP_ID_MISMATCH');
  assert.equal(r.calls.length,1); assert.equal(r.body.salesReady,false);
});
test('disabled status handler never calls the upstream API', async () => {
  const r = await runRoute([], {FOURTHWALL_READONLY_ENABLED:'false'});
  assert.equal(r.status,503); assert.equal(r.body.connection,'disabled');
  assert.equal(r.calls.length,0);
});
test('status handler with no token remains unconfigured', async () => {
  const r = await runRoute([], {FOURTHWALL_STOREFRONT_TOKEN:undefined});
  assert.equal(r.status,503); assert.equal(r.body.connection,'unconfigured');
  assert.equal(r.calls.length,0);
});
test('status handler accepts an explicit matching shop-id setting', async () => {
  const r = await runRoute([verifiedShop,page(),page()], {FOURTHWALL_EXPECTED_SHOP_ID:verifiedShop.id});
  assert.equal(r.status,200); assert.equal(r.body.identityPinned,true);
  assert.equal(r.body.salesReady,false);
});
