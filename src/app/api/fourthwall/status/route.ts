import { createStorefrontClient, StorefrontError } from '@/lib/fourthwall-storefront';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Confirmed by the owner's browser report at 2026-09-23T20:17:25.336Z.
// A different token must never silently connect this site to another shop.
const verifiedShopId = 'sh_1f2e8f65-2b29-4be9-9167-7f42314361fb';

/** Opt-in, read-only diagnostic endpoint. Does not replace the existing checkout. */
export async function GET() {
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
  if (process.env.FOURTHWALL_READONLY_ENABLED !== 'true') {
    return Response.json({ connection: 'disabled', salesReady: false }, { status: 503, headers });
  }
  const token = process.env.FOURTHWALL_STOREFRONT_TOKEN;
  if (!token?.trim()) {
    return Response.json({ connection: 'unconfigured', salesReady: false }, { status: 503, headers });
  }
  const configuredShopId = process.env.FOURTHWALL_EXPECTED_SHOP_ID?.trim();
  if (configuredShopId && configuredShopId !== verifiedShopId) {
    return Response.json({ connection: 'misconfigured', salesReady: false,
      code: 'SHOP_ID_CONFIGURATION_MISMATCH',
    }, { status: 503, headers });
  }
  try {
    const report = await createStorefrontClient({
      token, expectedShopId: verifiedShopId,
    }).inspect();
    return Response.json(report, { headers });
  } catch (error) {
    return Response.json({ connection: 'failed', salesReady: false,
      code: error instanceof StorefrontError ? error.code : 'INTERNAL_ERROR',
    }, { status: 502, headers });
  }
}
