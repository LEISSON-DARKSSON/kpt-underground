"use client";

import { useState } from "react";

import type { StoreImage } from "@/lib/store/core";

/** Main image + thumbnails; intrinsic width/height keep proportions (no stretching). */
export function ProductGallery({ images, name }: { images: StoreImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];
  if (!current) return <div className="aspect-[3/4] w-full border border-dim bg-ink-3" />;
  return (
    <div>
      <div className="border border-dim bg-ink-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- Fourthwall CDN image (already resized) */}
        <img key={current.url} src={current.url} alt={`${name} — image ${active + 1} of ${images.length}`} width={current.width} height={current.height} fetchPriority="high" className="block h-auto w-full" data-main-image />
      </div>
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-4 gap-3" role="group" aria-label="Product images">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              data-cursor="h"
              aria-pressed={i === active}
              aria-label={`Show image ${i + 1}`}
              onClick={() => setActive(i)}
              className={`border p-1 ${i === active ? "border-green" : "border-dim hover:border-slate"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- Fourthwall CDN image */}
              <img src={img.url} alt="" width={img.width} height={img.height} loading="lazy" className="block h-auto w-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
