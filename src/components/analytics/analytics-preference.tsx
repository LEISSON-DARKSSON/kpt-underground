"use client";

import { useSyncExternalStore } from "react";

import { getGa4Transport } from "@/lib/analytics-transport";

const never = () => () => {};

/** Footer switch to change the analytics choice at any time. Renders nothing while analytics is not configured. */
export function AnalyticsPreference() {
  const ga = getGa4Transport();
  const mounted = useSyncExternalStore(never, () => true, () => false);
  const consent = useSyncExternalStore(ga ? ga.subscribe : never, () => ga?.consent() ?? "unset", () => "unset");
  if (!mounted || !ga?.configured) return null;

  const on = consent === "granted";
  return (
    <button
      type="button"
      data-analytics-preference
      data-cursor="h"
      data-cursor-label={on ? "TURN OFF" : "TURN ON"}
      aria-pressed={on}
      onClick={on ? ga.deny : ga.grant}
      className="font-mono text-[11px] text-slate underline underline-offset-4 hover:text-green bg-transparent min-h-11 py-2 text-left"
    >
      Analytics: {on ? "on" : "off"} (turn {on ? "off" : "on"})
    </button>
  );
}
