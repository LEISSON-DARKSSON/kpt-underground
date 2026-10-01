import { notFound } from "next/navigation";

import { CheckoutHandoff } from "@/components/commerce/checkout-handoff";
import { commercePreviewEnabled } from "@/lib/commerce/gate";

export default function CommercePreviewHandoffPage() {
  if (!commercePreviewEnabled()) notFound();
  return (
    <section className="wrap pb-24 pt-14">
      <p className="eyebrow">Checkout handoff · design only</p>
      <h1 className="mt-4 font-display text-[clamp(48px,7vw,104px)] leading-[0.88] text-paper">
        HOSTED <span className="text-green">CHECKOUT.</span>
      </h1>
      <p className="mt-6 max-w-2xl font-mono text-sm leading-relaxed text-slate">
        The real purchase happens on Fourthwall&apos;s hosted checkout. This page shows where the handoff will sit — it does not collect an address or payment details.
      </p>
      <div className="mt-12">
        <CheckoutHandoff />
      </div>
    </section>
  );
}
