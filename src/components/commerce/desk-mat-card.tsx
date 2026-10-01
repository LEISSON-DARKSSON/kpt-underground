import Link from "next/link";

import { assetUrl, formatUSD } from "@/lib/commerce/desk-mats";

import type { DeskMat } from "@/lib/commerce/desk-mats";

/** Catalog card. Artwork keeps its original colours and 1600×838 proportion. */
export function DeskMatCard({ mat, priority = false }: { mat: DeskMat; priority?: boolean }) {
  const art = mat.images[0];
  const href = `/commerce-preview/shop/${mat.slug}`;
  return (
    <article className="kiu-product-card group flex flex-col border border-dim bg-ink-2 transition-colors duration-200 ease-expo hover:border-green/40" data-offer-id={mat.offerId}>
      <Link href={href} data-cursor="shop" data-cursor-label="VIEW" className="block p-5 no-underline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-green sm:p-7">
        <div className="mb-6 flex justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
          <span className="text-green">{mat.code}</span>
          <span className="text-slate">Desk mat</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- gated route asset; next/image optimizer cannot read SSO-protected previews */}
        <img
          src={assetUrl(art.file)}
          alt={art.alt}
          width={art.width}
          height={art.height}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          className="block h-auto w-full rounded-[10px] motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-expo motion-safe:group-hover:scale-[1.01]"
        />
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-slate">Artwork preview / production trim not simulated</p>
      </Link>
      <div className="mt-auto border-t border-dim p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-[clamp(30px,3vw,40px)] leading-none text-paper">
            <Link href={href} data-cursor="shop" data-cursor-label="VIEW" className="text-inherit no-underline hover:text-green focus-visible:outline-2 focus-visible:outline-green">
              {mat.name}
            </Link>
          </h2>
          <p className="text-right">
            <span className="block font-display text-3xl leading-none text-paper">{formatUSD(mat.plannedPrice.amountCents)}</span>
            <span className="font-mono text-[10px] text-slate">USD · planned price</span>
          </p>
        </div>
        <p className="mt-4 font-mono text-xs leading-relaxed text-slate">
          {mat.summary}
          <br />
          {mat.size.label} · One size
        </p>
        <div className="mt-6 flex items-center justify-between gap-4">
          <span className="border border-orange/60 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-orange">Private sample</span>
          <Link href={href} data-cursor="shop" data-cursor-label="VIEW" className="border-b border-green/40 pb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-green no-underline hover:border-green focus-visible:outline-2 focus-visible:outline-green">
            View design ↗
          </Link>
        </div>
      </div>
    </article>
  );
}
