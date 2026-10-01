import { commercePreviewEnabled } from "@/lib/commerce/gate";
import { PREVIEW_ASSETS } from "@/lib/commerce/preview-assets.generated.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BASE_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};

/** Mockup images for the gated design preview. 404 outside Vercel Preview / next dev. */
export async function GET(_request: Request, { params }: { params: Promise<{ file: string }> }) {
  const { file } = await params;
  const asset = Object.prototype.hasOwnProperty.call(PREVIEW_ASSETS, file) ? PREVIEW_ASSETS[file] : undefined;
  if (!commercePreviewEnabled() || !asset) {
    return new Response("Not found", { status: 404, headers: { ...BASE_HEADERS, "Cache-Control": "private, no-store" } });
  }
  return new Response(Buffer.from(asset.base64, "base64"), {
    status: 200,
    headers: {
      ...BASE_HEADERS,
      "Content-Type": "image/webp",
      "Cache-Control": "private, max-age=3600",
      ETag: `"${asset.sha256.slice(0, 32)}"`,
    },
  });
}
