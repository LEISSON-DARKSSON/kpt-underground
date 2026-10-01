import { notFound } from "next/navigation";

import { CheckoutHandoff } from "@/components/commerce/checkout-handoff";
import s from "@/components/commerce/commerce.module.css";
import { commercePreviewEnabled } from "@/lib/commerce/gate";

export default function CommercePreviewHandoffPage() {
  if (!commercePreviewEnabled()) notFound();
  return (
    <section className={`wrap ${s.section}`}>
      <p className="eyebrow">Checkout handoff · design only</p>
      <h1 className={`font-display text-[clamp(48px,7vw,104px)] leading-[0.88] text-paper ${s.mt4}`}>
        HOSTED <span className="text-green">CHECKOUT.</span>
      </h1>
      <p className={`max-w-2xl font-mono text-sm leading-relaxed text-slate ${s.mt6}`}>
        The real purchase happens on Fourthwall&apos;s hosted checkout. This page shows where the handoff will sit — it does not collect an address or payment details.
      </p>
      <div className={`${s.mt12}`}>
        <CheckoutHandoff />
      </div>
    </section>
  );
}
