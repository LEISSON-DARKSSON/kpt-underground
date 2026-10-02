# Store operations — KEEP IT UNDERGROUND

Runbook for the Fourthwall catalog behind keepitunderground.com. Code lives in this repo; products live in Fourthwall admin.
Last updated 2026-10-02 (Wave 04 complete).

## Live catalog (22 Public products)

Generated from the Storefront API with `.\with-token.ps1 catalog-doc.mjs` (QA folder). Regenerate instead of editing by hand.

| # | Product | Slug | Price (USD) | Variants |
|---|---|---|---|---|
| 1 | KPT - Minimalist Backpack | `kpt-minimalist-backpack` | $69 | 1 |
| 2 | KPT - MagSafe Tough Case | `kpt-magsafe-tough-case` | $29 | 18 |
| 3 | KPT - Beanie | `kpt-beanie` | $29 | 1 |
| 4 | KPT - Crew Socks | `kpt-crew-socks` | $19 | 1 |
| 5 | CONTROL - Mouse Pad | `control-mouse-pad` | $19 | 1 |
| 6 | KPT - Studio Tumbler | `kpt-studio-tumbler` | $39 | 1 |
| 7 | KPT - Crewneck | `kpt-crewneck` | $49–$53 | 6 |
| 8 | KPT - Heavyweight Tee | `kpt-heavyweight-tee` | $35–$41 | 7 |
| 9 | KPT - Premium Hoodie | `kpt-premium-hoodie` | $59–$63 | 6 |
| 10 | OFFLINE - Embroidered Beanie | `offline-embroidered-beanie` | $29 | 1 |
| 11 | FIELD / 03 - Water Bottle | `field-03-water-bottle` | $29 | 1 |
| 12 | NIGHT SHIFT - Studio Mug | `night-shift-studio-mug` | $24 | 1 |
| 13 | TRANSIT - SUBSURFACE Laptop Sleeve | `transit-subsurface-laptop-sleeve` | $39 | 1 |
| 14 | TRANSIT - SIGNAL Laptop Sleeve | `transit-signal-laptop-sleeve` | $39 | 1 |
| 15 | WALL STUDIES - SUBSURFACE / 02 | `wall-studies-subsurface-02` | $29 | 1 |
| 16 | WALL STUDIES - SIGNAL / 01 | `wall-studies-signal-01` | $29 | 1 |
| 17 | OBJECT STUDIES - Six Marks | `object-studies-six-marks` | $12 | 1 |
| 18 | PROJECT NOTES - SUBSURFACE / 02 | `project-notes-subsurface-02` | $24 | 1 |
| 19 | PROJECT NOTES - SIGNAL / 01 | `project-notes-signal-01` | $24 | 1 |
| 20 | SIGNAL - Studio Tote | `signal-studio-tote` | $29 | 1 |
| 21 | KEEP IT UNDERGROUND SUBSURFACE / 02 | `keep-it-underground-subsurface-desk-mat` | $34 | 1 |
| 22 | KEEP IT UNDERGROUND Signal 01 Desk Mat | `keep-it-underground-signal-01-desk-mat` | $34 | 1 |

XL+ apparel sizes carry Fourthwall's automatic size upcharge (+$2/+4/+6). Wave history (offer ids, margins, placement, evidence) is in `C:\PROJECTS\kpt-underground\execution-report.md` and `execution-record.json`.

## Lifecycle of a product

1. **Handoff** — art files, names, prices, base products (a zip/HTML gallery or a concept board).
2. **Triage** — open each base product's catalog page and press *Design now*:
   - native v3 designer → fully automatable;
   - Printful embedded designer (backpacks, phone cases, other all-over/sublimation items) → the owner picks the file in the native dialog, Claude does placement and listing.
3. **Create** — follow the `fourthwall-product-create` skill. Save as hidden → **Private**.
4. **Review** — send the owner a mockup sheet (admin product pages, not `/preview`, which 404s for Private).
5. **Publish** — only on an explicit owner command naming the products. Then run the publish checks below.
6. **Record** — append to `execution-report.md`, add a key to `execution-record.json`, regenerate the catalog table above.

## Placement rules that bit us

| Situation | Rule |
|---|---|
| Native designer | Never drag/resize. Pre-build placement files: `wave03-pad.mjs` (pad to aspect), `place-art.mjs` (left chest etc.), `sock-template.mjs 18` (full two-sock template). Max 11000 px. |
| Printful designer | Measure the dashed **Safe Print Area**, set width in *Transform* (aspect stays locked), centre with *Position* → first two align buttons. Fill the background with the artwork's background colour on **all placements**. |
| Background colour | A mismatch (e.g. `#000` vs `#0B0C0C`) shows as a visible box in mockups. Use the exact hex. |
| Printful colour picker | Keyboard only: open the custom swatch, Tab to eyedropper → R → G → B, Ctrl+A + value, **Enter**. A mouse click inside picks a palette swatch; Escape reverts. |
| Embroidery (beanie 1501KC) | Centre optically in 5″×1.75″, ≤ 6 thread colours, confirm no digitising fee. |
| Socks | Expect a low-res warning; accept "current quality" and note it. Blacks can print greyish. |

## QA scripts (`C:\PROJECTS\kpt-underground-qa`)

All token-using scripts run through `.\with-token.ps1 <script>.mjs`, which pulls the token from Vercel Preview env for one run and never prints it.

| Script | What it checks |
|---|---|
| `fw-live-probe.mjs` | Whole public catalog (paginated via `fw-pages.mjs`), creates a cart with the newest product, checkout page HTTP status. |
| `fw-slug-probe.mjs` | `$env:SLUGS="a,b"` — per-slug access, state, prices, variants, images; exit 1 if any slug is not PUBLIC. Immediate (no collection cache). |
| `qa-wave03-live.mjs` | `$env:OUT=<evidence dir>; $env:SLUGS=...` — keepitunderground.com `/shop` card count + screenshot, product pages, site checkout API. |
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
