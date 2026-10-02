"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";

import { AddToCart } from "@/components/store/add-to-cart";
import { ProductGallery } from "@/components/store/product-gallery";
import { choiceKind, galleryFor, resolveVariantParam } from "@/lib/store/core";
import { trackOnce } from "@/lib/analytics";

import type { StoreProduct } from "@/lib/store/core";

const noopSubscribe = () => () => {};

/**
 * One selection contract for the product page (KPT-08): the chosen variant drives the gallery,
 * the price, the button and the cart line, so they always refer to the same Fourthwall variant id.
 * Multi-size/model products start with nothing selected; `?variant=<id>` preselects only one of
 * this product's own available variant ids (cart links back here with it).
 */
export function ProductPurchase({ product, header, details }: { product: StoreProduct; header: React.ReactNode; details: React.ReactNode }) {
  const kind = choiceKind(product);
  const single = kind === "none" ? product.variants[0] : null;
  // ?variant= is read on the client only: the page stays cacheable (ISR) and server HTML never preselects a size.
  const search = useSyncExternalStore(noopSubscribe, () => window.location.search, () => "");
  const fromUrl = resolveVariantParam(product, new URLSearchParams(search).get("variant"));
  const [chosen, setVariantId] = useState<string | null>(null);
  const variantId = chosen ?? fromUrl?.id ?? single?.id ?? null;
  const variant = product.variants.find((v) => v.id === variantId) ?? null;
  const gallery = useMemo(() => galleryFor(product, variant), [product, variant]);

  // A variant is only known up front for single-variant products; size/model products start with none chosen,
  // so view_item then carries the from-price and no item_variant (unknown is omitted, never guessed).
  const soleVariantId = single?.id;
  const viewCents = single?.priceCents ?? product.priceFromCents;
  useEffect(() => {
    trackOnce(`view_item:${product.id}`, "view_item", {
      currency: "USD",
      value: viewCents / 100,
      items: [{ item_id: product.slug, item_name: product.name, item_variant: soleVariantId, price: viewCents / 100 }],
    });
  }, [product, soleVariantId, viewCents]);

  const note =
    kind === "model"
      ? variant
        ? gallery.specific
          ? `Showing the ${variant.size} case.`
          : `General product images — not specific to ${variant.size}.`
        : "Choose your phone model to see that case."
      : undefined;

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-14">
      <ProductGallery key={gallery.images.map((i) => i.url).join("|")} images={gallery.images} name={variant && gallery.specific ? `${product.name} (${variant.size})` : product.name} note={note} />
      <div className="min-w-0">
        {header}
        <div className="mt-8">
          <AddToCart product={product} variant={variant} onSelect={setVariantId} />
        </div>
        {details}
      </div>
    </div>
  );
}
