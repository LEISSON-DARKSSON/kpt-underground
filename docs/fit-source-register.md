# Fit source register (H04)

Where every size chart on the site comes from. The code never generates, converts or estimates a measurement: a chart exists only in `src/lib/store/fit-sources.ts`, with a source below, or Fourthwall publishes it in the listing's `SIZE_AND_FIT` section (which always wins). Anything else shows "Size chart not published yet".

Checked 2026-10-02 against the live public catalog (22 products).

## Heavyweight Tee (`kpt-heavyweight-tee`, offer `6c250dd6-5ebd-4a75-a9a5-d1bc584f177f`)

| Item | Evidence |
|---|---|
| Base model | Comfort Colors 1717 (Garment-Dyed Heavyweight T-Shirt). Fourthwall's product catalog page for that product names brand Comfort Colors, model 1717, sizes S-4XL: `https://products.fourthwall.com/comfort-colors-garment-dyed-heavyweight-t-shirt-dtfx-1`. |
| Match with the shop listing | The listing's "More details" read "100% ring-spun cotton", "Heavyweight fabric (6.1 oz)", "Relaxed fit"; it sells S, M, L, XL, 2XL, 3XL, 4XL. These are the catalog entry's fields, and the manufacturer spec sheet says 6.1-ounce, 100% US ring spun cotton, relaxed fit. |
| Not verified | The product configuration inside the Fourthwall admin (the base product picked when the listing was created) was not opened. The match above rests on the catalog entry, the listing text and the size run. Confirm in the admin product view if the owner wants it beyond doubt. |
| Garment table | Manufacturer spec sheet, "PRODUCT MEASUREMENTS", fractions as printed: `https://www.blankstyle.com/files/specs/2549/SpecSheetMeasurements_1717.pdf` (a reseller's copy of Comfort Colors' own sheet; read 2026-10-02). |
| Same numbers on the shop page | `https://keepitunderground-shop.fourthwall.com/products/kpt-heavyweight-tee` shows Length / Width / Sleeve length with the same values (rounded: 26 5/8 shown as 26.62). The site shows the rounded values a shopper also sees on Fourthwall. `tests/store/fit-source.test.mjs` checks every cell against the manufacturer fractions (tolerance 0.01 in). |
| Body chest | Same spec sheet, "SIZE CHARTS": S 36-37, M 38-40, L 42-44, XL 46-48, 2XL 50-52, 3XL 54-56, 4XL 58-60 (inches). It is a body measurement and sits in its own column group ("Your body"), never mixed with garment columns. |
| Definitions used | Those that match the numbers: Length = body length at back, high point shoulder to finished hem; Chest = across the chest one inch below the armhole, laid flat; Sleeve = sleeve length from center back (center back neck to shoulder point to sleeve hem). |
| Known inconsistency | The shop page's own instruction text reads "Position the tape at the top of the set-in sleeve and extend it down to the sleeve's hem." That wording describes a different measuring path than the one the manufacturer used for these numbers. The numbers equal the manufacturer's center-back sleeve length, so the site uses the manufacturer's definition. The Fourthwall page text is Fourthwall's and is not changed here. |
| Tolerance | "Supplier-provided measurements might differ by up to 2 inches (5 cm)." (shop page). Shown on the product page. |
| Not used | The "model is 6' and wears a size L" line: it appeared on another creator's page for the same catalog product, not on this shop's page. Centimetre values: not shown on the page text that was read, so none are derived. |

## Other size-dependent products

| Product | Size run | Fit info today | Status |
|---|---|---|---|
| kpt-premium-hoodie | S-3XL | none in the listing | Still "not published yet". Sizes found on other creators' Fourthwall pages for a 65/35, 8.5 oz hoodie were not used: no page named the supplier model of this listing. |
| kpt-crewneck | S-3XL | none in the listing | Still "not published yet". No model-verified source found. |
| kpt-crew-socks, kpt-beanie, offline-embroidered-beanie | One size | Fourthwall `SIZE_AND_FIT` present | Shown as published by Fourthwall. |
| transit-signal-laptop-sleeve, transit-subsurface-laptop-sleeve | 13" | Fourthwall `SIZE_AND_FIT` present | Shown as published by Fourthwall. |
| control-mouse-pad, both desk mats | Fixed size in the variant name | Fourthwall `SIZE_AND_FIT` present | Shown as published by Fourthwall. |
| kpt-magsafe-tough-case | 18 iPhone models | Model choice itself | Chosen before the item can be added to the cart. The listing sentence "Select your iPhone model at checkout." is hidden on the site (presentation only, `dropCheckoutModelPrompt`); the Fourthwall listing text is unchanged and editing it needs the owner's approval. |
| totes, backpack | One size | n/a | Not size-dependent. |

Closing the hoodie and crewneck gaps needs the exact supplier model from the admin product view (or from Fourthwall), then a row in `fit-sources.ts` plus the same cell-by-cell test against the manufacturer sheet.
