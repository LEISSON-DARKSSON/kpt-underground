import type { Metadata } from "next";
import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";
import { Ticker } from "@/components/brand/ticker";
import { ShippingForm } from "@/components/checkout/shipping-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout — KPT Underground",
  description: "Complete your order. Secure checkout. Free EU shipping. 10% to the Artist Fund.",
};

export default function CheckoutPage() {
  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{ paddingTop: "calc(56px + 48px)", paddingBottom: "80px" }}
      >
        <div className="wrap">
          {/* Breadcrumb */}
          <ScrollReveal>
            <nav className="flex items-center gap-2 mb-10">
              <Link
                href="/shop"
                className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted hover:text-green transition-colors duration-200"
                data-cursor="h"
              >
                SHOP
              </Link>
              <span className="font-mono text-[9px] text-dim">/</span>
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-paper">
                CHECKOUT
              </span>
            </nav>
          </ScrollReveal>

          {/* Header */}
          <ScrollReveal delay={1}>
            <CharReveal
              as="h1"
              text="SECURE CHECKOUT"
              className="font-display text-[clamp(2rem,6vw,4rem)] leading-[0.95] text-green mb-4"
            />
          </ScrollReveal>

          <ScrollReveal delay={2}>
            <p className="font-mono text-[11px] tracking-[0.08em] text-muted mb-12 max-w-[500px]">
              All transactions are encrypted. 10% of your order goes directly to the Artist Fund.
              Free shipping within the EU.
            </p>
          </ScrollReveal>

          {/* Form */}
          <div className="max-w-[560px]">
            <ScrollReveal delay={3}>
              <ShippingForm />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── Ticker ─── */}
      <Ticker
        items={["SECURE CHECKOUT", "ENCRYPTED PAYMENT", "FREE EU SHIPPING", "10% ARTIST FUND", "CERTIFIED UNDERGROUND"]}
        duration={25}
      />
    </>
  );
}
