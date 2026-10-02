import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // KPT-03: resolve metadata before streaming for every client (not only bots), so a product page can
  // still answer 404 (unknown product) or 5xx (Fourthwall unreachable) instead of a streamed 200.
  htmlLimitedBots: /.*/,
  async headers() {
    return [
      {
        // Gated design preview (404 outside Vercel Preview); keep it out of indexes and shared caches.
        source: "/commerce-preview/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
  async redirects() {
    // Retired routes from the earlier concept site (artist fund, Stripe demo checkout).
    return [
      { source: "/artists", destination: "/shop", permanent: false },
      { source: "/checkout", destination: "/shop", permanent: false },
      { source: "/confirmation", destination: "/shop", permanent: false },
    ];
  },
};

export default nextConfig;
