/**
 * Pure cart rules (no React) so node:test can cover them (KPT-14).
 * The cart is a display snapshot keyed by Fourthwall variant id; prices in it are never authoritative.
 */
import { MAX_LINES, MAX_QTY } from "./core.ts";

import type { StoreImage } from "./core.ts";

export interface CartLine {
  variantId: string;
  slug: string;
  name: string;
  variantLabel: string;
  unitCents: number;
  image: StoreImage | null;
  qty: number;
}

export type AddResult = "added" | "merged" | "capped" | "line-limit";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isObj = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === "object" && !Array.isArray(v);

function storedImage(v: unknown): StoreImage | null {
  if (!isObj(v) || typeof v.url !== "string" || !/^https:\/\//.test(v.url)) return null;
  const width = Number(v.width), height = Number(v.height);
  if (!(width > 0 && height > 0)) return null;
  return { id: typeof v.id === "string" ? v.id : "", url: v.url, width, height };
}

/**
 * Reads whatever is in localStorage. Every line must have the full shape; anything else is dropped,
 * corrupt JSON gives an empty cart, and the rest of the cart is never thrown away because of one bad row.
 */
export function parseStoredCart(json: string | null): CartLine[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json ?? "[]");
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  const seen = new Set<string>();
  const lines: CartLine[] = [];
  for (const l of parsed) {
    if (!isObj(l)) continue;
    const { variantId, slug, name, variantLabel, unitCents, qty } = l;
    if (typeof variantId !== "string" || !UUID.test(variantId) || seen.has(variantId)) continue;
    if (typeof slug !== "string" || !/^[a-z0-9-]{1,120}$/.test(slug)) continue;
    if (typeof name !== "string" || !name || typeof variantLabel !== "string") continue;
    if (!Number.isInteger(unitCents) || (unitCents as number) <= 0) continue;
    if (!Number.isInteger(qty) || (qty as number) < 1) continue;
    seen.add(variantId);
    lines.push({ variantId, slug, name, variantLabel, unitCents: unitCents as number, image: storedImage(l.image), qty: Math.min(MAX_QTY, qty as number) });
    if (lines.length === MAX_LINES) break;
  }
  return lines;
}

/**
 * Adds a line. Never drops an existing line to make room: at MAX_LINES distinct items a new
 * item is refused ("line-limit") and the UI says so. A quantity above MAX_QTY is capped and reported.
 */
export function addLine(lines: CartLine[], line: Omit<CartLine, "qty">, qty: number): { lines: CartLine[]; result: AddResult } {
  const want = Math.max(1, Math.floor(qty));
  const existing = lines.find((l) => l.variantId === line.variantId);
  if (existing) {
    const total = existing.qty + want;
    const next = lines.map((l) => (l === existing ? { ...l, ...line, qty: Math.min(MAX_QTY, total) } : l));
    return { lines: next, result: total > MAX_QTY ? "capped" : "merged" };
  }
  if (lines.length >= MAX_LINES) return { lines, result: "line-limit" };
  return { lines: [...lines, { ...line, qty: Math.min(MAX_QTY, want) }], result: want > MAX_QTY ? "capped" : "added" };
}

/** Applies platform prices returned by the checkout API (409 PRICE_CHANGED) to the display snapshot. */
export function applyPriceChanges(lines: CartLine[], changes: { variantId: string; unitCents: number }[]): CartLine[] {
  const m = new Map(changes.filter((c) => Number.isInteger(c.unitCents) && c.unitCents > 0).map((c) => [c.variantId, c.unitCents]));
  return lines.map((l) => (m.has(l.variantId) ? { ...l, unitCents: m.get(l.variantId) as number } : l));
}

/** Body for /api/cart/checkout: ids and quantities, plus the displayed price only for change detection. */
export function checkoutBody(lines: CartLine[]) {
  return { items: lines.map((l) => ({ variantId: l.variantId, quantity: l.qty, expectedCents: l.unitCents })) };
}
