/**
 * Commerce design-preview gate.
 * Mirrors isCommercePreviewAllowed() in kiu-commerce-preview.mjs (parity is tested)
 * without pulling the 580 KB prototype HTML into React routes.
 *
 * - Vercel Preview (VERCEL_ENV=preview)          → allowed
 * - Vercel Production / any other hosted env      → blocked (404)
 * - No VERCEL_ENV: only `next dev` is allowed; `next start` (production) is blocked.
 * Vercel Deployment Protection stays the outer lock; this is defence in depth.
 */
export function isCommercePreviewAllowed(
  vercelEnvironment: string | undefined,
  nodeEnvironment: string | undefined,
): boolean {
  if (vercelEnvironment !== undefined && vercelEnvironment !== "") {
    return vercelEnvironment === "preview";
  }
  return nodeEnvironment === "development";
}

export function commercePreviewEnabled(): boolean {
  return isCommercePreviewAllowed(process.env.VERCEL_ENV, process.env.NODE_ENV);
}
