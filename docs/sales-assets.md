# Honest sales assets for the two 34 USD desk mats (ticket H07, preparation only)

Status: PREPARATION ONLY. Nothing here is published, posted or uploaded. No Fourthwall or live-site change was made, no asset was created, no AI imagery was used. Every draft below is `DRAFT_NOT_APPROVED`; posting is not authorized.

Machine-readable inventory: `docs/sales-assets-manifest.json` (checked by `tests/store/sales-assets.test.mjs`; run it directly, it is not part of `npm run test:store`).

Scope: SIGNAL / 01 (`keep-it-underground-signal-01-desk-mat`, offer `74c2ace1-4f7c-469b-a607-5555432019b4`, variant `b28b8e38-0bd5-4303-8641-7aed66648b45`) and SUBSURFACE / 02 (`keep-it-underground-subsurface-desk-mat`, offer `97704a85-a6b6-4090-894f-a7b5bc71a374`, variant `d479a574-d42e-4767-9725-f940ce0e165c`). One variant each (All-Over Print, 15.5" x 31.5", 34 USD). Source of image ids: live catalog snapshot 2026-10-02 (also the test fixture).

## 1. Manifest summary (8 assets)

All three listing images of each mat are `FOURTHWALL_DIGITAL_MOCKUP`: 1536 x 2048 transparent cut-outs, all attached to the mat's single variant. Position-to-id mapping is by gallery order (`galleryFor` keeps `product.images` order; the live page HTML carries no image ids). Required label on every render: "digital visualisation".

| Gallery position | SIGNAL image id | SUBSURFACE image id | Content | Use | Reason |
|---|---|---|---|---|---|
| 1 | `d90c7958-b6cd-42ea-b888-015ee654515c` | `4ff66fea-a872-40d4-bc2c-251902be6b32` | Flat full mat, landscape | hero | Whole product, correct artwork, no props |
| 2 | `29baecd6-fef4-4f1b-8733-f6b1bb6a632f` | `5da3f9c7-8dd3-41d1-826e-27cb6b7997cb` | Full mat rotated to vertical | hero (vertical formats only) | Whole product; secondary to image 1 |
| 3 | `a81a85b4-5cb0-40f0-98ed-6fb2542e82d8` | `29ac9ba5-a8a5-4600-844c-35f46e94befb` | Angled corner close crop, runs off the canvas | detail | Shows artwork corner and layout; whole mat not visible; no edge or stitching claim |

Two further entries are `ARTWORK_SOURCE` (flat print files, 9921 x 5197 px, 300 dpi), usable for detail only:

| Asset id | Path | SHA-256 |
|---|---|---|
| `artwork:SIGNAL-Desk-Mat-Upload.png` | `C:\PROJECTS\kpt-underground\KEEP-IT-UNDERGROUND-Claude-Handoff\product-assets\print\` | `621a9f5e...e8e426` |
| `artwork:SUBSURFACE-Desk-Mat-Upload.png` | same folder | `9a8237c6...415c75` |

Folder mismatch to note: the Products handoff (`KEEP-IT-UNDERGROUND-Products-Claude-Handoff`) contains only Wave 02 artwork and no desk-mat files. The desk-mat print files live in the sibling `KEEP-IT-UNDERGROUND-Claude-Handoff`. The print canvas is 33.07 x 17.32 in, not the finished 15.5 x 31.5 in mat; the crop is unproofed, so do not crop and re-upload these files. They are not hero images (no product shape) and not product photos.

`PHYSICAL_SAMPLE_PHOTO`: none. No real sample photo exists on disk (searched both handoffs, `evidence/`, `files/` and `C:\PROJECTS\kpt-*`). Usage-context: none exists either (the listing renders show the mat only).

Crop decisions for image 1 (both mats): alpha bounding box (53,640,1488,1402) in the 1536 x 2048 canvas, about 1436 x 763 px, so about 63% of the canvas is transparent. Crop to that box plus padding for landscape or square placements and put it on a neutral backdrop. Image 2 bounding box is about (321,179,1207,1862); image 3 about (168,0,1536,1888) and bleeds off the canvas edge, so it cannot be extended.

Caution on proportions: the render's aspect is about 1.88:1, the catalog size is 15.5" x 31.5" (about 2.03:1). Never derive or imply dimensions from the render; quote the catalog size text.

Not used (listed in the manifest as `excludedAssets`): the web-design concept boards in `KEEP-IT-UNDERGROUND-Claude-Handoff\design\assets` (vector keyboard and mouse, "DESK MAT - CONCEPT", "Crop pending supplier proof"; not Fourthwall renders, show props that are not included), all Wave 02 artwork (other products), and the SVG template sources ("template validation pending").

## 2. Missing asset types and what the owner would need to supply

None of these may be generated or faked. Supply only what physically exists; do not order samples for this (the existing sample-cost rule does not cover it).

| Missing | What to supply | Used for |
|---|---|---|
| Real sample photo of each mat | Photos of a physical mat, only if a sample already exists, plus a statement that it came from the current supplier run | Replaces renders in draft 6; the only item that can be labelled a photo |
| Usage-context photo, dark and light desk | Real photos of a mat on a real desk (own props are fine, say they are not included) | Drafts 1 and 2 (currently flat render only) |
| Print close-up | Macro photo of the fine contour lines on a real mat | Draft 4 and any claim about line quality |
| Edge and backing close-up | Photo of the edge and the anti-slip backing of a real mat | Any edge claim; today none is made |
| Contour process clip | Screen recording of the artwork being built, from owner files | Draft 4 (currently a still of the print file) |
| Supplier crop proof | Supplier proof of the print on the 15.5 x 31.5 in mat | Confirms what is actually printed where |
| Channel and account decision | One existing organic channel (proposal: Instagram) and an audience check | Fills the channel placeholder |
| Price confirmation on posting day | Platform price still 34 USD | Every draft quotes it |
| Written approval per draft | Owner approval naming the draft numbers | Posting; none is given |

## 3. Drafts for the 14-day test (DRAFT_NOT_APPROVED)

Rules: mats only, no new SKUs, one organic channel, no paid budget, no discount, no scarcity wording, no bestseller label, no invented customer quotes, no material, protection or ergonomic claims beyond the catalog text. Copy uses only supplier catalog facts (3 mm thick neoprene, anti-slip backing, care, 15.5" x 31.5", made to order, quality guarantee text) and handoff copy (taglines, descriptions, "props not included", "printed colors and texture may vary"). No shipping time or cost is stated.

UTM placeholders (owner confirms; do not put personal data in them): `utm_source={channel}` (proposal: instagram), `utm_medium={medium}` (proposal: organic_social), `utm_campaign={campaign}` (proposal: kiu_studio_validation_01), `utm_content={content}` (per draft below). Link pattern: `https://keepitunderground.com/<path>?utm_source={channel}&utm_medium={medium}&utm_campaign={campaign}&utm_content={content}`.

<!-- DRAFT 1 START -->
### Draft 1 - Dark workspace / SIGNAL

DRAFT_NOT_APPROVED - posting is not authorized.

- Slot 1, format: single image, channel `{channel}`
- Image: `d90c7958-b6cd-42ea-b888-015ee654515c` (gallery image 1, cropped to the alpha box) on a neutral dark backdrop. Label on the image: "digital visualisation".
- Landing: `/shop/keep-it-underground-signal-01-desk-mat`, `utm_content=signal_dark_desk_01`
- Gap: no usage-context image exists; the flat render stands in until the owner supplies a desk photo.

Caption:

> Make room for your next idea.
> SIGNAL / 01: a charcoal background, flowing contour lines and a warm orange focal point. The artwork sits mainly to the right and along the lower edge, leaving a quieter center for your keyboard and everyday work.
> 15.5" x 31.5" desk mat. USD 34 before tax and shipping. Keyboard, mouse and other props are not included.
> Image: digital visualisation. Printed colors and texture may vary.
<!-- DRAFT 1 END -->

<!-- DRAFT 2 START -->
### Draft 2 - Light workspace / SUBSURFACE

DRAFT_NOT_APPROVED - posting is not authorized.

- Slot 2, format: single image, channel `{channel}`
- Image: `4ff66fea-a872-40d4-bc2c-251902be6b32` (gallery image 1, cropped to the alpha box) on a neutral light backdrop. Label on the image: "digital visualisation".
- Landing: `/shop/keep-it-underground-subsurface-desk-mat`, `utm_content=subsurface_light_desk_01`
- Gap: same as draft 1 (no desk photo).

Caption:

> A different perspective for your everyday workspace.
> SUBSURFACE / 02: a warm off-white background, an abstract architectural grid and an orange contour. The open center keeps the composition calm, while the geometry gives the right side a distinct visual focus.
> 15.5" x 31.5" desk mat. USD 34 before tax and shipping. Props are not included.
> Image: digital visualisation. Printed colors and texture may vary.
<!-- DRAFT 2 END -->

<!-- DRAFT 3 START -->
### Draft 3 - Two designs, same price

DRAFT_NOT_APPROVED - posting is not authorized.

- Slot 3, format: two-image carousel, channel `{channel}`
- Images: `d90c7958-b6cd-42ea-b888-015ee654515c` (SIGNAL) and `4ff66fea-a872-40d4-bc2c-251902be6b32` (SUBSURFACE), both gallery image 1, same crop and scale. Label on each image: "digital visualisation".
- Landing: `/shop?category=desk-studio`, `utm_content=two_designs_compare_01`

Caption:

> Same size. Same price. Two ways to set up the desk.
> SIGNAL / 01 is charcoal with light contour lines and an orange focal point. SUBSURFACE / 02 is warm off-white with an architectural grid and an orange contour.
> Both: 15.5" x 31.5", USD 34 before tax and shipping.
> Images: digital visualisation.
<!-- DRAFT 3 END -->

<!-- DRAFT 4 START -->
### Draft 4 - Design detail / contour construction

DRAFT_NOT_APPROVED - posting is not authorized.

- Slot 4, format: still from the print file (a clip needs an owner-supplied recording), channel `{channel}`
- Image: `artwork:SIGNAL-Desk-Mat-Upload.png`, cropped to the contour area only. Label: "artwork file, not a product photo".
- Landing: `/shop/keep-it-underground-signal-01-desk-mat`, `utm_content=signal_contour_detail_01`
- Note: shows the drawn artwork, not how the finished print looks; no claim about print quality.

Caption:

> The SIGNAL / 01 artwork up close: flowing contour lines around a warm orange circle, drawn for the right-hand side of the mat.
> This is the artwork file, not a photo of a finished mat.
> The desk mat: 15.5" x 31.5", USD 34 before tax and shipping.
<!-- DRAFT 4 END -->

<!-- DRAFT 5 START -->
### Draft 5 - Size and delivery clarity

DRAFT_NOT_APPROVED - posting is not authorized.

- Slot 5, format: text card (facts only), channel `{channel}`
- Image: none required; if a picture is wanted use `5da3f9c7-8dd3-41d1-826e-27cb6b7997cb` (SUBSURFACE gallery image 2, vertical) with the label "digital visualisation", and do not draw dimensions on it.
- Landing: `/shop/keep-it-underground-subsurface-desk-mat`, `utm_content=size_clarity_01`
- Verify before approval: the wording "before tax and shipping" against the hosted checkout, and the quality-guarantee text against the live listing. No delivery time is promised.

Card text:

> KEEP IT UNDERGROUND desk mats
> Size: 15.5" x 31.5" (approx 80 x 39.4 cm)
> 3 mm thick neoprene. Anti-slip backing.
> One desk mat per order; keyboard, mouse and other props are not included.
> Care: spot clean with warm water and mild dish soap. Air dry only.
> Made to order. Quality is guaranteed: if there is a print error or visible quality issue, it is replaced or refunded. General returns and sizing-related returns are not accepted.
> USD 34 before tax and shipping. Checkout is on our hosted shop page.
<!-- DRAFT 5 END -->

<!-- DRAFT 6 START -->
### Draft 6 - Honest visualisation

DRAFT_NOT_APPROVED - posting is not authorized.

- Slot 6, format: single image with disclosure, channel `{channel}`
- Image: `a81a85b4-5cb0-40f0-98ed-6fb2542e82d8` (SIGNAL gallery image 3, corner detail). Label on the image: "digital visualisation". Replace with a photo only if the owner supplies a real sample photo.
- Landing: `/shop?category=desk-studio`, `utm_content=honest_visualisation_01`

Caption:

> A closer look at the SIGNAL / 01 corner, as a digital visualisation.
> It is a render of the design, not a photo of a finished mat, so printed colors and texture may vary.
> Two designs, one size: 15.5" x 31.5", USD 34 before tax and shipping.
<!-- DRAFT 6 END -->

## 4. Checks before any approval

- Re-read the live price (34 USD) and the two product pages on the day; the image ids must still match the manifest.
- Owner picks the channel and approves each draft by number; this file approves nothing.
- Traffic, UTM and consent measurement (H05) must be verified before the 14-day clock starts; see the experiment register.
