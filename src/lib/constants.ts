/**
 * Shared constants for KPT Underground.
 * Single source of truth for values used across multiple files.
 */

import type { NavLink, ProductLine } from "./types";

/** Main navigation links — used in Navbar and Footer */
export const NAV_LINKS: NavLink[] = [
  { label: "HOME", href: "/" },
  { label: "STORY", href: "/story" },
  { label: "ARTISTS", href: "/artists" },
];

/** Shop CTA — separate because it has different styling */
export const SHOP_LINK: NavLink = {
  label: "EQUIPMENT",
  href: "/shop",
  cursor: "shop",
};

/** Product lines — used in home page and shop */
export const PRODUCT_LINES: ProductLine[] = [
  { slug: "rave", name: "RAVE", color: "var(--green)", description: "Peak hours. High-vis. Maximum output." },
  { slug: "festival", name: "FESTIVAL", color: "var(--orange)", description: "Field-rated. Weather-proof. All-terrain." },
  { slug: "access", name: "ACCESS", color: "var(--slate)", description: "Backstage. Technical. Crew-grade." },
  { slug: "mainstream", name: "MAINSTREAM", color: "var(--rust)", description: "Crossover. Daily wear. Stealth mode." },
];

/** Brand ticker phrases */
export const TICKER_ITEMS = [
  "SOUNDSYSTEM WORKWEAR",
  "KEEP IT UNDERGROUND",
  "10% ARTIST FUND",
  "EQUIPMENT NOT FASHION",
  "BASS CULTURE SINCE 2024",
  "SIGNAL NETWORK ACTIVE",
  "140HZ FREQUENCY",
  "UNDERGROUND INFRASTRUCTURE",
] as const;

/** Manifesto statements */
export const MANIFESTO = [
  "WE DON'T FOLLOW TRENDS",
  "WE BUILD SYSTEMS",
  "EVERY PIECE IS EQUIPMENT",
  "NOT MERCH. INFRASTRUCTURE.",
  "10% GOES BACK TO ARTISTS",
  "DESIGNED FOR THE CREW",
  "SOUNDSYSTEM WORKWEAR",
  "KEEP IT UNDERGROUND",
] as const;

/** Timing constants (ms) */
export const TIMING = {
  LOADER_DURATION: 2800,
  NAV_SHOW_DELAY: 3000,
  AUDIO_SHOW_DELAY: 3500,
  SCROLL_THRESHOLD: 60,
  REVEAL_THRESHOLD: 0.15,
  REVEAL_ROOT_MARGIN: "-40px",
} as const;
