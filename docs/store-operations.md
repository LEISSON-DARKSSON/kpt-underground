# Store operations — KEEP IT UNDERGROUND

Runbook for the Fourthwall catalog behind keepitunderground.com. Code lives in this repo; products live in Fourthwall admin.
Last updated 2026-10-03 (HARDCORE SERIES: 18 products Public; HC01/HC02/HC04 Round 2 designs; apparel prints maximised; HC12 MagSafe paused, HC20 not makeable).

## Live catalog (40 Public products)

Generated from the Storefront API with `.\with-token.ps1 catalog-doc.mjs` (QA folder). Regenerate instead of editing by hand.

| # | Product | Slug | Price (USD) | Variants |
|---|---|---|---|---|
| 1 | HARDCORE / 06 KPT_UG - Embroidered Beanie | `hardcore-06-kpt-ug-embroidered-beanie` | $29 | 1 |
| 2 | NIGHT SHIFT - SIGNAL Studio Mug | `night-shift-signal-studio-mug` | $24 | 1 |
| 3 | OBJECT STUDIES - HARDCORE MARKS | `object-studies-hardcore-marks` | $12 | 1 |
| 4 | PROJECT NOTES - STACK | `project-notes-stack` | $24 | 1 |
| 5 | SIGNAL - SYSTEM Studio Tote | `signal-system-studio-tote` | $29 | 1 |
| 6 | WALL STUDIES - HARDCORE / STACK | `wall-studies-hardcore-stack` | $29 | 1 |
| 7 | WALL STUDIES - HARDCORE / CROWD | `wall-studies-hardcore-crowd` | $29 | 1 |
| 8 | WALL STUDIES - HARDCORE / PAPER | `wall-studies-hardcore-paper` | $29 | 1 |
| 9 | WALL STUDIES - HARDCORE / SCOPE | `wall-studies-hardcore-scope` | $29 | 1 |
| 10 | CONTROL - SCOPE Mouse Pad | `control-scope-mouse-pad` | $19 | 1 |
| 11 | TRANSIT - NO MAIN STAGE Laptop Sleeve | `transit-no-main-stage-laptop-sleeve` | $39 | 1 |
| 12 | HARDCORE / 08 FLOOR - Desk Mat | `hardcore-08-floor-desk-mat` | $34 | 1 |
| 13 | HARDCORE / 07 WIDE SIGNAL - Desk Mat | `hardcore-07-wide-signal-desk-mat` | $34 | 1 |
| 14 | HARDCORE / 05 STACK - Crewneck | `hardcore-05-stack-crewneck` | $49–$53 | 6 |
| 15 | HARDCORE / 04 UNDERGROUND - Premium Hoodie | `hardcore-04-underground-premium-hoodie` | $59–$63 | 6 |
| 16 | HARDCORE / 03 DRIP - Premium Hoodie | `hardcore-03-drip-premium-hoodie` | $59–$63 | 6 |
| 17 | HARDCORE / 02 THE RIG - Heavyweight Tee | `hardcore-02-the-rig-heavyweight-tee` | $35–$41 | 7 |
| 18 | HARDCORE / 01 PRESSURE - Heavyweight Tee | `hardcore-01-pressure-heavyweight-tee` | $35–$41 | 7 |
| 19 | KPT - Minimalist Backpack | `kpt-minimalist-backpack` | $69 | 1 |
| 20 | KPT - MagSafe Tough Case | `kpt-magsafe-tough-case` | $29 | 18 |
| 21 | KPT - Beanie | `kpt-beanie` | $29 | 1 |
| 22 | KPT - Crew Socks | `kpt-crew-socks` | $19 | 1 |
| 23 | CONTROL - Mouse Pad | `control-mouse-pad` | $19 | 1 |
| 24 | KPT - Studio Tumbler | `kpt-studio-tumbler` | $39 | 1 |
| 25 | KPT - Crewneck | `kpt-crewneck` | $49–$53 | 6 |
| 26 | KPT - Heavyweight Tee | `kpt-heavyweight-tee` | $35–$41 | 7 |
| 27 | KPT - Premium Hoodie | `kpt-premium-hoodie` | $59–$63 | 6 |
| 28 | OFFLINE - Embroidered Beanie | `offline-embroidered-beanie` | $29 | 1 |
| 29 | FIELD / 03 - Water Bottle | `field-03-water-bottle` | $29 | 1 |
| 30 | NIGHT SHIFT - Studio Mug | `night-shift-studio-mug` | $24 | 1 |
| 31 | TRANSIT - SUBSURFACE Laptop Sleeve | `transit-subsurface-laptop-sleeve` | $39 | 1 |
| 32 | TRANSIT - SIGNAL Laptop Sleeve | `transit-signal-laptop-sleeve` | $39 | 1 |
| 33 | WALL STUDIES - SUBSURFACE / 02 | `wall-studies-subsurface-02` | $29 | 1 |
| 34 | WALL STUDIES - SIGNAL / 01 | `wall-studies-signal-01` | $29 | 1 |
| 35 | OBJECT STUDIES - Six Marks | `object-studies-six-marks` | $12 | 1 |
| 36 | PROJECT NOTES - SUBSURFACE / 02 | `project-notes-subsurface-02` | $24 | 1 |
| 37 | PROJECT NOTES - SIGNAL / 01 | `project-notes-signal-01` | $24 | 1 |
| 38 | SIGNAL - Studio Tote | `signal-studio-tote` | $29 | 1 |
| 39 | KEEP IT UNDERGROUND SUBSURFACE / 02 | `keep-it-underground-subsurface-desk-mat` | $34 | 1 |
| 40 | KEEP IT UNDERGROUND Signal 01 Desk Mat | `keep-it-underground-signal-01-desk-mat` | $34 | 1 |

XL+ apparel sizes carry Fourthwall's automatic size upcharge (+$2/+4/+6). Wave history (offer ids, margins, placement, evidence) is in `C:\PROJECTS\kpt-underground\execution-report.md` and `execution-record.json`.

## Lifecycle of a product

1. **Handoff** — art files, names, prices, base products (a zip/HTML gallery or a concept board).
2. **Print files** — run the `kpt-print-file-build` pipeline (section below) until preflight is N/N PASS. Raw AI art is never uploaded as is.
3. **Triage** — open each base product's catalog page and press *Design now*:
   - native v3 designer → fully automatable;
   - Printful embedded designer (backpacks, phone cases, other all-over/sublimation items) → the owner picks the file in the native dialog, Claude does placement and listing.
4. **Create** — follow the `fourthwall-product-create` skill. Save as hidden → **Private**.
5. **Review** — send the owner a mockup sheet (admin product pages, not `/preview`, which 404s for Private).
6. **Publish** — only on an explicit owner command naming the products. Then run the publish checks below.
7. **Record** — append to `execution-report.md`, add a key to `execution-record.json`, regenerate the catalog table above.

## Placement rules that bit us

| Situation | Rule |
|---|---|
| Native designer | Never drag/resize. Pre-build placement files: `wave03-pad.mjs` (pad to aspect), `place-art.mjs` (left chest etc.), `sock-template.mjs 18` (full two-sock template), or the print-file pipeline below. Max 11000 px. |
| Printful designer | Measure the dashed **Safe Print Area**, set width in *Transform* (aspect stays locked), centre with *Position* → first two align buttons. Fill the background with the artwork's background colour on **all placements**. |
| Background colour | A mismatch (e.g. `#000` vs `#0B0C0C`) shows as a visible box in mockups. Use the exact hex. |
| Printful colour picker | Keyboard only: open the custom swatch, Tab to eyedropper → R → G → B, Ctrl+A + value, **Enter**. A mouse click inside picks a palette swatch; Escape reverts. |
| Embroidery (beanie 1501KC) | Centre optically in 5″×1.75″, ≤ 6 thread colours, confirm no digitising fee. |
| Socks | Expect a low-res warning; accept "current quality" and note it. Blacks can print greyish. |
| Mug wrap (WGM79B) | Uploads land in the 2.14″ Front zone. Full wrap: image menu → Resize width 7.00″ → Set position x 0.25, y 0.37 (Confirm via JS). Check the details-page mockups show the wrap. |
| Apparel print size (native v3) | The designer drops an upload at 80 % of the area (e.g. 12.00x14.40 on 15x18). For a full-area file: tee → Fit to area → Full size; hoodie/crew (no Full size option) → Resize width 15.00 in + Set position x 0, y 0. Zoom the size label (15.00" x 18.00") before Continue. Owner rule 2026-10-03: apparel art as large as the area allows — build files with `maximize_art.py`. |
| Edit design of an existing product | Product page → *Edit product design* → select layer → trash → upload → size → *Continue* (saves and returns to the product page; mockups regenerate in ~1 min). Update the description if the art changed. |
| Big apparel art goes on the BACK | Owner rule 2026-10-03: large designs on the back, not the chest (front stays empty or a small chest mark). Back areas: tee CC1717, crew M2480, hoodie M2580 are all 15×18 in. A back-only print costs the same as front-only; front + back adds about $5.95. Change the description to "Back print, DTFx". |
| Main product photo | After a design change, put the mockup that shows the art first: Photography and design → focus the tile (`[aria-roledescription=sortable]`), Space, ArrowLeft/Right, Space, then Save. Arrows do not cross grid rows; mouse drag does not work. |
| Upload size limit | Files > 9.5 MB: `palette_upload.py <in> <out> <spec>` (255-colour palette + transparent index, re-runs preflight). |
| Status flip by JS | Click the status pill, pick `input[name=status][value=PUBLIC]`, then the *Save* inside the same popover (walk up from the radio); the page-level Save is a different button. |
| Status Hidden → Private | Coordinate-free: click the status pill, then `input[name=status][value=PRIVATE]`, then the enabled Save button (JS); re-read the pill text. |
| Supplier facts | `fetch('/store/keepitunderground/catalog/products/<slug>')` from an admin tab and read the description text — no page navigation needed. |

## Print-file pipeline (`C:\PROJECTS\kpt-underground-qa\print-pipeline`)

| File | Use |
|---|---|
| `print-areas.json` | Target px / inches / bg / safe margin / min DPI per base product (tee, crew, hoodie, beanie, desk mat, sleeve, mouse pad, mug, MagSafe case, tote, notebook, stickers, posters). |
| `upscale.cmd`, `upscale-dir.cmd` | Upscayl CLI ×4 on the GPU, model `upscayl-standard-4x`. |
| `build_print.py <collection.json> [IDs]` | Place, knockout (hard alpha), DPI metadata, proof JPG, manifest + preflight. |
| `render-html.mjs` | Vector art (embroidery, stickers) with Bebas Neue / Space Mono. |
| `maximize_art.py <in> <out> <spec>` | Crop to the art bbox and scale (≤1.35x) to fill the print area, top-centred, hard alpha, 300 ppi. |
| `print_preflight.py` | Gate: dims, max side, DPI, transparency/haze, bg hex, safe area, embroidery colours. Exit 1 on FAIL. Tests: `python test_print_preflight.py`. |

Run on Windows (Desktop Commander, `cmd`): Python 3.14 + Pillow/numpy, Node + playwright-core. The VM shell has only 4 GB RAM. First collection: `C:\PROJECTS\hardcore-series\print\` (HC01–HC20, 20/20 PASS, README with the designer canvas/fill hex per file).

## QA scripts (`C:\PROJECTS\kpt-underground-qa`)

All token-using scripts run through `.\with-token.ps1 <script>.mjs`, which pulls the token from Vercel Preview env for one run and never prints it.

| Script | What it checks |
|---|---|
| `fw-live-probe.mjs` | Whole public catalog (paginated via `fw-pages.mjs`), creates a cart with the newest product, checkout page HTTP status. |
| `fw-slug-probe.mjs` | `$env:SLUGS="a,b"` — per-slug access, state, prices, variants, images; exit 1 if any slug is not PUBLIC. Immediate (no collection cache). |
| `qa-wave03-live.mjs` | `$env:OUT=<evidence dir>; $env:SLUGS=...` — keepitunderground.com `/shop` card count + screenshot, product pages, site checkout API (adds the last slug; picks the first size on multi-size products). |
| `catalog-doc.mjs` | Prints the catalog table for this document. |
| `fw-pages.test.mjs` | `node --test fw-pages.test.mjs` — pagination helper unit tests. |

## Publish checklist

1. Admin product page → status pill (first click after load often does nothing; zoom to confirm the menu) → Public → Save → title row shows Public + shop URL.
2. `fw-slug-probe.mjs` for the new slugs → all PUBLIC with expected prices.
3. Wait ~60 s (collection cache + site ISR), then `fw-live-probe.mjs` → expected public count, cart 200, checkout page 200.
4. `qa-wave03-live.mjs` → `/shop` card count matches, product pages 200, checkout API 200.
5. Never go past the checkout page. No orders.

## Known behaviour

- `collections/all` and the site's data cache lag ~1 minute after publishing. Checkout handles this: on `UNKNOWN_VARIANT` / `VARIANT_UNAVAILABLE` it re-reads the catalog once with `no-store` (PR #6).
- Headless browsers get a 403 on the hosted checkout page (bot protection); verify it in a real browser or by HTTP status from the probe.
- Storefront `/products/<slug>`: Public and Hidden return data, Private returns 404.
