import { notFound } from "next/navigation";

import { DeskMatCard } from "@/components/commerce/desk-mat-card";
import { commercePreviewEnabled } from "@/lib/commerce/gate";
import { DESK_MATS } from "@/lib/commerce/desk-mats";

export default function CommercePreviewShopPage() {
  if (!commercePreviewEnabled()) notFound();
  return (
    <section className="wrap pb-24 pt-14">
      <p className="eyebrow">KPT / Object studies</p>
      <div className="mt-6 flex flex-col justify-between gap-8 md:flex-row md:items-end">
        <h1 className="font-display text-[clamp(52px,9vw,128px)] leading-[0.86] text-paper">
          DESK
          <br />
          <span className="text-green">OBJECTS.</span>
        </h1>
        <p className="max-w-sm font-mono text-sm leading-relaxed text-slate">
          Original graphic objects for creative desks and home studios. Make room for your next idea.
        </p>
      </div>
      <div className="mt-12 flex items-center justify-between border-y border-dim py-4 font-mono text-[11px] uppercase tracking-[0.2em] text-slate">
        <span>{String(DESK_MATS.length).padStart(2, "0")} designs</span>
        <span>USD · planned prices</span>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        {DESK_MATS.map((mat, i) => (
          <DeskMatCard key={mat.variantId} mat={mat} priority={i < 2} />
        ))}
      </div>
      <p className="mt-8 font-mono text-[11px] text-slate">
        Private preview. No inventory scarcity, discount, review or delivery claim is implied.
      </p>
    </section>
  );
}
