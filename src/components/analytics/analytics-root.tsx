"use client";

import { useEffect, useLayoutEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { setForwarder, startPageScope } from "@/lib/analytics";
import { getGa4Transport } from "@/lib/analytics-transport";
import type { Ga4Transport } from "@/lib/analytics-transport";
import { POLICY_LINKS } from "@/lib/store/policies";

const PRIVACY = POLICY_LINKS.find((l) => l.label === "Privacy policy")?.href ?? POLICY_LINKS[0].href;

/**
 * Wires measurement into the app shell. With no owner activation or no Measurement ID it renders nothing
 * and registers nothing, so the page is byte-for-byte what it was. When configured it shows the consent
 * choice, then (only after a grant) sends one page view per real route change.
 */
export function AnalyticsRoot() {
  const pathname = usePathname();
  const ga = getGa4Transport();

  // A new page-view scope per route. Layout effects run before every passive effect, so this clears the
  // once-per-page keys before the new page's own `trackOnce` effects run.
  useLayoutEffect(() => {
    startPageScope();
  }, [pathname]);

  useEffect(() => {
    if (!ga?.configured) return;
    setForwarder(ga.forward);
    ga.restore();
    return () => setForwarder(null);
  }, [ga]);

  useEffect(() => {
    ga?.pageView();
  }, [pathname, ga]);

  return ga?.configured ? <ConsentBanner ga={ga} /> : null;
}

function ConsentBanner({ ga }: { ga: Ga4Transport }) {
  const consent = useSyncExternalStore(ga.subscribe, ga.consent, () => "granted");
  if (consent !== "unset") return null;

  const button = "font-mono text-[11px] tracking-[0.2em] uppercase px-4 py-3 border bg-transparent";
  return (
    <div
      role="region"
      aria-label="Analytics choice"
      data-consent-banner
      className="fixed inset-x-0 bottom-0 border-t border-dim bg-ink-2 text-paper"
      style={{ zIndex: 650, padding: "14px 0 calc(14px + env(safe-area-inset-bottom))" }}
    >
      <div className="wrap flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[11px] leading-relaxed text-slate" style={{ maxWidth: "62ch" }}>
          Visit statistics with Google Analytics (uses cookies), only if you allow it. No ads. Shopping works either way.{" "}
          <a href={PRIVACY} target="_blank" rel="noopener" data-cursor="h" className="underline underline-offset-4 hover:text-green">
            Privacy policy
          </a>
        </p>
        <div className="flex gap-3">
          <button type="button" data-consent-accept data-cursor="h" data-cursor-label="ALLOW" onClick={ga.grant} className={`${button} border-green text-green`}>
            Allow
          </button>
          <button type="button" data-consent-decline data-cursor="h" data-cursor-label="NO THANKS" onClick={ga.deny} className={`${button} border-slate text-paper`}>
            No thanks
          </button>
        </div>
      </div>
    </div>
  );
}
