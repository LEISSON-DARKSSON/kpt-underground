import { NextResponse } from "next/server";

import { commercePreviewEnabled } from "@/lib/commerce/gate";

/**
 * Hard 404 for the commerce design preview outside Vercel Preview / `next dev`.
 * Runs before rendering, so the status is decided before any page stream starts.
 */
export function proxy() {
  if (commercePreviewEnabled()) return NextResponse.next();
  return new NextResponse("Not found", {
    status: 404,
    headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "Content-Type": "text/plain; charset=utf-8" },
  });
}

export const config = {
  matcher: ["/commerce-preview", "/commerce-preview/:path*"],
};
