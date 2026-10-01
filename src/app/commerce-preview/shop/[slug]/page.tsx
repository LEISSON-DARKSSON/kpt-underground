import Link from "next/link";
import { notFound } from "next/navigation";

import { DeskMatGallery } from "@/components/commerce/desk-mat-gallery";
import { DeskMatPurchase } from "@/components/commerce/desk-mat-purchase";
import { commercePreviewEnabled } from "@/lib/commerce/gate";
import { DESK_MATS, getDeskMat } from "@/lib/commerce/desk-mats";

export default async function CommercePreviewDeskMatPage({ params }: { params: Promise<{ slug: string }> }) {
  if (!commercePreviewEnabled()) notFound();
  const { slug } = await params;
  const mat = getDeskMat(slug);
  if (!mat) notFound();
  const other = DESK_MATS.find((m) => m.slug !== mat.slug);

  return (
    <article className="wrap pb-24 pt-10" data-offer-id={mat.offerId} data-variant-id={mat.variantId}>
      <nav aria-label="Breadcrumb" className="font-mono text-[11px] text-slate">
        <Link href="/commerce-preview/shop" data-cursor="h" className="text-green no-underline hover:underline">
          Desk mats
        </Link>{" "}
        / <span aria-current="page">{mat.name}</span>
      </nav>
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
        <DeskMatGallery images={mat.images} code={mat.code} />
        <div className="min-w-0">
          <p className="eyebrow">{mat.code} · Desk mat</p>
          <h1 className="mt-4 font-display text-[clamp(48px,6vw,88px)] leading-[0.9] text-paper">{mat.name}</h1>
          <p className="mt-5 font-mono text-sm leading-relaxed text-paper">{mat.tagline}</p>
          <dl className="mt-6 grid grid-cols-2 border border-dim font-mono text-[11px]">
            <div className="border-r border-dim p-4">
              <dt className="uppercase tracking-[0.18em] text-slate">Size</dt>
              <dd className="mt-1 text-paper">
                {mat.size.label}
                <br />
                <span className="text-slate">{mat.size.metric}</span>
              </dd>
            </div>
            <div className="p-4">
              <dt className="uppercase tracking-[0.18em] text-slate">Variant</dt>
              <dd className="mt-1 text-paper">All-over print · one size</dd>
            </div>
          </dl>
          <div className="mt-8">
            <DeskMatPurchase variantId={mat.variantId} name={mat.name} plannedCents={mat.plannedPrice.amountCents} />
          </div>
          <details className="mt-8 border-t border-dim pt-4" open>
            <summary data-cursor="h" className="font-mono text-[11px] uppercase tracking-[0.2em] text-green">About the design</summary>
            <div className="mt-4 space-y-3 font-mono text-xs leading-relaxed text-slate">
              {mat.description.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </details>
          <details className="mt-4 border-t border-dim pt-4">
            <summary data-cursor="h" className="font-mono text-[11px] uppercase tracking-[0.2em] text-green">Shipping & production</summary>
            <p className="mt-4 font-mono text-xs leading-relaxed text-slate">
              Made on demand and fulfilled by Fourthwall. Shipping cost, taxes and delivery estimate are shown at the real checkout. Physical samples have not been reviewed yet.
            </p>
          </details>
          {other && (
            <Link href={`/commerce-preview/shop/${other.slug}`} data-cursor="shop" data-cursor-label="VIEW" className="mt-10 flex items-center justify-between border border-dim p-4 font-mono text-[11px] uppercase tracking-[0.2em] text-slate no-underline hover:border-green hover:text-green">
              <span>Next design</span>
              <span className="font-display text-2xl normal-case tracking-normal text-paper">{other.name} →</span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
