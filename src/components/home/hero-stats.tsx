import { formatPrice } from "@/lib/store/core";
import { getProducts } from "@/lib/store/fourthwall";

/**
 * Proof directly under the hero CTA (UX audit 2026-10-02: "move proof closer to the CTA").
 * Only verifiable facts: the live public catalog (count + lowest buyable price), the shop's
 * published quality guarantee, and the hosted checkout provider. Server-rendered, no reveal.
 * If Fourthwall is unreachable the catalog fact is left out rather than guessed.
 */
export async function HeroStats() {
  let catalog: { count: number; fromCents: number } | null = null;
  try {
    const products = (await getProducts()).filter((p) => p.available);
    if (products.length > 0) catalog = { count: products.length, fromCents: Math.min(...products.map((p) => p.priceFromCents)) };
  } catch {
    catalog = null;
  }
  const facts = [
    ...(catalog ? [{ value: `${catalog.count} OBJECTS`, label: `FROM ${formatPrice(catalog.fromCents)} · MADE TO ORDER` }] : []),
    { value: "QUALITY GUARANTEE", label: "MISPRINTS REPLACED OR REFUNDED" },
    { value: "SECURE CHECKOUT", label: "HOSTED BY FOURTHWALL" },
  ];
  return (
    <ul className="mt-10 grid max-w-[640px] grid-cols-1 border border-green/10 sm:grid-cols-3" aria-label="Shop facts" data-hero-proof>
      {facts.map((f) => (
        <li key={f.value} className="border-b border-green/10 px-4 py-3 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
          <span className="block font-display text-[22px] leading-none text-green">{f.value}</span>
          <span className="mt-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-slate">{f.label}</span>
        </li>
      ))}
    </ul>
  );
}
