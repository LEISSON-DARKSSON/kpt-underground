import { CartRejectedError, StoreUnavailableError, createHostedCheckout, getProducts } from "@/lib/store/fourthwall";
import { priceChanges, sameOrigin, validateAgainstCatalog } from "@/lib/store/core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
const MAX_BODY_BYTES = 16 * 1024;

/**
 * Validates the browser cart against the live public catalog, creates a Fourthwall cart
 * and returns the hosted checkout URL. No prices, addresses or payment data pass through here.
 *
 * Responses: 200 {url} · 409 {error:"PRICE_CHANGED", lines} (no cart created; the browser
 * shows the new prices first) · 400 client errors · 403 foreign origin · 413 oversized · 503 upstream.
 * A 200 here is a checkout link, not a purchase.
 */
export async function POST(request: Request) {
  if (!sameOrigin(request.headers.get("origin"), request.headers.get("host"))) {
    return Response.json({ error: "FORBIDDEN_ORIGIN" }, { status: 403, headers: HEADERS });
  }
  const raw = await request.text().catch(() => "");
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ error: "BODY_TOO_LARGE" }, { status: 413, headers: HEADERS });
  }
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ error: "INVALID_JSON" }, { status: 400, headers: HEADERS });
  }
  try {
    let catalogUsed = await getProducts();
    const lines = await validateAgainstCatalog(body, async () => catalogUsed, async () => (catalogUsed = await getProducts({ fresh: true })));
    const changed = priceChanges(body, catalogUsed);
    if (changed.length > 0) {
      return Response.json({ error: "PRICE_CHANGED", lines: changed }, { status: 409, headers: HEADERS });
    }
    const url = await createHostedCheckout(lines);
    return Response.json({ url }, { headers: HEADERS });
  } catch (error) {
    if (error instanceof StoreUnavailableError) {
      return Response.json({ error: "STORE_UNAVAILABLE" }, { status: 503, headers: HEADERS });
    }
    if (error instanceof CartRejectedError) {
      return Response.json({ error: "CART_REJECTED" }, { status: 409, headers: HEADERS });
    }
    const code = error instanceof Error ? error.message : "INVALID_CART";
    return Response.json({ error: /^[A-Z_]+$/.test(code) ? code : "INVALID_CART" }, { status: 400, headers: HEADERS });
  }
}
