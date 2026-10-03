"use client";

import { useId, useState } from "react";
import Link from "next/link";

import { MAX_QTY, choiceKind, choiceLabel, fitFamily, fitStatus, formatPrice, formatPriceRange, groupModels } from "@/lib/store/core";
import { useCart } from "@/lib/store/cart";
import { CONTACT_URL } from "@/lib/store/policies";

import type { StoreProduct, StoreVariant } from "@/lib/store/core";


/**
 * Buy box (KPT-01/02). For size- or model-dependent products nothing is preselected: the shopper
 * picks a size / phone model, sees that variant's own price, and only then can add it.
 * Fit information from Fourthwall sits right at the choice; missing measurements are said plainly.
 */
export function AddToCart({ product, variant, onSelect }: { product: StoreProduct; variant: StoreVariant | null; onSelect: (id: string) => void }) {
  const [qty, setQty] = useState(1);
  const [prompt, setPrompt] = useState(false);
  const { add } = useCart();
  const kind = choiceKind(product);
  const fit = fitStatus(product);
  const family = fitFamily(product);
  const legendId = useId();
  const hintId = useId();
  const needsChoice = kind !== "none";
  const noun = kind === "model" ? "phone model" : kind === "size" ? "size" : "option";

  return (
    <div className="space-y-5" data-buy-box data-choice-kind={kind}>
      {needsChoice && (
        <fieldset aria-describedby={hintId}>
          <legend id={legendId} className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper">
            {kind === "model" ? "Choose your phone model" : kind === "size" ? "Choose a size" : "Choose an option"}
          </legend>
          {kind === "model" ? (
            <select
              aria-labelledby={legendId}
              data-cursor="h"
              data-variant-select
              value={variant?.id ?? ""}
              onChange={(e) => {
                setPrompt(false);
                if (e.target.value) onSelect(e.target.value);
              }}
              className="mt-3 h-12 w-full border border-dim bg-ink-2 px-3 font-mono text-sm text-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
            >
              <option value="">Select model…</option>
              {groupModels(product.variants).map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.variants.map((v) => (
                    <option key={v.id} value={v.id} disabled={!v.available}>
                      {v.size}{v.available ? "" : " — sold out"}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  data-cursor="h"
                  data-variant-option={v.id}
                  aria-pressed={v.id === variant?.id}
                  disabled={!v.available}
                  onClick={() => {
                    setPrompt(false);
                    onSelect(v.id);
                  }}
                  className={`min-h-11 min-w-12 border px-4 py-2 font-mono text-xs ${v.id === variant?.id ? "border-green bg-green text-ink" : "border-dim text-paper hover:border-slate"} disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green`}
                >
                  {choiceLabel(product, v)}
                  {v.priceCents !== product.priceFromCents && <span className="ml-1 opacity-70">{formatPrice(v.priceCents)}</span>}
                  {!v.available && <span className="sr-only"> (sold out)</span>}
                </button>
              ))}
            </div>
          )}
          <p id={hintId} className={`mt-2 font-mono text-[11px] ${prompt ? "text-orange" : "text-slate"}`} role={prompt ? "alert" : undefined} data-choice-hint>
            {variant ? `Selected: ${choiceLabel(product, variant)}` : `No ${noun} selected yet.`}
          </p>
        </fieldset>
      )}

      {fit.needsFit && <FitInfo product={product} family={family} selectedSize={variant?.size ?? null} />}

      <div className="flex items-end justify-between border-y border-dim py-5">
        <div>
          <p className="font-display text-5xl leading-none text-paper" data-price-cents={variant?.priceCents ?? ""}>
            {variant ? formatPrice(variant.priceCents, variant.currency) : formatPriceRange(product)}
          </p>
          <p className="mt-1 font-mono text-[11px] text-slate" data-selected-variant>
            USD · {variant ? (kind === "none" ? variant.label : choiceLabel(product, variant)) : `price depends on ${noun}`}
          </p>
        </div>
        <div className="flex items-center border border-dim" role="group" aria-label="Quantity">
          <button type="button" data-cursor="h" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-11 w-11 items-center justify-center font-mono hover:text-green disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-green">−</button>
          <output className="w-10 text-center font-mono" aria-live="polite" data-qty>{qty}</output>
          <button type="button" data-cursor="h" aria-label="Increase quantity" disabled={qty >= MAX_QTY} onClick={() => setQty((q) => Math.min(MAX_QTY, q + 1))} className="flex h-11 w-11 items-center justify-center font-mono hover:text-green disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-green">+</button>
        </div>
      </div>

      <button
        type="button"
        data-cursor="shop"
        data-cursor-label="ADD"
        data-add-to-cart
        disabled={Boolean(variant && !variant.available) || (!product.available)}
        onClick={(e) => {
          if (!variant) {
            setPrompt(true);
            return;
          }
          add(
            {
              variantId: variant.id,
              slug: product.slug,
              name: product.name,
              variantLabel: variant.label,
              unitCents: variant.priceCents,
              image: variant.image ?? product.images[0] ?? null,
            },
            qty,
            e.currentTarget,
          );
        }}
        className={`flex min-h-14 w-full items-center justify-center gap-3 font-display text-2xl tracking-[0.06em] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green motion-safe:transition-colors motion-safe:duration-200 disabled:bg-ink-3 disabled:text-slate disabled:border disabled:border-dim ${variant ? "bg-green text-ink hover:bg-paper" : "border border-green/50 bg-transparent text-green"}`}
      >
        {!product.available || (variant && !variant.available) ? "SOLD OUT" : variant ? "ADD TO CART" : `CHOOSE A ${noun.toUpperCase()}`} <span aria-hidden="true">→</span>
      </button>

      <ul className="space-y-1 font-mono text-[11px] leading-relaxed text-slate" data-trust>
        <li>Made to order and fulfilled by Fourthwall. Shipping and taxes are calculated at checkout.</li>
        <li>
          Quality issues are replaced or refunded; made-to-order items have no general or sizing returns.{" "}
          <Link href="/help" data-cursor="h" className="text-green underline underline-offset-4">Shipping &amp; returns</Link>
        </li>
      </ul>
    </div>
  );
}

function FitInfo({ product, family, selectedSize }: { product: StoreProduct; family: ReturnType<typeof fitFamily>; selectedSize: string | null }) {
  const { fit, source, missing } = fitStatus(product);
  if (source) {
    const garment = source.columns.filter((c) => c.kind === "garment").length;
    const body = source.columns.length - garment;
    return (
      <details className="group border border-dim p-4 font-mono text-[11px] text-slate open:border-slate" data-fit="sourced" data-fit-model={source.baseModel}>
        <summary data-cursor="h" className="list-none uppercase tracking-[0.16em] text-paper focus-visible:outline-2 focus-visible:outline-green">
          Size chart · inches <span aria-hidden="true" className="text-green group-open:hidden">+</span>
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[300px] border-collapse text-left" data-size-chart>
            <caption className="sr-only">
              Size chart in inches for {source.baseModel}: {body > 0 ? "garment measurements laid flat, and body measurements" : "garment measurements laid flat"}
            </caption>
            <thead>
              <tr className="text-slate">
                <td className="pb-1" />
                <th scope="colgroup" colSpan={garment} className="pb-1 pr-3 font-normal normal-case">Garment, laid flat</th>
                {body > 0 && <th scope="colgroup" colSpan={body} className="pb-1 font-normal normal-case">Your body</th>}
              </tr>
              <tr className="text-paper">
                <th scope="col" className="border-b border-dim py-2 pr-3 font-normal">Size</th>
                {source.columns.map((c) => (
                  <th key={c.key} scope="col" className="border-b border-dim py-2 pr-3 font-normal">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {source.rows.map((r) => {
                const selected = r.size === selectedSize;
                return (
                  <tr key={r.size} data-size-row={r.size} aria-current={selected ? "true" : undefined} className={selected ? "text-green" : undefined}>
                    <th scope="row" className="border-b border-dim/60 py-2 pr-3 font-normal text-paper">{r.size}</th>
                    {r.values.map((v, i) => (
                      <td key={source.columns[i].key} className="border-b border-dim/60 py-2 pr-3">{v}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <ul className="mt-3 space-y-1 [&_li]:ml-4 [&_li]:list-disc">
          {source.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
          {source.columns.map((c) => (
            <li key={c.key}>
              <span className="text-paper">{c.label}:</span> {c.how}
            </li>
          ))}
        </ul>
        <p className="mt-3">
          Sources, retrieved {source.sources[0].retrieved}:{" "}
          {source.sources.map((s, i) => (
            <span key={s.url}>
              {i > 0 && " · "}
              <a href={s.url} target="_blank" rel="noopener" data-cursor="h" className="text-green underline underline-offset-4">{s.role.split(" (")[0]}</a>
            </span>
          ))}
        </p>
      </details>
    );
  }  if (family === "phone-case") {
    return <p className="font-mono text-[11px] text-slate" data-fit="model">Fit is set by the model you choose. Check your exact model in Settings → General → About.</p>;
  }
  if (missing) {
    return (
      <div className="border border-orange/40 p-4 font-mono text-[11px] leading-relaxed text-paper" data-fit="missing">
        <p className="uppercase tracking-[0.16em] text-orange">Size chart not published yet</p>
        <p className="mt-2 text-slate">
          We don&apos;t have verified measurements for this item on the page yet. Because it is made to order, sizing returns are not accepted —{" "}
          <a href={CONTACT_URL} target="_blank" rel="noopener" data-cursor="h" className="text-green underline underline-offset-4">ask us</a>{" "}before ordering if you&apos;re between sizes.
        </p>
      </div>
    );
  }
  if (!fit) return null;
  return (
    <details className="group border border-dim p-4 font-mono text-[11px] text-slate open:border-slate" data-fit="published" open={family === "sleeve" || family === "socks" || family === "headwear"}>
      <summary data-cursor="h" className="list-none uppercase tracking-[0.16em] text-paper focus-visible:outline-2 focus-visible:outline-green">
        {fit.title} <span aria-hidden="true" className="text-green group-open:hidden">+</span>
      </summary>
      <div className="mt-3 [&_li]:ml-4 [&_li]:list-disc" dangerouslySetInnerHTML={{ __html: fit.html }} />
    </details>
  );
}
