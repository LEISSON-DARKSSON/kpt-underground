import type { MetadataRoute } from "next";

/** KPT-12: keep API routes, the gated design preview and filter permutations out of the index. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/commerce-preview", "/shop?*"] }],
    sitemap: "https://keepitunderground.com/sitemap.xml",
  };
}
