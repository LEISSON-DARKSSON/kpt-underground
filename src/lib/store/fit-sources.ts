/**
 * Source-backed size charts (H04) for products whose Fourthwall listing has no SIZE_AND_FIT section.
 * Every number below is copied from the supplier's published size information for the exact base
 * model; nothing here is measured, estimated, converted or generated. A product that is not listed
 * here keeps the honest "Size chart not published yet" state.
 *
 * Register of sources and checks: docs/fit-source-register.md
 */

export interface FitColumn {
  key: string;
  label: string;
  /** garment = flat garment dimension; body = the wearer's body (never mixed in one column). */
  kind: "garment" | "body";
  /** Measuring instruction, as the supplier words it. */
  how: string;
}

export interface FitSource {
  /** Fourthwall offer id of the shop product this chart belongs to. */
  offerId: string;
  /** Supplier base model as Fourthwall's product catalog names it. */
  baseModel: string;
  unit: "in";
  columns: readonly FitColumn[];
  /** One row per size code exactly as the shop's variants name it; values are the published strings. */
  rows: readonly { size: string; values: readonly string[] }[];
  notes: readonly string[];
  sources: readonly { role: string; name: string; url: string; retrieved: string }[];
}

export const FIT_SOURCES: readonly FitSource[] = [
  {
    offerId: "6c250dd6-5ebd-4a75-a9a5-d1bc584f177f", // KPT - Heavyweight Tee
    baseModel: "Comfort Colors 1717 Garment-Dyed Heavyweight T-Shirt",
    unit: "in",
    columns: [
      { key: "length", label: "Length", kind: "garment", how: "Body length at back: measured from high point shoulder to finished hem at back." },
      { key: "chest", label: "Chest", kind: "garment", how: "Measured across the chest one inch below the armhole when laid flat." },
      { key: "sleeve", label: "Sleeve", kind: "garment", how: "Sleeve length from center back: measured from center back neck to shoulder point to sleeve hem." },
      { key: "body-chest", label: "Body chest", kind: "body", how: "Measure under the arm and around the fullest part of the chest with arms down, keeping tape horizontal." },
    ],
    rows: [
      { size: "S", values: ['26.62"', '18.25"', '16.25"', '36-37"'] },
      { size: "M", values: ['28"', '20.25"', '17.75"', '38-40"'] },
      { size: "L", values: ['29.37"', '22"', '19"', '42-44"'] },
      { size: "XL", values: ['30.75"', '24"', '20.5"', '46-48"'] },
      { size: "2XL", values: ['31.62"', '26"', '21.75"', '50-52"'] },
      { size: "3XL", values: ['32.5"', '27.75"', '23.25"', '54-56"'] },
      { size: "4XL", values: ['33.5"', '29.75"', '24.63"', '58-60"'] },
    ],
    notes: [
      "Length, Chest and Sleeve are flat garment measurements, not body measurements. Relaxed fit.",
      "Body chest is the manufacturer's size chart for the wearer's body.",
      "Supplier-provided measurements might differ by up to 2 inches (5 cm).",
    ],
    sources: [
      {
        role: "Manufacturer spec sheet (garment table, definitions, body chest)",
        name: "Comfort Colors Heavyweight Ring Spun Tee 1717, spec sheet + measurements",
        url: "https://www.blankstyle.com/files/specs/2549/SpecSheetMeasurements_1717.pdf",
        retrieved: "2026-10-02",
      },
      {
        role: "Shop product page (same garment numbers, rounded as shown at checkout)",
        name: "KPT - Heavyweight Tee on Fourthwall",
        url: "https://keepitunderground-shop.fourthwall.com/products/kpt-heavyweight-tee",
        retrieved: "2026-10-02",
      },
    ],
  },
];

export function fitSourceFor(offerId: string): FitSource | null {
  return FIT_SOURCES.find((s) => s.offerId === offerId) ?? null;
}
