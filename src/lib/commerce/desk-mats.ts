/**
 * Desk-mat registry for the gated commerce design preview.
 *
 * SOURCE: PREVIEW_SNAPSHOT — offer/variant IDs and copy from the 2026-10-02 handoff
 * (Fourthwall get-offers-by-ids). Both offers are PRIVATE. This file is NOT a
 * pricing, visibility or inventory authority and must never feed the legacy
 * /api/checkout (Stripe EUR) flow. A real catalog must come from the Fourthwall
 * Storefront API (public offers only) with server-verified prices.
 *
 * Kept free of "@/..." imports so node:test can import it directly.
 */

export type DeskMatKey = "signal" | "subsurface";

export interface DeskMatImage {
  /** File name served by the gated /commerce-preview/assets/[file] route. */
  file: string;
  alt: string;
  width: number;
  height: number;
  kind: "artwork" | "mockup";
}

export interface DeskMat {
  key: DeskMatKey;
  slug: string;
  /** Short display name used across the storefront UI. */
  name: string;
  /** Exact product name currently stored in Fourthwall. */
  platformName: string;
  code: string;
  offerId: string;
  variantId: string;
  /** Cart identity is the variant, never the display name. */
  sku: string;
  platformStatus: "PRIVATE";
  size: { label: string; metric: string };
  tagline: string;
  summary: string;
  description: string[];
  images: DeskMatImage[];
  plannedPrice: { amountCents: number; currency: "USD"; applied: false };
}

export const PREVIEW_DATA_SOURCE = "PREVIEW_SNAPSHOT" as const;
export const MAX_QTY = 10;

const SIZE = { label: "31.5″ × 15.5″", metric: "≈ 80 × 39.4 cm" };
const SHARED_COPY = [
  "An original KEEP IT UNDERGROUND design for creative desks, home studios and workspaces.",
  "Includes one desk mat. Keyboard, mouse and other props are not included.",
  "Product images are digital mockups; printed colors and texture may vary.",
];
const PLANNED = { amountCents: 3400, currency: "USD", applied: false } as const;

export const DESK_MATS: readonly DeskMat[] = [
  {
    key: "signal",
    slug: "signal-01",
    name: "SIGNAL / 01",
    platformName: "KEEP IT UNDERGROUND Signal 01 Desk Mat",
    code: "SIGNAL // 01",
    offerId: "74c2ace1-4f7c-469b-a607-5555432019b4",
    variantId: "b28b8e38-0bd5-4303-8641-7aed66648b45",
    sku: "Q4K3-NC7G015",
    platformStatus: "PRIVATE",
    size: SIZE,
    tagline: "Make room for your next idea.",
    summary: "Dark contours. A warm orange focal point.",
    description: [
      "SIGNAL / 01 combines a charcoal background, flowing contour lines and a warm orange focal point. The artwork sits mainly to the right and along the lower edge, leaving a quieter center for your keyboard and everyday work.",
      ...SHARED_COPY,
    ],
    images: [
      { file: "signal-art.webp", alt: "SIGNAL / 01 desk mat artwork: charcoal surface, light contour lines and an orange circle on the right", width: 1600, height: 838, kind: "artwork" },
      { file: "signal-mockup.webp", alt: "SIGNAL / 01 digital mockup on a desk with keyboard and mouse (props not included)", width: 1600, height: 1200, kind: "mockup" },
    ],
    plannedPrice: PLANNED,
  },
  {
    key: "subsurface",
    slug: "subsurface-02",
    name: "SUBSURFACE / 02",
    platformName: "KEEP IT UNDERGROUND SUBSURFACE / 02",
    code: "SUBSURFACE // 02",
    offerId: "97704a85-a6b6-4090-894f-a7b5bc71a374",
    variantId: "d479a574-d42e-4767-9725-f940ce0e165c",
    sku: "QRRN-M0UG015",
    platformStatus: "PRIVATE",
    size: SIZE,
    tagline: "A different perspective for your everyday workspace.",
    summary: "Light surface. Architectural linework.",
    description: [
      "SUBSURFACE / 02 pairs a warm off-white background with an abstract architectural grid and an orange contour. The open center keeps the composition calm, while the geometry gives the right side a distinct visual focus.",
      ...SHARED_COPY,
    ],
    images: [
      { file: "subsurface-art.webp", alt: "SUBSURFACE / 02 desk mat artwork: warm off-white surface, isometric grid and an orange contour", width: 1600, height: 838, kind: "artwork" },
      { file: "subsurface-mockup.webp", alt: "SUBSURFACE / 02 digital mockup on a desk with keyboard and mouse (props not included)", width: 1600, height: 1200, kind: "mockup" },
    ],
    plannedPrice: PLANNED,
  },
];

export function getDeskMat(slug: string): DeskMat | undefined {
  return DESK_MATS.find((m) => m.slug === slug);
}

export function getDeskMatByVariant(variantId: string): DeskMat | undefined {
  return DESK_MATS.find((m) => m.variantId === variantId);
}

export function formatUSD(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function assetUrl(file: string): string {
  return `/commerce-preview/assets/${file}`;
}
