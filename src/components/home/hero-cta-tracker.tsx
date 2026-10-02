"use client";

import { track } from "@/lib/analytics";

/**
 * Renders the hero CTA wrapper exactly as the server did (one `div`, the link inside, no extra
 * elements) and reports `hero_shop_click` when the primary CTA is activated. It never prevents the
 * navigation and never delays it; the event only goes to `dataLayer` (see `src/lib/analytics.ts`).
 */
export function HeroCtaTracker({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={className}
      onClickCapture={(e) => {
        const link = e.target instanceof Element ? e.target.closest("a[data-hero-cta]") : null;
        if (link) track("hero_shop_click", { cta_id: "hero_shop", destination: "/shop" });
      }}
    >
      {children}
    </div>
  );
}
