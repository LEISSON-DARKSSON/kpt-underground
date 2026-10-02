# Hoodie size chart: open 2XL width conflict (kpt-premium-hoodie)

Status: OPEN. No hoodie entry exists in `src/lib/store/fit-sources.ts`; the product page keeps "Size chart not published yet". `tests/store/fit-source.test.mjs` fails if an M2580 entry is added. Do not choose a value, do not average, and do not describe a cause until the conflict is closed by a source.

Product: KPT - Premium Hoodie, offer `caf3e2ed-8b80-4b29-bd94-46427a9fef39`, Black only, sizes S, M, L, XL, 2XL, 3XL. Identity chain CONFIRMED 2026-10-02 by a read-only Fourthwall offer-to-catalog join: catalog product `pro_380` (`cotton-heritage-unisex-premium-hoodie-dtg`), Cotton Heritage M2580 (see `docs/fit-source-register.md`).

## The conflict

2XL width (inches). One cell. Every other S-3XL length and width cell agrees across all sources.

| Source | Kind | 2XL width | Notes |
|---|---|---|---|
| Fourthwall catalog size guide, `pro_380` | Fourthwall data via the catalog join, 2026-10-02 (`current-evidence.json`, `sizeGuides.M2580`) | 26.0 | unit `in` |
| Shop product page `keepitunderground-shop.fourthwall.com/products/kpt-premium-hoodie` | Fourthwall-hosted, same origin as the catalog | 26 | per the earlier dossier (summarizing fetch) |
| Another creator's Fourthwall hoodie page (HIBP Classic Hoodie) | Same Fourthwall template, so not independent | 26 | per the earlier dossier |
| Cotton Heritage M2580 spec sheet, Blankstyle-hosted mirror `https://www.blankstyle.com/files/specs/15352/M2580_ProductSpecs.pdf` | Manufacturer art as copied by a distributor; undated, no revision | 26.5 | table "MEASUREMENTS (IN)", row "Chest Width"; read from the rendered page image in the dossier (`autoresearch/m2580_p0.png`). The review package marks this value "manufacturerPDFIndependentlyRead: false": the reviewer did not re-read the PDF itself. |

Full M2580 rows for reference (inches). Fourthwall guide: S L27 W20; M 28/21; L 29/23; XL 30/25; 2XL 31/26; 3XL 32/28 (no sleeve column). Manufacturer mirror, Chest Width XS 19, S 20, M 21, L 23, XL 25, 2XL 26.5, 3XL 28, 4XL 29.5; Body Length from HPS XS 26, S 27, M 28, L 29, XL 30, 2XL 31, 3XL 32, 4XL 33 (no sleeve row).

Fact noted, not explained: the Fourthwall guide for the crewneck M2480 prints 2XL width 26.5 (equal to the manufacturer's M2480 sheet), while its guide for the hoodie M2580 prints 26.

## What is NOT known

- Which of 26 and 26.5 is correct for the garment Fourthwall's fulfilment partner actually makes and ships.
- Whether the two numbers measure the same point. The manufacturer sheet has row labels only ("Chest Width", "Body Length from HPS") and no measuring text; Fourthwall's hoodie text is "Width (B): Place the end of a measuring tape at one side of the chest area and pull the tape across to the other side of the product." (per the dossier).
- Whether the manufacturer mirror and the Fourthwall guide are the same version of the table. The mirror is undated and unversioned; the Fourthwall guide carries no date.
- Whether the product Fourthwall fulfils today is the same revision of M2580 that the mirror describes.
- Whether the mirror's 26.5 is a correct reading (one reading of an image-only PDF; not re-read by a second reader).
- Anything about a region or print partner difference (untested).

## Three neutral hypotheses to ask support (questions, not claims)

1. Measurement point: do the Fourthwall guide and the manufacturer table measure width at the same point on the garment, and was the 2XL value measured, rounded or entered at a different point?
2. Table version: is the Fourthwall catalog table for M2580 the same version / date as the manufacturer table, or taken from an earlier or later one?
3. Product version: is the M2580 that Fourthwall's partner produces for a Black hoodie ordered today the same product revision as the one the manufacturer table describes?

## DRAFT support question (NOT_SENT; nothing has been sent to anyone)

> Subject: Premium Hoodie (Cotton Heritage M2580) size guide, 2XL width
>
> Hello. In the product catalog size guide for the Unisex Premium Hoodie (Cotton Heritage M2580, catalog product pro_380), the 2XL width is 26 in. The manufacturer's published M2580 spec table that I found lists the 2XL "Chest Width" as 26.5 in; all other S-3XL width and length values are identical. Could you tell me: (1) which value is correct for the Black hoodie fulfilled today, (2) at which point on the garment the guide's Width is measured, and (3) whether the catalog table and the manufacturer table are the same version. I would like to publish only the value you confirm.
>
> Shop: keepitunderground (sh_1f2e8f65-2b29-4be9-9167-7f42314361fb), offer caf3e2ed-8b80-4b29-bd94-46427a9fef39.

Status: NOT_SENT. Sending is the owner's call.

## Hoodie fit-text inconsistency (also unresolved)

- Fourthwall catalog fit summary for M2580: "Runs small. Size up one size for your usual fit."
- Shop listing text: "regular fit but can run a bit tight". The shop page also carries a run-small sentence ("This hoodie runs small. For the perfect fit, we recommend ordering one size larger than your usual size." per the dossier), so even the page text disagrees with itself.
- Not a manufacturer claim. The site does not generate or pick a fit sentence; the owner decides the wording in the Fourthwall admin.

## Heather colours must not be applied to the Black hoodie

The manufacturer sheet gives different fabric blends for heather colours (Oatmeal Heather 99/1, other heathers 60/40) than the 65/35 blend, and Fourthwall's page text for heather colours does not always match the sheet (Carbon Grey 55/45 vs "Other Heathers 60/40"). Only Black is sold. Heather blends are not described and must not be applied to the Black variant.

## Closing the conflict

Any one of: written answer from Fourthwall support naming the value and the measuring point; a second independent reading of the M2580 spec sheet plus a Fourthwall statement on versions; or the owner opening the admin size chart for the offer and reporting what it shows. Then add the hoodie entry with `how` text only from sources that state it, an expectations block in `tests/store/fit-source.test.mjs`, and remove the "hoodie has no chart" test.
