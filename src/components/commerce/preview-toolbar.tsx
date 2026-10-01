import Link from "next/link";

import { PreviewCartButton } from "@/components/commerce/preview-cart";

/** Sticky preview strip under the site Navbar: honest labelling + the preview cart trigger. */
export function PreviewToolbar() {
  return (
    <div className="sticky top-14 z-[400] border-y border-dim bg-ink/95 backdrop-blur-sm">
      <div className="wrap flex min-h-12 flex-wrap items-center justify-between gap-x-6 gap-y-2 py-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em]">
          <span className="text-orange">Design preview</span>
          <span className="text-paper"> · Not for sale · No payment</span>
        </p>
        <nav aria-label="Preview store" className="flex items-center gap-5">
          <Link href="/commerce-preview/shop" data-cursor="h" className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate no-underline hover:text-green focus-visible:outline-2 focus-visible:outline-green">
            Desk mats
          </Link>
          <PreviewCartButton />
        </nav>
      </div>
    </div>
  );
}
