import { createStorefrontClient, StorefrontError } from '@/lib/fourthwall-storefront';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Opt-in, read-only diagnostic endpoint. Does not replace the existing checkout. */
export async function GET() {
  const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' };
  if (process.env.FOURTHWALL_READONLY_ENABLED !== 'true') {
    return Response.json({ connection: 'disabled', salesReady: false }, { status: 503, headers });
  }
  const token = process.env.FOURTHWALL_STOREFRONT_TOKEN;
  if (!token) {
    return Response.json({ connection: 'unconfigured', salesReady: false }, { status: 503, headers });
  }
  try {
    const report = await createStorefrontClient({
      token, expectedShopId: process.env.FOURTHWALL_EXPECTED_SHOP_ID || undefined,
    }).inspect();
    return Response.json(report, { headers });
  } catch (error) {
    return Response.json({ connection: 'failed', salesReady: false,
      code: error instanceof StorefrontError ? error.code : 'INTERNAL_ERROR',
    }, { status: 502, headers });
  }
}
