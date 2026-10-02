import Link from "next/link";

/**
 * One dominant next step in the hero (UX audit 2026-10-02: "make one CTA the obvious primary
 * action"). Story stays reachable from the navigation; it no longer competes here.
 */
export function HeroCTAs() {
  return (
    <div className="mt-10">
      <Link
        href="/shop"
        data-cursor="shop"
        data-cursor-label="SHOP"
        data-hero-cta
        className="inline-flex min-h-14 items-center gap-3 bg-green px-8 font-display text-[22px] tracking-[0.12em] text-ink no-underline hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green motion-safe:transition-colors motion-safe:duration-200"
      >
        SHOP THE OBJECTS <span aria-hidden="true">&#x2192;</span>
      </Link>
    </div>
  );
}
