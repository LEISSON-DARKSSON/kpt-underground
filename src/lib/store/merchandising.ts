/**
 * Presentation-only merchandising (KPT-06/07), keyed by Fourthwall offer id.
 * Fourthwall stays authoritative for ids, names, prices and availability; nothing here is written back.
 * Source: strategy handoff data/merchandising-proposal.json (02.10.2026), applied 1:1.
 * A public product missing from this table still shows under "All" and is listed by
 * `unclassified()` so the gap is reported, never hidden.
 */
import { choiceKind } from "./core.ts";

import type { StoreProduct } from "./core.ts";

export const CATEGORIES = [
  { key: "desk-studio", label: "Desk & Studio" },
  { key: "wear", label: "Wear" },
  { key: "carry", label: "Carry" },
  { key: "wall-art", label: "Wall Art" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];

/** offerId → [category, item type shown on the card]. */
const OFFERS: Record<string, [CategoryKey, string]> = {
  "97704a85-a6b6-4090-894f-a7b5bc71a374": ["desk-studio", "Desk mat"],
  "74c2ace1-4f7c-469b-a607-5555432019b4": ["desk-studio", "Desk mat"],
  "f3e519ab-7b12-496b-959e-6aae2ef0f7eb": ["desk-studio", "Mouse pad"],
  "37293c60-4496-4825-b359-356b5347902a": ["desk-studio", "Tumbler"],
  "c61e4fb7-7796-4aa3-be8d-132ebc51dd86": ["desk-studio", "Water bottle"],
  "2b546ac7-c52a-48be-9a8e-7a3f27eb7e0c": ["desk-studio", "Mug"],
  "185ce494-67e8-43ff-ac2c-f80186196ebd": ["desk-studio", "Sticker sheet"],
  "05b191f6-6d4a-474f-ac87-1c9e2edb5894": ["desk-studio", "Notebook"],
  "bad5cb61-ad27-4e4b-94a1-5bd769f19ab8": ["desk-studio", "Notebook"],
  "99cdfeba-2da7-46fe-ae2c-1d742fdc4c2a": ["wear", "Beanie"],
  "b37366cd-aa48-49d7-b20e-dedb8a0872c1": ["wear", "Socks"],
  "9b4af8fc-347b-4e56-8808-2aacea619a32": ["wear", "Crewneck"],
  "6c250dd6-5ebd-4a75-a9a5-d1bc584f177f": ["wear", "T-shirt"],
  "caf3e2ed-8b80-4b29-bd94-46427a9fef39": ["wear", "Hoodie"],
  "ee17a091-6316-4c50-ae07-a955af9583da": ["wear", "Beanie"],
  "22aeebe6-04db-4468-9b37-f078eb90267b": ["carry", "Backpack"],
  "83986574-4480-4619-8e71-2d61f4ef1bbc": ["carry", "Phone case"],
  "c802ed05-237f-4eda-9e10-416640f92907": ["carry", "Laptop sleeve"],
  "5551ad84-b3c5-4af9-bc6a-05de2349de57": ["carry", "Laptop sleeve"],
  "11c30deb-6d02-4590-82e6-83061fc4b21d": ["carry", "Tote bag"],
  "c0d71bed-0a9e-4e80-8518-061cdb58ac8b": ["wall-art", "Wall print"],
  "04de8f0f-7b3e-430b-82b2-ca9448f82c77": ["wall-art", "Wall print"],
};

/** Up to six "Studio picks" — an editorial choice, not a bestseller claim (no order data backs one). */
export const STUDIO_PICKS: readonly string[] = [
  "74c2ace1-4f7c-469b-a607-5555432019b4",
  "97704a85-a6b6-4090-894f-a7b5bc71a374",
  "6c250dd6-5ebd-4a75-a9a5-d1bc584f177f",
  "11c30deb-6d02-4590-82e6-83061fc4b21d",
  "2b546ac7-c52a-48be-9a8e-7a3f27eb7e0c",
  "bad5cb61-ad27-4e4b-94a1-5bd769f19ab8",
];

export function isCategory(v: unknown): v is CategoryKey {
  return CATEGORIES.some((c) => c.key === v);
}

export function categoryOf(productId: string): (typeof CATEGORIES)[number] | null {
  const key = OFFERS[productId]?.[0];
  return CATEGORIES.find((c) => c.key === key) ?? null;
}

export function itemType(productId: string): string | null {
  return OFFERS[productId]?.[1] ?? null;
}

/** Shorter card/breadcrumb name: drops the repeated brand prefix only in the UI (Fourthwall name unchanged). */
export function displayName(name: string): string {
  const short = name.replace(/^(KEEP IT UNDERGROUND|KPT)\s*(-\s*)?/i, "").trim();
  return short || name;
}

const ONE_SIZE = /^one size$/i;

/** One decisive attribute for the card: the mat/print/sleeve size, the size range, or the model count. */
export function keyAttribute(product: StoreProduct): string | null {
  const kind = choiceKind(product);
  if (kind === "model") return `${product.variants.length} phone models`;
  if (kind === "size") {
    const sizes = product.variants.map((v) => v.size);
    return `${sizes[0]}–${sizes[sizes.length - 1]}`;
  }
  const size = product.variants[0]?.size ?? "";
  return size && !ONE_SIZE.test(size) ? size.replace(/\s*x\s*/i, " × ") : null;
}

export function filterByCategory(products: StoreProduct[], category: CategoryKey | null): StoreProduct[] {
  return category ? products.filter((p) => OFFERS[p.id]?.[0] === category) : products;
}

/** Studio picks that are currently public and available, in editorial order; unknown ids are ignored. */
export function studioPicks(products: StoreProduct[]): StoreProduct[] {
  return STUDIO_PICKS.map((id) => products.find((p) => p.id === id && p.available)).filter((p): p is StoreProduct => Boolean(p)).slice(0, 6);
}

/** Public products that have no category yet (shown under All; reported for classification). */
export function unclassified(products: StoreProduct[]): StoreProduct[] {
  return products.filter((p) => !OFFERS[p.id]);
}

export type SortKey = "featured" | "price-asc" | "price-desc";
export function isSort(v: unknown): v is SortKey {
  return v === "featured" || v === "price-asc" || v === "price-desc";
}

export function sortForShop(products: StoreProduct[], sort: SortKey): StoreProduct[] {
  if (sort === "featured") return products;
  const dir = sort === "price-asc" ? 1 : -1;
  return products.map((p, i) => ({ p, i })).sort((a, b) => dir * (a.p.priceFromCents - b.p.priceFromCents) || a.i - b.i).map((x) => x.p);
}

export function searchProducts(products: StoreProduct[], q: string): StoreProduct[] {
  const terms = q.toLowerCase().trim().split(/\s+/).filter(Boolean).slice(0, 5);
  if (terms.length === 0) return products;
  return products.filter((p) => {
    const hay = `${p.name} ${itemType(p.id) ?? ""} ${categoryOf(p.id)?.label ?? ""}`.toLowerCase();
    return terms.every((t) => hay.includes(t));
  });
}
