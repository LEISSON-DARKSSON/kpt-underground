"""Package the already-built HTML behind an environment-gated Next.js preview route.
Does not modify a repository, connect accounts, or deploy anything.
"""
from pathlib import Path
import json, hashlib, base64
root=Path(__file__).resolve().parent.parent
out=root/'next-preview'
(out/'src/lib').mkdir(parents=True,exist_ok=True)
(out/'src/app/commerce-preview').mkdir(parents=True,exist_ok=True)
html=(root/'index.html').read_text()
script=(root/'storefront.js').read_text()
sha=base64.b64encode(hashlib.sha256(script.encode()).digest()).decode()
module='''// Generated local design preview. Never a live commerce implementation.
export function isCommercePreviewAllowed(vercelEnvironment, nodeEnvironment) {
  if (vercelEnvironment !== undefined && vercelEnvironment !== '') {
    return vercelEnvironment === 'preview';
  }
  return nodeEnvironment === 'development';
}
export const DESIGN_PREVIEW_HTML = '''+json.dumps(html,ensure_ascii=False)+''';
export const DESIGN_PREVIEW_CSP = '''+json.dumps("default-src 'none'; script-src 'sha256-"+sha+"'; style-src 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src data:; connect-src 'none'; frame-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'")+''';
'''
(out/'src/lib/kiu-commerce-preview.mjs').write_text(module)
(out/'src/lib/kiu-commerce-preview.d.mts').write_text('''export function isCommercePreviewAllowed(vercelEnvironment: string | undefined, nodeEnvironment: string | undefined): boolean;
export const DESIGN_PREVIEW_HTML: string;
export const DESIGN_PREVIEW_CSP: string;
''')
(out/'src/app/commerce-preview/route.ts').write_text('''import {
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
''')
print('Next preview source generated; no remote writes.')
