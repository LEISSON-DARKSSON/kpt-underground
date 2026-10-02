import { StoreUnavailableError, createHostedCheckout, getProducts } from "@/lib/store/fourthwall";
import { validateAgainstCatalog } from "@/lib/store/core";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

/**
 * Validates the browser cart against the live public catalog, creates a Fourthwall cart
 * and returns the hosted checkout URL. No prices, addresses or payment data pass through here.
 */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return Response.json({ error: "FORBIDDEN_ORIGIN" }, { status: 403, headers: HEADERS });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "INVALID_JSON" }, { status: 400, headers: HEADERS });
  }
  try {
    const lines = await validateAgainstCatalog(body, () => getProducts(), () => getProducts({ fresh: true }));
    const url = await createHostedCheckout(lines);
    return Response.json({ url }, { headers: HEADERS });
  } catch (error) {
    if (error instanceof StoreUnavailableError) {
      return Response.json({ error: "STORE_UNAVAILABLE" }, { status: 503, headers: HEADERS });
    }
    const code = error instanceof Error ? error.message : "INVALID_CART";
    return Response.json({ error: /^[A-Z_]+$/.test(code) ? code : "INVALID_CART" }, { status: 400, headers: HEADERS });
  }
}
