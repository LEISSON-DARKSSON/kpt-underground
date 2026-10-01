import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
