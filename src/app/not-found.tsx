import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";
import Link from "next/link";

export default function NotFound() {
  return (
    <section
      className="relative overflow-hidden flex items-center justify-center"
      style={{ minHeight: "100vh", paddingTop: "calc(80px + var(--sat))" }}
    >
      <div className="wrap text-center">
        <ScrollReveal>
          <span className="font-display text-[clamp(6rem,20vw,14rem)] leading-none text-dim/30">
            404
          </span>
        </ScrollReveal>

        <ScrollReveal delay={1}>
          <CharReveal
            as="h1"
            text="SIGNAL NOT FOUND."
            className="font-display text-[clamp(2rem,6vw,4rem)] leading-[0.95] text-paper mt-4"
          />
        </ScrollReveal>

        <ScrollReveal delay={2}>
          <p className="text-paper/50 mt-6 max-w-[400px] mx-auto leading-relaxed">
            The frequency you requested does not exist in this network.
            Check your coordinates and try again.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={3}>
          <div className="flex gap-4 justify-center mt-10">
            <Link
              href="/"
              className="font-mono text-[11px] tracking-[0.14em] uppercase bg-green text-ink px-6 py-3 hover:bg-green/90 transition-colors duration-200"
              data-cursor="h"
            >
              RETURN HOME
            </Link>
            <Link
              href="/shop"
              className="font-mono text-[11px] tracking-[0.14em] uppercase text-green border border-green/30 px-6 py-3 hover:bg-green hover:text-ink transition-colors duration-200"
              data-cursor="shop"
              data-cursor-label="SHOP"
            >
              VIEW EQUIPMENT
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={4}>
          <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-dim mt-12">
            ERR: ROUTE_NOT_FOUND // STATUS: 404 // CLASS: SIGNAL_VOID
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
