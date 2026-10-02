// Local stand-in for the Fourthwall Storefront API (tests only; loopback, fixture data, no real carts).
import { createServer } from "node:http";

const SHOP_ID = "sh_1f2e8f65-2b29-4be9-9167-7f42314361fb";
export const MOCK_TOKEN = "ptkn_mock_token_for_tests";

export async function startMockFourthwall(port, fixture) {
  const cartBodies = [];
  const server = createServer(async (req, res) => {
    const u = new URL(req.url, "http://x");
    const p = u.pathname.replace(/^\/v1\//, "/");
    const json = (code, body) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(body)); };
    if (u.searchParams.get("storefront_token") !== MOCK_TOKEN) return json(401, { error: "token" });
    if (p === "/shop") return json(200, { id: SHOP_ID, name: "KEEP IT UNDERGROUND" });
    if (p === "/collections/all/products") return json(200, fixture);
    if (p === "/carts" && req.method === "POST") {
      let b = ""; for await (const c of req) b += c;
      cartBodies.push(JSON.parse(b));
      return json(200, { id: "cart_test_123456" });
    }
    const m = /^\/products\/([a-z0-9-]+)$/.exec(p);
    if (m) {
      const slug = m[1];
      if (slug === "boom-product") return json(500, { error: "boom" });
      if (slug === "busy-product") return json(429, { error: "slow down" });
      if (slug === "junk-product") { res.writeHead(200, { "content-type": "application/json" }); return res.end("{not json"); }
      if (slug === "slow-product") return setTimeout(() => json(200, fixture.results[0]), 14000);
      const found = fixture.results.find((r) => r.slug === slug);
      return found ? json(200, found) : json(404, { error: "not found" });
    }
    json(404, {});
  });
  await new Promise((r) => server.listen(port, "127.0.0.1", r));
  return { server, cartBodies };
}
