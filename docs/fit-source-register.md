# Fit source register (H04)

Where every size chart on the site comes from. The code never generates, converts or estimates a measurement: a chart exists only in `src/lib/store/fit-sources.ts`, with a source below, or Fourthwall publishes it in the listing's `SIZE_AND_FIT` section (which always wins). Anything else shows "Size chart not published yet".

Checked 2026-10-02 against the live public catalog (22 products).

Status: the tee and the crewneck have sourced charts. The hoodie has none, because of an open 2XL width conflict (`docs/fit-hoodie-2xl-conflict.md`).

## Identity chain: shop offer -> Fourthwall catalog product -> supplier model

CONFIRMED 2026-10-02 by a read-only Fourthwall offer-to-catalog join (review package `current-evidence.json`, `catalogIdentityJoins`; tooling output, not text written in the shop). It supersedes the earlier "provisional" status of the dossier claims A1, A2 and A4.

| Shop product | Offer id | Catalog product | Supplier model | Colour sold |
|---|---|---|---|---|
| KPT - Premium Hoodie | `caf3e2ed-8b80-4b29-bd94-46427a9fef39` | `pro_380` (`cotton-heritage-unisex-premium-hoodie-dtg`) | Cotton Heritage M2580 | Black only |
| KPT - Crewneck | `9b4af8fc-347b-4e56-8808-2aacea619a32` | `pro_c49cab91050c41dd96` (`cotton-heritage-premium-sweatshirt-dtg`) | Cotton Heritage M2480 | Black only |
| KEEP IT UNDERGROUND Signal 01 Desk Mat, SUBSURFACE / 02 | `74c2ace1-4f7c-469b-a607-5555432019b4`, `97704a85-a6b6-4090-894f-a7b5bc71a374` | `pro_a0e4db25108747b496` (`desk-mat-155-x-315`) | Allcolor SP70018 | n/a |
| KPT - Heavyweight Tee | `6c250dd6-5ebd-4a75-a9a5-d1bc584f177f` | not part of that join | Comfort Colors 1717, from the earlier evidence below (catalog entry + listing text + size run; admin product view still not opened) | n/a |

The Fourthwall region / print-partner question (dossier D2) is not tested by this join. The catalog page for M2480 says it ships from US, EU, CA and UK locations (page text as read through a summarizer); nothing retrieved says the model differs by location, and nothing says it does not.

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

## Crewneck (`kpt-crewneck`, offer `9b4af8fc-347b-4e56-8808-2aacea619a32`)

Sourced chart added 2026-10-02: Cotton Heritage M2480 Premium Sweatshirt, Black only, sizes S, M, L, XL, 2XL, 3XL (equal to the shop's variant sizes), unit inches. Garment (flat) measurements only; there is no body column because no source gives body measurements for this model.

| Item | Evidence |
|---|---|
| Numbers | Fourthwall catalog size guide for `pro_c49cab91050c41dd96`, copied verbatim as decimals: S L27 W20 Sl23.5; M 28/21/24; L 29/23/24; XL 30/25/24; 2XL 31/26.5/24; 3XL 32/28/24. The shop page prints the same values with fractions (23 1/2, 26 1/2). |
| Manufacturer cross-check | Spec sheet `https://www.blankstyle.com/files/specs/15362/M2480_ProductSpecs.pdf`, table "Detail" (rendered page image read 2026-10-02): Chest Width XS 19, S 20, M 21, L 23, XL 25, 2XL 26.5, 3XL 28; Body Length XS 26, S 27 ... 3XL 32; Sleeve Length XS 23.5, S 23.5, M 24, L 24, XL 24, 2XL 24, 3XL 24. EVERY cell S-3XL equals the catalog guide and the shop page (18 of 18). `tests/store/fit-source.test.mjs` asserts both. |
| What the sheet is | A Blankstyle-hosted copy ("Blankstyle" footer) of the Cotton Heritage spec art. No date, no revision. The Cotton Heritage origin site was not reached (redirect page). Named as a mirror in the chart's sources. |
| Not used from the sheet | XS (the shop sells S-3XL), the empty 4XL-6XL columns, and the row "Printable Area Sleeve Width" (a print-area spec, not a fit measurement). |
| Measuring definitions | The manufacturer sheet has NO measuring text, only row labels. The chart's `how` text is Fourthwall's shop-page wording, quoted verbatim: Length "Start measuring from the collar at the top (high point shoulder) and extend the measuring tape to the item's bottom."; Width "Begin at the seam below one sleeve, stretch the measuring tape across to the seam below the other sleeve."; Sleeve length "Begin at the top of the set-in sleeve and measure down to the sleeve's end." (read at `https://keepitunderground-shop.fourthwall.com/products/kpt-crewneck` on 2026-10-02 via a summarizing fetch; the dossier read the same three sentences earlier). The chart's notes say these are Fourthwall's wording. |
| Tolerance | Shop page: "Product measurements may vary by up to 2" (5 cm)." Shown as a note. |
| Fourthwall labels vs manufacturer labels | Fourthwall: Length / Width / Sleeve length. Manufacturer: Body Length / Chest Width / Sleeve Length. The numbers are identical cell by cell. Because the manufacturer states no measuring point, "same number" is established, "same measuring point" is NOT. In particular the sleeve method is not equated with the tee's: the tee's sleeve is manufacturer-defined from center back, the crewneck's is Fourthwall's set-in-sleeve wording, and the chart does not claim they measure the same thing. |
| Unit | The manufacturer table header prints no unit; inches is inferred from the values. The Fourthwall catalog guide states `in`, which fixes the unit for the numbers the chart uses. |
| Colour | Black only. The manufacturer sheet gives "Heathers 55/45 cotton/polyester" and the 65/35 blend for other colours; heather fabric blends differ from the Black variant and are not described or applied here. |

### Crewneck: OPEN discrepancies (recorded, not resolved)

1. Fit verdict, three sources, three wordings. Fourthwall catalog (join): "Fits as expected." Shop page: "This item tends to be smaller in size. To ensure an ideal fit, consider selecting a size larger than what you normally wear." Catalog product page: "Regular fit", "Unisex sizing", with customer reviews that mostly say true to size and some say "runs slim". The chart therefore shows NO fit verdict; the shop-page sentence is Fourthwall's own listing text and is not changed here. Owner decision: which sentence the listing should carry.
2. Measuring-point meaning of Width and Sleeve length (manufacturer unstated, see above).
3. Spec sheet: undated mirror, unit not printed, origin site not reached.
4. Shop-page text was read through a summarizing fetch (not byte-verified HTML); the numbers are additionally covered by the catalog join and by the manufacturer sheet image.

## Hoodie (`kpt-premium-hoodie`, offer `caf3e2ed-8b80-4b29-bd94-46427a9fef39`): NO chart

Model confirmed as Cotton Heritage M2580 (join above), but the 2XL width is in conflict between sources (Fourthwall 26.0 vs manufacturer mirror 26.5) and the question is open. Nothing is shown and nothing is chosen or averaged. Full record: `docs/fit-hoodie-2xl-conflict.md`. The site keeps "Size chart not published yet" for it.

## Other size-dependent products

| Product | Size run | Fit info today | Status |
|---|---|---|---|
| kpt-premium-hoodie | S-3XL | none in the listing | "Size chart not published yet", by decision while the 2XL width conflict is open. |
| kpt-crewneck | S-3XL | none in the listing | Sourced chart (section above). |
| kpt-crew-socks, kpt-beanie, offline-embroidered-beanie | One size | Fourthwall `SIZE_AND_FIT` present | Shown as published by Fourthwall. |
| transit-signal-laptop-sleeve, transit-subsurface-laptop-sleeve | 13" | Fourthwall `SIZE_AND_FIT` present | Shown as published by Fourthwall. |
| control-mouse-pad, both desk mats | Fixed size in the variant name | Fourthwall `SIZE_AND_FIT` present | Shown as published by Fourthwall. |
| kpt-magsafe-tough-case | 18 iPhone models | Model choice itself | Chosen before the item can be added to the cart. The listing sentence "Select your iPhone model at checkout." is hidden on the site (presentation only, `dropCheckoutModelPrompt`); the Fourthwall listing text is unchanged and editing it needs the owner's approval. |
| totes, backpack | One size | n/a | Not size-dependent. |

## Open items

1. Hoodie 2XL width conflict (26.0 vs 26.5): needs an answer from Fourthwall support or another independent reading of the manufacturer sheet; draft question in `docs/fit-hoodie-2xl-conflict.md` (NOT_SENT). Until then no hoodie chart.
2. Crewneck: owner to choose the fit sentence (three sources disagree), and optionally ask support what Fourthwall's Width and Sleeve length measure from.
3. Hoodie fit text inconsistency (catalog "Runs small. Size up one size", listing "regular fit but can run a bit tight").
4. Tee: the base product inside the Fourthwall admin was never opened; the Comfort Colors 1717 identity rests on the catalog entry, listing text and size run (the offer-to-catalog join did not cover the tee). Existing tee sleeve-text inconsistency (above) stays.
5. Manufacturer sheets are undated Blankstyle mirrors; the Cotton Heritage origin site was not reached.
6. Region / print partner (D2) untested.
7. Renderer: the table caption in `src/components/store/add-to-cart.tsx` says "garment measurements laid flat, and body chest" for every sourced chart; wrong for the garment-only crewneck chart. Screen-reader text only; needs a component change (not made here).

Adding or changing a chart: a row in `fit-sources.ts`, an expectations block in `tests/store/fit-source.test.mjs`, a cell-by-cell comparison with the manufacturer sheet, and every difference recorded here instead of chosen.
