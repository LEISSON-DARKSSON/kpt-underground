/**
 * Shared TypeScript types for KPT Underground.
 * Add new types here — import via: import type { X } from "@/lib/types";
 */

/** Product line identifiers */
export type ProductLineSlug = "rave" | "festival" | "access" | "mainstream";

/** Product line metadata */
export interface ProductLine {
  slug: ProductLineSlug;
  name: string;
  color: string;
  description: string;
}

/** Individual product */
export interface Product {
  id: string;
  slug: string;
  name: string;
  line: ProductLineSlug;
  price: number; // cents
  description: string;
  images: string[];
  sizes: string[];
  inStock: boolean;
}

/** Artist fund recipient */
export interface Artist {
  id: string;
  name: string;
  scene: string;
  fundAmount: number; // cents
  bio: string;
  imageUrl?: string;
}

/** Navigation link */
export interface NavLink {
  label: string;
  href: string;
  cursor?: "h" | "shop" | "lock";
}

/** Cursor state for the custom cursor engine */
export type CursorState = "default" | "h" | "shop" | "lock";
