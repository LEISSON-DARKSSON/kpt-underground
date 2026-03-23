/**
 * Product catalog data — single source of truth.
 * In Phase C+ this moves to a CMS/API. For now, static data.
 */

export interface ProductData {
  id: string;
  ref: string;
  slug: string;
  name: string;
  line: "ravewear" | "festivalwear" | "everyday" | "accessories" | "secret";
  price: number; // EUR cents
  gsm: string;
  badge?: "NEW" | "LIMITED" | "SECRET";
  sizes: { label: string; stock: "available" | "low" | "out" }[];
  spec: string;
  shortSpec: string;
}

export interface ProductLineData {
  slug: string;
  name: string;
  color: string;
  tag: string;
  description: string;
}

export const PRODUCT_LINES_DATA: ProductLineData[] = [
  {
    slug: "ravewear",
    name: "RAVEWEAR",
    color: "var(--green)",
    tag: "Built for the floor",
    description:
      "Six hours. Full dark. Moisture-responsive, reinforced at every stress point. Reflective elements that activate under UV. Nothing decorative. Nothing that fails.",
  },
  {
    slug: "festivalwear",
    name: "FESTIVALWEAR",
    color: "var(--rust)",
    tag: "Built to last the field",
    description:
      "Three days, open sky. Water-resistant, layerable, carrying the heaviest graphic documentation — subwoofer schematics at 32 LPI. For the people who stay until the generator runs out.",
  },
  {
    slug: "everyday",
    name: "EVERYDAY",
    color: "var(--paper)",
    tag: "The quiet credential",
    description:
      "What you wear between events is not neutral. Restrained graphics, interior labels that reward the person who looks. The door to everything else.",
  },
  {
    slug: "accessories",
    name: "ACCESSORIES",
    color: "var(--orange)",
    tag: "Details are the document",
    description:
      "Eyewear, hardware, modular carry. Polarised, matte, built for festival UV and warehouse dark equally. Every detail is a sentence in the same document.",
  },
];

export const PRODUCTS: ProductData[] = [
  // ── RAVEWEAR ──
  {
    id: "rw001",
    ref: "KPT-RW-001",
    slug: "rigger-boxy-hoodie",
    name: "RIGGER BOXY HOODIE",
    line: "ravewear",
    price: 18000,
    gsm: "440GSM",
    badge: "NEW",
    sizes: [
      { label: "S", stock: "available" },
      { label: "M", stock: "available" },
      { label: "L", stock: "low" },
      { label: "XL", stock: "available" },
      { label: "XXL", stock: "out" },
    ],
    spec: "Dropped shoulder. Bar-tacked. Acid-green reflective chest glyph. Oversized 4-way crossover schematic back print at 32 LPI.",
    shortSpec: "440GSM French Terry // Dropped shoulder // 3M reflective chest glyph // Bar-tacked stress points",
  },
  {
    id: "rw002",
    ref: "KPT-RW-002",
    slug: "crossover-longsleeve",
    name: "CROSSOVER LONGSLEEVE",
    line: "ravewear",
    price: 9500,
    gsm: "250GSM",
    badge: "LIMITED",
    sizes: [
      { label: "S", stock: "available" },
      { label: "M", stock: "available" },
      { label: "L", stock: "available" },
      { label: "XL", stock: "low" },
    ],
    spec: "4-way crossover circuit back print. UV-reactive KPT-UG nape label. Wrist-cuff frequency metadata print.",
    shortSpec: "250GSM // UV-reactive nape label // Wrist-cuff frequency print",
  },
  {
    id: "rw003",
    ref: "KPT-RW-003",
    slug: "rave-balaclava",
    name: "RAVE BALACLAVA",
    line: "ravewear",
    price: 5500,
    gsm: "320GSM",
    badge: "NEW",
    sizes: [{ label: "ONE SIZE", stock: "available" }],
    spec: "Single-seam construction. 3M reflective monogram panel. Designed for sub-zero warehouse ingress.",
    shortSpec: "320GSM // Single-seam // 3M reflective monogram",
  },
  // ── FESTIVALWEAR ──
  {
    id: "fw001",
    ref: "KPT-FW-001",
    slug: "teknival-field-jacket",
    name: "TEKNIVAL FIELD JACKET",
    line: "festivalwear",
    price: 32000,
    gsm: "600D Cordura",
    badge: "LIMITED",
    sizes: [
      { label: "S", stock: "available" },
      { label: "M", stock: "available" },
      { label: "L", stock: "low" },
      { label: "XL", stock: "available" },
    ],
    spec: "Taped seams. Removable hood. Cobra buckle chest strap system. Subwoofer baffle plan sleeve print. Faraday inner pocket.",
    shortSpec: "600D Cordura // Taped seams // Cobra buckle // Faraday pocket",
  },
  {
    id: "fw002",
    ref: "KPT-FW-002",
    slug: "cargo-pant-tech-block",
    name: "CARGO PANT — TECH BLOCK",
    line: "festivalwear",
    price: 22000,
    gsm: "380GSM",
    badge: "NEW",
    sizes: [
      { label: "S", stock: "available" },
      { label: "M", stock: "available" },
      { label: "L", stock: "available" },
      { label: "XL", stock: "available" },
      { label: "XXL", stock: "low" },
    ],
    spec: "Articulated knee. Gusseted crotch. Full speaker-stack range of motion. Ripstop reinforced knee panel.",
    shortSpec: "380GSM // Articulated knee // Gusseted crotch // Ripstop reinforced",
  },
  {
    id: "fw003",
    ref: "KPT-FW-003",
    slug: "thermal-boxy-tee",
    name: "THERMAL BOXY TEE",
    line: "festivalwear",
    price: 7500,
    gsm: "280GSM",
    sizes: [
      { label: "S", stock: "available" },
      { label: "M", stock: "available" },
      { label: "L", stock: "available" },
      { label: "XL", stock: "available" },
      { label: "XXL", stock: "available" },
    ],
    spec: "Diamond-pattern thermal masking front print. Anti-drone Stealth Wear inspired texture. Enzyme washed.",
    shortSpec: "280GSM // Thermal masking print // Enzyme washed",
  },
  // ── EVERYDAY ──
  {
    id: "ed001",
    ref: "KPT-ED-001",
    slug: "underground-tee",
    name: "UNDERGROUND TEE",
    line: "everyday",
    price: 6500,
    gsm: "260GSM",
    sizes: [
      { label: "S", stock: "available" },
      { label: "M", stock: "available" },
      { label: "L", stock: "available" },
      { label: "XL", stock: "available" },
      { label: "XXL", stock: "available" },
    ],
    spec: "Tonal chest hit. Interior wrist-cuff frequency print — visible only to the wearer. Enzyme washed for lived-in texture.",
    shortSpec: "260GSM // Tonal chest hit // Interior frequency print",
  },
  {
    id: "ed002",
    ref: "KPT-ED-002",
    slug: "signal-grey-hoodie",
    name: "SIGNAL GREY HOODIE",
    line: "everyday",
    price: 14500,
    gsm: "400GSM",
    badge: "NEW",
    sizes: [
      { label: "S", stock: "available" },
      { label: "M", stock: "available" },
      { label: "L", stock: "low" },
      { label: "XL", stock: "available" },
    ],
    spec: "Signal Interference Grey colorway. 3M reflective hem tape activation on direct light. KPT-UG woven label only.",
    shortSpec: "400GSM // Signal Interference Grey // 3M reflective hem tape",
  },
  {
    id: "ed003",
    ref: "KPT-ED-003",
    slug: "cert-tee",
    name: "CERT TEE",
    line: "everyday",
    price: 6000,
    gsm: "250GSM",
    sizes: [
      { label: "S", stock: "available" },
      { label: "M", stock: "available" },
      { label: "L", stock: "available" },
      { label: "XL", stock: "available" },
      { label: "XXL", stock: "available" },
    ],
    spec: 'Front: blank. Back: OSHA-style cert block print. "CERTIFIED FOR UNDERGROUND USE" in Space Mono 6pt.',
    shortSpec: "250GSM // OSHA-style cert back print // Clean front",
  },
  // ── ACCESSORIES ──
  {
    id: "ac001",
    ref: "KPT-AC-001",
    slug: "kpt-shades-mk1",
    name: "KPT SHADES — MK1",
    line: "accessories",
    price: 12000,
    gsm: "TR90 Frame",
    badge: "NEW",
    sizes: [{ label: "ONE SIZE", stock: "available" }],
    spec: "Polarised UV400 lenses. Matte black acetate. Carry case doubles as Faraday pouch. Built for festival UV and warehouse dark equally.",
    shortSpec: "TR90 Frame // Polarised UV400 // Faraday carry case",
  },
  {
    id: "ac002",
    ref: "KPT-AC-002",
    slug: "rigger-belt-system",
    name: "RIGGER BELT SYSTEM",
    line: "accessories",
    price: 8500,
    gsm: "1000D Nylon",
    badge: "LIMITED",
    sizes: [
      { label: "S/M", stock: "available" },
      { label: "L/XL", stock: "available" },
    ],
    spec: "Cobra buckle primary. Modular attachment points for cable management. SWL: 40kg rated hardware.",
    shortSpec: "1000D Nylon // Cobra buckle // 40kg SWL hardware",
  },
  {
    id: "ac003",
    ref: "KPT-AC-003",
    slug: "resistance-pack-tote",
    name: "RESISTANCE PACK TOTE",
    line: "accessories",
    price: 4500,
    gsm: "600D Canvas",
    sizes: [{ label: "ONE SIZE", stock: "available" }],
    spec: "Adversarial patch exterior print. Interior Faraday lining standard. Fits 2x LP or 12\" speaker cable coil.",
    shortSpec: "600D Canvas // Faraday lining // Fits 2x LP",
  },
];

export function getProductBySlug(slug: string): ProductData | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByLine(line: string): ProductData[] {
  return PRODUCTS.filter((p) => p.line === line);
}

export function formatEUR(cents: number): string {
  return `€${(cents / 100).toFixed(0)}`;
}

export function getLineColor(line: string): string {
  switch (line) {
    case "ravewear": return "var(--green)";
    case "festivalwear": return "var(--rust)";
    case "everyday": return "var(--paper)";
    case "accessories": return "var(--orange)";
    case "secret": return "var(--orange)";
    default: return "var(--green)";
  }
}
