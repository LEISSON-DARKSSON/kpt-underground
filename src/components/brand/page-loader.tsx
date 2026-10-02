"use client";

import { usePathname } from "next/navigation";

/**
 * Brand intro (H01). Home page only, and it never stands between the visitor and the shop:
 * the page is fully visible and clickable from the first paint. The CRT "power-on" is a thin
 * scan line that sweeps down once (~1 s) over the finished page. It is transparent, ignores
 * pointer events, is hidden from assistive tech, and is dropped entirely for reduced motion.
 * Timing is pure CSS (`boot-sweep`), so without JavaScript it simply plays out or never shows.
 */
export function PageLoader() {
  const pathname = usePathname();
  if (pathname !== "/") return null;

  return <div id="boot-sweep" aria-hidden="true" data-intro="non-blocking" />;
}
