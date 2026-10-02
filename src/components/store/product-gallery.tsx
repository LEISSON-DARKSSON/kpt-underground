"use client";

import { useState } from "react";

import type { StoreImage } from "@/lib/store/core";

const FIRST_THUMBS = 8;

/**
 * Main image + thumbnails; intrinsic width/height keep proportions (no stretching or cropping).
 * `note` tells the shopper whether the images belong to the current selection or are general shots.
 * The parent remounts this (key) when the image set changes, so the active index never points past the set.
 */
export function ProductGallery({ images, name, note }: { images: StoreImage[]; name: string; note?: string }) {
  const [active, setActive] = useState(0);
  const [showAll, setShowAll] = useState(images.length <= FIRST_THUMBS + 1);
  const current = images[active] ?? images[0];
  if (!current) return <div className="aspect-[3/4] w-full border border-dim bg-ink-3" />;
  const thumbs = showAll ? images : images.slice(0, FIRST_THUMBS);
  return (
    <div data-gallery>
      <div className="border border-dim bg-ink-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- Fourthwall CDN image (already resized) */}
        <img key={current.url} src={current.url} alt={`${name} — image ${active + 1} of ${images.length}`} width={current.width} height={current.height} fetchPriority="high" className="block h-auto w-full" data-main-image />
      </div>
      {note && <p className="mt-3 font-mono text-[11px] text-slate" data-gallery-note>{note}</p>}
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5" role="group" aria-label="Product images">
          {thumbs.map((img, i) => (
            <button
              key={img.url}
              type="button"
              data-cursor="h"
              aria-pressed={i === active}
              aria-label={`Show image ${i + 1} of ${images.length}`}
              onClick={() => setActive(i)}
              className={`border p-1 ${i === active ? "border-green" : "border-dim hover:border-slate"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- Fourthwall CDN image */}
              <img src={img.url} alt="" width={img.width} height={img.height} loading="lazy" decoding="async" className="block aspect-square h-auto w-full object-contain" />
            </button>
          ))}
          {!showAll && (
            <button
              type="button"
              data-cursor="h"
              onClick={() => setShowAll(true)}
              className="flex aspect-square items-center justify-center border border-dim font-mono text-[11px] uppercase tracking-[0.12em] text-green hover:border-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
              data-show-all-images
            >
              +{images.length - FIRST_THUMBS} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
