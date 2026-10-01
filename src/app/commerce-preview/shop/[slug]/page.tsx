import Link from "next/link";
import { notFound } from "next/navigation";

import { DeskMatGallery } from "@/components/commerce/desk-mat-gallery";
import { DeskMatPurchase } from "@/components/commerce/desk-mat-purchase";
import { commercePreviewEnabled } from "@/lib/commerce/gate";
import s from "@/components/commerce/commerce.module.css";
import { DESK_MATS, getDeskMat } from "@/lib/commerce/desk-mats";

export default async function CommercePreviewDeskMatPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!commercePreviewEnabled()) notFound();
  const { slug } = await params;
  const mat = getDeskMat(slug);
  if (!mat) notFound();
  const other = DESK_MATS.find((m) => m.slug !== mat.slug);

  return (
    <article className={`wrap ${s.sectionTight}`} data-offer-id={mat.offerId} data-variant-id={mat.variantId}>
      <nav aria-label="Breadcrumb" className="font-mono text-[11px] text-slate">
        <Link href="/commerce-preview/shop" data-cursor="h" className="text-green no-underline hover:underline">
          Desk mats
        </Link>{" "}
        / <span aria-current="page">{mat.name}</span>
      </nav>
      <div className={`grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14 ${s.mt8}`}>
        <DeskMatGallery images={mat.images} code={mat.code} />
        <div className="min-w-0">
          <p className="eyebrow">{mat.code} · Desk mat</p>
          <h1 className={`font-display text-[clamp(48px,6vw,88px)] leading-[0.9] text-paper ${s.mt4}`}>{mat.name}</h1>
          <p className={`font-mono text-sm leading-relaxed text-paper ${s.mt5}`}>{mat.tagline}</p>
          <dl className={`grid grid-cols-2 border border-dim font-mono text-[11px] ${s.mt6}`}>
            <div className={`border-r border-dim ${s.cell}`}>
              <dt className="uppercase tracking-[0.18em] text-slate">Size</dt>
              <dd className={`text-paper ${s.mt1}`}>
                {mat.size.label}
                <br />
                <span className="text-slate">{mat.size.metric}</span>
              </dd>
            </div>
            <div className={`${s.cell}`}>
              <dt className="uppercase tracking-[0.18em] text-slate">Variant</dt>
              <dd className={`text-paper ${s.mt1}`}>All-over print · one size</dd>
            </div>
          </dl>
          <div className={`${s.mt8}`}>
            <DeskMatPurchase variantId={mat.variantId} name={mat.name} plannedCents={mat.plannedPrice.amountCents} />
          </div>
          <details className={`border-t border-dim ${s.mt8} ${s.ruleTop}`} open>
            <summary data-cursor="h" className="font-mono text-[11px] uppercase tracking-[0.2em] text-green">About the design</summary>
            <div className={`font-mono text-xs leading-relaxed text-slate ${s.mt4} ${s.stack3}`}>
              {mat.description.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </details>
          <details className={`border-t border-dim ${s.mt4} ${s.ruleTop}`}>
            <summary data-cursor="h" className="font-mono text-[11px] uppercase tracking-[0.2em] text-green">Shipping & production</summary>
            <p className={`font-mono text-xs leading-relaxed text-slate ${s.mt4}`}>
              Made on demand and fulfilled by Fourthwall. Shipping cost, taxes and delivery estimate are shown at the real checkout. Physical samples have not been reviewed yet.
            </p>
          </details>
          {other && (
            <Link href={`/commerce-preview/shop/${other.slug}`} data-cursor="shop" data-cursor-label="VIEW" className={`flex items-center justify-between border border-dim font-mono text-[11px] uppercase tracking-[0.2em] text-slate no-underline hover:border-green hover:text-green ${s.mt10} ${s.cell}`}>
              <span>Next design</span>
              <span className="font-display text-2xl normal-case tracking-normal text-paper">{other.name} →</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
