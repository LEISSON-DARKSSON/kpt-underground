"use client";

import { useState } from "react";

import { assetUrl } from "@/lib/commerce/desk-mats";

import type { DeskMatImage } from "@/lib/commerce/desk-mats";

/** Main image + thumbnails. Images keep intrinsic width/height so `h-auto` never stretches them. */
export function DeskMatGallery({ images, code }: { images: DeskMatImage[]; code: string }) {
  const [active, setActive] = useState(0);
  const current = images[active];
  return (
    <div>
      <figure className="border border-dim bg-ink-2 p-5 sm:p-8">
        <div className="mb-6 flex justify-between font-mono text-[10px] uppercase tracking-[0.22em]">
          <span className="text-green">{code}</span>
          <span className="text-slate">{current.kind === "artwork" ? "Full artwork" : "Digital mockup"}</span>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element -- gated route asset; next/image optimizer cannot read SSO-protected previews */}
        <img
          key={current.file}
          src={assetUrl(current.file)}
          alt={current.alt}
          width={current.width}
          height={current.height}
          fetchPriority="high"
          className={`kiu-main-image block h-auto w-full ${current.kind === "artwork" ? "rounded-[10px]" : ""}`}
        />
        <figcaption className="mt-6 font-mono text-[10px] uppercase tracking-[0.16em] text-slate">
          {current.kind === "artwork" ? "Artwork preview / production trim not simulated" : "Mockup / props not included"}
        </figcaption>
      </figure>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4" role="group" aria-label="Product images">
        {images.map((img, i) => (
          <button
            key={img.file}
            type="button"
            data-cursor="h"
            aria-pressed={i === active}
            aria-label={`Show ${img.kind === "artwork" ? "full artwork" : "desk mockup"}`}
            onClick={() => setActive(i)}
            className={`border p-2 ${i === active ? "border-green" : "border-dim hover:border-slate"} focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- gated route asset */}
            <img src={assetUrl(img.file)} alt="" width={img.width} height={img.height} loading="lazy" className="block h-auto w-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
