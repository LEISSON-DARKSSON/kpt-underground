import {
  DESIGN_PREVIEW_CSP,
  DESIGN_PREVIEW_HTML,
  isCommercePreviewAllowed,
} from '@/lib/kiu-commerce-preview.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Isolated design review only. No product publishing, checkout or payment requests. */
export function GET() {
  const headers = {
    'Cache-Control': 'private, no-store',
    'X-Robots-Tag': 'noindex, nofollow',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
  };
  if (!isCommercePreviewAllowed(process.env.VERCEL_ENV, process.env.NODE_ENV)) {
    return new Response('Not found', { status: 404, headers });
  }
  return new Response(DESIGN_PREVIEW_HTML, {
    status: 200,
    headers: {
      ...headers,
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': DESIGN_PREVIEW_CSP,
    },
  });
}
