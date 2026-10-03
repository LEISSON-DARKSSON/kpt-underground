# Execution report

## Fourthwall Preview server-side connection check

- Checked at: 2026-09-24T05:50:20Z
- Team: `leisson-creative`
- Project: `kpt-underground`
- Project ID: `prj_YJhnEFeOnrCoodkZ9k201ReLeGfq`
- Deployment: `dpl_EkL3BikRbd6kH2bPQ2GSQ1PXg4Ws`
- SHA: `a524b3718565a5727d3f122682f2831922799e4d`
- URL: `https://kpt-underground-ctoozrsr1-leisson-creative.vercel.app/api/fourthwall/status`
- Method: `vercel-cli` (browser attempt also recorded below)
- Result: **BLOCKED**

### Observed response

The allowed GET request through Vercel CLI returned:

- HTTP status: `302 Found`
- Content-Type: `text/plain`
- Body: `Redirecting...`
- Destination: Vercel SSO (destination and nonce omitted from this report)

This is an SSO/protection redirect, not the Fourthwall endpoint's JSON response.
The exact URL in the controlled Chrome browser was blocked by the client with
`ERR_BLOCKED_BY_CLIENT`; the SSO URL was blocked the same way. No login page was
shown, so no browser handoff occurred.

The pre-existing `execution-report.md` and `execution-record.json` referenced by
the run instructions were not present in the workspace or HEAD when this check
started. No prior result or timestamp was overwritten.

No cookies, Authorization headers, Storefront token, or automation credentials
were saved.

## Follow-up check — 2026-09-24T13:55:06Z

- Deployment: `dpl_EkL3BikRbd6kH2bPQ2GSQ1PXg4Ws` (Vercel CLI confirmed the fixed Preview URL and project)
- SHA: `a524b3718565a5727d3f122682f2831922799e4d` (fixed target supplied for this check)
- URL: `https://kpt-underground-ctoozrsr1-leisson-creative.vercel.app/api/fourthwall/status`
- Method: `vercel-cli` (controlled Chrome browser attempted first)
- HTTP status: `302`
- Content-Type: `text/plain`
- Actual response body: `Redirecting...`
- Result: **BLOCKED**

The controlled Chrome browser blocked the exact URL with `ERR_BLOCKED_BY_CLIENT`
before showing a Vercel sign-in page, so browser authentication could not be
handed off. Vercel CLI `59.19.0` was available, `vercel whoami` returned
`gertleisson-2037`, and `vercel curl --help` supported `--deployment` and
`--scope`. The GET request to the fixed deployment returned the response above.
The CLI did not require a local project link. `vercel inspect` confirmed that
the deployment ID belongs to `kpt-underground` in `leisson-creative`, has target
`preview`, and uses the exact fixed deployment URL.

This is a Vercel protection redirect, not a JSON response from the Fourthwall
endpoint. The required `connection`, `identityPinned`, and `shop` fields remain
unobserved. No cookies, Authorization headers, Storefront token, or automation
credentials were saved. The earlier check and its timestamp remain unchanged.

## Supplied observation addendum — reviewed 2026-09-24T14:10:22Z

Source: `C:\Users\gert\Downloads\Fourthwall-Preview-observations-20260924.json`
(SHA-256 `403F4FB8496B34EAAEF3F122C20AB11AC46BAD73120C97C27897614CDD4FE487`).
This is evidence supplied after the checks above, not a new direct API response
captured in this report.

The attachment reports two `GET /api/fourthwall/status` serverless runtime-log
entries for the fixed deployment: `200` at `2026-09-24T13:54:14Z` and `200` at
`2026-09-24T14:00:17Z`. It says the logs contained neither response bodies nor
Content-Type values and did not identify the callers. Its separate GET attempt
at `2026-09-24T14:02:14Z` reports `302`, `text/plain`, and `Redirecting...\n`
with a Vercel SSO destination.

These supplied logs indicate that the endpoint returned HTTP 200 to some
requests, but cannot establish that the exact blocked browser or CLI request
reached the handler. They do not supply the required JSON response or verify
`connection`, `identityPinned`, `shop.id`, or `shop.name`. **Result remains
BLOCKED** for the requested connection check. The source-code status mappings
described in the attachment are not a substitute for the runtime response body.

## Follow-up check — 2026-09-28T17:23:21Z

- Team/project: `leisson-creative` / `kpt-underground` (`prj_YJhnEFeOnrCoodkZ9k201ReLeGfq`)
- Deployment: `dpl_EkL3BikRbd6kH2bPQ2GSQ1PXg4Ws`
- SHA: `a524b3718565a5727d3f122682f2831922799e4d`
- URL: `https://kpt-underground-ctoozrsr1-leisson-creative.vercel.app/api/fourthwall/status`
- Method: `vercel-cli` GET; connected Vercel read-only fetch also attempted
- HTTP status: `302`
- Content-Type: `text/plain`
- Actual response body: `Redirecting...` (trailing newline in the connected fetch)
- Result: **BLOCKED**

The connected Vercel deployment lookup confirmed the exact deployment URL,
project ID, branch, SHA, and `READY` state. Both the connected fetch and Vercel
CLI `60.1.3` returned the Vercel SSO redirect above. The controlled Chrome
attempt could not start because its browser tool reported `Unable to load browser
request-header policy` on two attempts; no sign-in page was displayed for a
handoff. This is a browser-tool failure, distinct from the earlier
`ERR_BLOCKED_BY_CLIENT` observation.

No JSON response from the Fourthwall endpoint was captured. The required
`connection`, `identityPinned`, `shop.id`, and `shop.name` assertions remain
unobserved. No cookies, Authorization headers, Storefront token, temporary
access URL, or automation credentials were saved.

## Access-path review — 2026-09-29T06:54:01Z

- Fixed target: `dpl_EkL3BikRbd6kH2bPQ2GSQ1PXg4Ws`, SHA `a524b3718565a5727d3f122682f2831922799e4d`, `https://kpt-underground-ctoozrsr1-leisson-creative.vercel.app/api/fourthwall/status`.
- Previous exact GET command (recorded in the 2026-09-24 check): `vercel curl /api/fourthwall/status --deployment https://kpt-underground-ctoozrsr1-leisson-creative.vercel.app --scope leisson-creative -- --silent --include`. Its recorded check time was `2026-09-24T05:50:20Z`, workspace `C:\PROJECTS\kpt-underground`, CLI `59.19.0`, response `302 Found`, `text/plain`, body `Redirecting...`, destination host/path: Vercel SSO (the exact path was not retained). The check time is the report timestamp; a separate request timestamp was not retained.
- The 2026-09-24 follow-up used CLI `59.19.0` and returned the same `302` response. The 2026-09-28 follow-up used CLI `60.1.3` and again returned `302`, `text/plain`, `Redirecting...`; its exact GET command was not retained in these reports.
- `vercel inspect` read deployment metadata and confirmed the project, team, and Preview URL in the earlier check. It did not authenticate a GET to the protected endpoint. The ordinary connected fetch and browser attempts also did not capture endpoint JSON.
- Current CLI: `60.1.3`; `vercel whoami --scope leisson-creative` returned `gertleisson-2037`. `.vercel/project.json` is absent, so its project/team IDs cannot be checked locally. No project link was created. `VERCEL_AUTOMATION_BYPASS_SECRET` is absent from this process environment; its value was neither read nor changed.
- No locally saved endpoint JSON response was found in this workspace. The supplied server-function `200` log entries at `2026-09-24T13:54:14Z` and `2026-09-24T14:00:17Z` have no response body, Content-Type, or identified caller and cannot satisfy the connection assertions.
- No new GET was sent: the same correctly scoped and deployment-bound `vercel curl` command already returned `302` under the available CLI authentication, and this review found no changed access condition.

**Result: BLOCKED.** The concrete obstacle is Vercel Deployment Protection redirecting the authenticated CLI request to SSO before the endpoint JSON can be read. The required JSON fields remain unobserved; no application error code can be assigned.

## Resolved follow-up — 2026-09-29T07:02:28Z

- Chrome attempt to open the exact fixed URL: `ERR_BLOCKED_BY_CLIENT`.
- Vercel connector read of deployment `dpl_EkL3BikRbd6kH2bPQ2GSQ1PXg4Ws` confirmed project `prj_YJhnEFeOnrCoodkZ9k201ReLeGfq`, branch `feat/fourthwall-storefront-readonly-20260923`, SHA `a524b3718565a5727d3f122682f2831922799e4d`, and exact deployment host. Its protected-URL fetch still returned `302`, `text/plain`, and an SSO redirect; sensitive redirect parameters and cookies were not recorded.
- `vercel link --yes --team team_AM95AHo0HzxOqVMyK8uCsfKw --project prj_YJhnEFeOnrCoodkZ9k201ReLeGfq` linked this directory to the **existing** `leisson-creative/kpt-underground` project. The resulting `.vercel/project.json` was checked: `projectId` and `orgId` match the fixed IDs. No new project was created.
- `vercel link` also created `.env.local` containing only a local `VERCEL_OIDC_TOKEN` and appended `.env*` to `.gitignore`. Both incidental changes were removed after the request; the local project link remains. No token value was read into the report.
- New GET after the project link: `vercel curl /api/fourthwall/status --deployment https://kpt-underground-ctoozrsr1-leisson-creative.vercel.app --scope leisson-creative -- --silent --include` from `C:\PROJECTS\kpt-underground`, CLI `60.1.3`. This is a changed access condition from the earlier unlinked CLI attempts.
- Actual response: HTTP `200`, Content-Type `application/json`, body checked at `2026-09-29T07:02:07.468Z`:

```json
{"checkedAt":"2026-09-29T07:02:07.468Z","connection":"ok","identityPinned":true,"shop":{"id":"sh_1f2e8f65-2b29-4be9-9167-7f42314361fb","name":"KEEP IT UNDERGROUND","domain":"keepitunderground-shop","publicDomain":"keepitunderground.com"},"collections":[{"id":"col_vXBDW7HUQGOiRKmrIxU_Iw","name":"All Products","slug":"all","description":"Collection including all items on sale!"}],"products":[],"publicProductCount":0,"salesReady":false}
```

**Result: PASS.** The response is JSON with `connection === "ok"`, `identityPinned === true`, and the required `shop.id` and `shop.name`. `salesReady:false` and `publicProductCount:0` are diagnostic values and do not alter this connection result. Earlier `BLOCKED` observations remain historical entries.

Post-cleanup verification at `2026-09-29T07:03:51Z`: with `.env.local` absent and `.gitignore` restored, the same deployment-bound CLI GET again returned HTTP `200`, `application/json`, `connection:"ok"`, `identityPinned:true`, the expected shop ID/name, and `salesReady:false`. The project link alone remains in `.vercel/project.json`.

## Fourthwall readiness follow-up — 2026-09-29T07:58:30Z

- Fresh Fourthwall reads confirmed the existing SIGNAL offer `74c2ace1-4f7c-469b-a607-5555432019b4` and SUBSURFACE offer `97704a85-a6b6-4090-894f-a7b5bc71a374`; both were `PRIVATE`, available, and fulfilled by Fourthwall. Each has one 15.5 × 31.5 inch variant and three image URLs. No image quality or physical print quality was assessed here.
- SUBSURFACE's stored description was the short text beginning “Minimalist desk mat featuring…”. The earlier user-supplied approved English description beginning “A different perspective for your everyday workspace.” was saved to the same offer ID and re-read from Fourthwall. The new description includes dimensions, one-mat contents, and the digital-mockup caveat. Its ID, name, slug, `PRIVATE` status, variant, price field, and image URLs were unchanged in the returned offer.
- Payout status remained `INACTIVE` in Fourthwall's payout-info response. The logged-in dashboard's Billing and payouts page showed “Set up your payouts” and a `$0.00` profit balance. The Stripe onboarding, bank, and identity fields were left for the account owner in the open browser tab.
- Sample-credit balance and balance-with-incentive were both `null`. The sample checkout UI showed `$0.00` credit left after order; no positive usable credit was confirmed.
- Two sample checkout sessions were opened for **quotes only**. Before a shipping address, one SIGNAL showed a `$13.00` product subtotal, `$0.69` payment-processing fee, and `$13.69` provisional total. One SIGNAL plus one SUBSURFACE showed a `$26.00` subtotal, `$1.08` fee, and `$27.08` provisional total. Both checkout pages explicitly required a shipping address to show delivery options. Shipping, tax, and final payable totals remain **UNVERIFIED**. No order was completed and no payment or sample credit was used.
- The two sample checkout pages and the payout settings page were left open for owner input. The 34 USD retail target remains a target; no public price or visibility was changed.

## Owner-input verification — 2026-09-29T08:14:09Z

- Fresh Fourthwall payout-info response: `ACTIVE`, owner `CUSTOM`, shop ID `sh_1f2e8f65-2b29-4be9-9167-7f42314361fb`, connected at `2026-09-29T08:06:08.022561Z`. After a dashboard reload, Billing and payouts also showed “Payouts go to connected bank account” and “Connected”. No bank or identity details were copied into this report.
- The owner entered a shipping address in the two-item sample checkout. For a comparable quote, the same name, address line, postal code, and city were copied within the Fourthwall checkout UI to the one-item session. The address itself is not recorded here. Both displayed Estonia and Standard delivery, estimated October 9–19.
- One SIGNAL sample: product subtotal `$13.00`, Standard shipping `$22.89`, VAT `$8.61`, customs duties `$3.41`, payment-processing fee `$1.73`, **checkout total `$49.64` USD**.
- One SIGNAL plus one SUBSURFACE sample: product subtotal `$26.00`, Standard shipping `$31.29`, VAT `$13.75`, customs duties `$6.82`, payment-processing fee `$2.63`, **checkout total `$80.49` USD**.
- The two-item quote is `$30.85` above the one-item quote. These are live checkout quotes for the address and delivery method shown, subject to change until an order is completed. The checkout pages remained at the `Complete order` step; this run did not submit an order, make a payment, or spend sample credit.

## Authorized sample-order pre-payment check — 2026-10-01T08:14:50Z

- Authorization: one SIGNAL and one SUBSURFACE sample, the previously confirmed Estonia address, Standard delivery, maximum total **80.49 USD**. This authorization applies only to this single sample order.
- Duplicate check: a fresh Fourthwall `get_orders` read filtered by the two authorized offer IDs returned no matching orders. No paid duplicate was observed in that response.
- Fresh offer reads confirmed SIGNAL `74c2ace1-4f7c-469b-a607-5555432019b4`, variant `b28b8e38-0bd5-4303-8641-7aed66648b45`, and SUBSURFACE `97704a85-a6b6-4090-894f-a7b5bc71a374`, variant `d479a574-d42e-4767-9725-f940ce0e165c`. Both remained `PRIVATE`.
- Chrome reopened the existing two-sample checkout `ch_UvuaYXwNSIakvDOieIFRJQ`. Its packshots visually matched the dark SIGNAL / 01 and light SUBSURFACE / 02 designs. Each row showed quantity one and the 15.5 x 31.5 inch variant. The sample-cost checkout retained a **13.00 USD** unit price for each, with no extra items or paid additions.
- The same checkout retained the previously owner-entered Estonia recipient/address fields; the address line used ASCII transliteration of the earlier accented spelling. Name, location, postal code, and city corresponded to the prior confirmed checkout. No address field was edited or replaced. Address and contact values are not saved in this report.
- Standard delivery was already selected, estimated October 12-19. Current totals: product subtotal **26.00 USD**, shipping **31.45 USD**, VAT **13.79 USD**, customs duties **6.80 USD**, payment-processing fees **2.63 USD**, **final checkout total 80.67 USD**. Credit left after order showed 0.00 USD.
- Compared with the September 29 quote: shipping +0.16 USD, VAT +0.04 USD, customs duties -0.02 USD; total **+0.18 USD**. The currency remains USD.

**Result: BLOCKED before payment — the 80.67 USD checkout total exceeds the authorized 80.49 USD limit by 0.18 USD.** `Complete order` was clicked **zero times**. No order was submitted, no payment or sample credit was used, and no order ID or paid status can be reported for this run. The checkout also displayed empty card-entry fields; no payment data was entered or saved. The same checkout was left open for owner follow-up.

No products, prices, visibility, deployments, environment settings, or other orders were changed. Both products remain Private. No sample order is counted as a customer sale. All earlier report entries remain unchanged.


## Commerce design preview check — 2026-10-01T23:00Z (2026-10-02 Tallinn)

- Scope: protected design Preview of the two-desk-mat store. Not a sale, checkout, order or payment.
- Repository `LEISSON-DARKSSON/kpt-underground`, base `99d2241` (main, verified fresh), branch `feat/commerce-design-parity-20261002`, head `e7c7f69009ccb7c0978e06410cd647b31ec90b39`. Work done in a separate git worktree; the owner's checkout and untracked files were not modified.
- Vercel `leisson-creative` / `kpt-underground`: deployment `dpl_BYQ3sbxRCWo17TBMqJwT6Xn2GANd`, target **preview**, READY, same SHA. URL `https://kpt-underground-5iqbh90k6-leisson-creative.vercel.app` — unauthenticated request returns 302 to Vercel SSO (protection intact).
- Routes: `/commerce-preview` (bundled HTML prototype, strict CSP) and `/commerce-preview/shop`, `/shop/signal-01`, `/shop/subsurface-02`, `/shop/handoff` (React port in the existing app). `src/proxy.ts` returns 404 outside Vercel Preview / `next dev`.
- Production: `keepitunderground.com/commerce-preview` and `/commerce-preview/shop` = **404**; homepage 200 and unchanged.

| Check | Result |
|---|---|
| typecheck / next build | PASS / PASS |
| eslint, new commerce code | PASS |
| eslint, whole repo | **FAIL** — 12 pre-existing errors in public components (not changed here). `next lint` no longer exists in Next 16; script now `eslint .` |
| Guard tests `npm run test:commerce-preview` | PASS 22/22 |
| Hosted prototype QA (1440/768/390/320, reduced motion) | PASS 124/124 |
| Hosted React QA (same widths, cart, Tab/Escape/focus, handoff, no requests) | PASS 162/162 |
| Source fonts (Bebas Neue, Space Mono 400/700) | PASS — earlier offline BLOCKED font checks now verified on the hosted Preview |
| Fourthwall theme draft | **BLOCKED** — only live theme "Clean Frame" (colors #000/#FFF), no isolated draft; nothing saved |

Defects found by QA and fixed on the branch: Tailwind margin/padding utilities are dead site-wide because of the unlayered reset in `globals.css` (commerce uses a scoped CSS module; public reset unchanged); page-level `notFound()` streamed HTTP 200 because of root `loading.tsx` (hard 404 in proxy); 320 px cart price covered Remove.

Products read in Fourthwall admin (read-only): SIGNAL `74c2ace1…` **Private**, SUBSURFACE `97704a85…` **Private**, 0 sold; shop front shows "Coming soon". 34 USD remains a planned price, not applied.

No Fourthwall products, prices, print files, visibility, theme, shop status, orders, payments, credit, DNS, Production settings or `main` were changed. No checkout session was created. No credentials were saved. Evidence: `evidence/2026-10-02-commerce-preview/` (screenshots, `hosted-qa.json`, `react-qa.json`, `live-baseline.json`, report backups). All earlier report entries remain unchanged.


## Wave 02 products + reset-fix PR — 2026-10-01T23:32:24.016Z

Created in Fourthwall admin as **Hidden** (not published; shop still Coming soon). Test prices applied as requested. Desk mats unchanged (both Private).

| Product | Offer ID | Status | Price | Base |
|---|---|---|---:|---|
| SIGNAL - Studio Tote | `11c30deb-6d02-4590-82e6-83061fc4b21d` | Hidden | 29 USD | BagBase W101 Black, front DTFx |
| PROJECT NOTES - SIGNAL / 01 | `bad5cb61-ad27-4e4b-94a1-5bd769f19ab8` | Hidden | 24 USD | Spoke SP40004 graph |
| PROJECT NOTES - SUBSURFACE / 02 | `05b191f6-6d4a-474f-ac87-1c9e2edb5894` | Hidden | 24 USD | Spoke SP40004 graph |
| OBJECT STUDIES - Six Marks | `185ce494-67e8-43ff-ac2c-f80186196ebd` | Hidden | 12 USD | Allcolor 5495 |
| WALL STUDIES - SIGNAL / 01 | `04de8f0f-7b3e-430b-82b2-ca9448f82c77` | Hidden | 29 USD | Allcolor P001, 18x24 only |
| WALL STUDIES - SUBSURFACE / 02 | — | **BLOCKED** | — | artwork upload refused by session permission check |

Variant IDs: NOT_RUN (not shown in admin UI). Notebook covers: canvas set to the art's edge colour so the 6x8 art fills the 6.03x8.45 template without white bands. Sticker sheet: six stickers composited at the placement-proof positions (not a supplier-approved cut template). No orders, payments, publishing, theme or shop-status changes.

Reset fix: draft PR #2 (`489b6ad`, Preview `dpl_Eiy9pcQnvuWBnz3nUmPhpQvMachK`) moves the global reset into `@layer base`; visual diff of 8 public routes in `evidence/2026-10-02-reset-fix-visual-diff/` (e.g. /story +2698 px at 1440 — collapsed sections regain their declared spacing). Commerce preview: draft PR #3. Nothing merged. Earlier entries unchanged.


## Live store release — 2026-10-02

- PR #4 `feat/live-store-20261002` (b827061 + db423ec) merged to main as 8ffa67d; Production deploy dpl_62SZj23cz3Nf7qyNS3ys46Lw82vK READY.
- Gates: eslint 0 errors (1 pre-existing warning), tsc PASS, test:store 7/7, test:commerce-preview 22/22, next build PASS.
- Fourthwall: all 7 products set Public; desk mats repriced 16 → 34 USD; shop status Coming soon → Live.
- Storefront probe: 7 PUBLIC products; POST carts 200; hosted checkout page 200.
- Preview QA 23/24 (only FAIL: desk-mat sort, fixed in db423ec).
- Production QA 24/24 on https://keepitunderground.com.
- Real Chrome: keepitunderground.com cart → Checkout → keepitunderground-shop.fourthwall.com/checkout/ch_… (page reached; nothing filled, no order, no payment). Headless Chrome gets 403 on the checkout page (bot protection), so it is not a product defect.
- Artists, /checkout and /confirmation removed; they redirect to /shop.
- BLOCKED (unchanged): SUBSURFACE wall poster — upload denied by the permission classifier; not retried.
- Evidence: evidence/2026-10-02-live-store/{preview,production}.


## Wave03 products — 2026-10-02

Owner decision (one consolidated question): 3 reconstructions as-is (TRANSIT SIGNAL, TRANSIT SUBSURFACE, OFFLINE), NIGHT SHIFT + FIELD motif redrawn to match the contact sheet; prices 24/29/39/39/29; Hidden -> Private immediately; also add WALL STUDIES SUBSURFACE / 02.

| Product | Offer ID | Base / cost USD | Price USD | Visibility | Verification |
|---|---|---|---:|---|---|
| WALL STUDIES - SUBSURFACE / 02 | c0d71bed-0a9e-4e80-8518-061cdb58ac8b | Allcolor P001 Enhanced Matte Paper Poster 18x24 / 13 | 29 | PRIVATE | PASS (admin status + saved price re-read) |
| TRANSIT - SIGNAL Laptop Sleeve | 5551ad84-b3c5-4af9-bc6a-05de2349de57 | Allcolor LS0042 Laptop Sleeve 13in (15in removed) / 21.16 | 39 | PRIVATE | PASS (admin status + saved price re-read) |
| TRANSIT - SUBSURFACE Laptop Sleeve | c802ed05-237f-4eda-9e10-416640f92907 | Allcolor LS0042 Laptop Sleeve 13in (15in removed) / 21.16 | 39 | PRIVATE | PASS (admin status + saved price re-read) |
| NIGHT SHIFT - Studio Mug | 2b546ac7-c52a-48be-9a8e-7a3f27eb7e0c | Mugz WGM79B Black Glossy Mug 11oz (15oz removed) / 8.95 | 24 | PRIVATE | PASS (admin status + saved price re-read) |
| FIELD / 03 - Water Bottle | c61e4fb7-7796-4aa3-be8d-132ebc51dd86 | Spoke H2Go Bolt BP20033 710ml, UV print, ships from US / 13.45 | 29 | PRIVATE | PASS (admin status + saved price re-read) |
| OFFLINE - Embroidered Beanie | ee17a091-6316-4c50-ae07-a955af9583da | Yupoong 1501KC Cuffed Beanie Black / 13.79 | 29 | PRIVATE | PASS (admin status + saved price re-read) |

- Storefront probe after creation: 7 PUBLIC products unchanged; none of the 6 new products leaked.
- No orders, payments, samples or paid digitising.
- Sample/physical quality: NOT_RUN. Supplier mockups only.
- Evidence: evidence/2026-10-02-wave03-uploads (upload PNGs, v2 SVGs, manifest), evidence/2026-10-02-wave03-gallery (gallery QA 4 widths).

## Wave03 publish — 2026-10-02 04:30
- Owner command: "Tee poster, kruus ja pudel Public." Done: WALL STUDIES - SUBSURFACE / 02 (c0d71bed), NIGHT SHIFT - Studio Mug (2b546ac7), FIELD / 03 - Water Bottle (c61e4fb7) -> PUBLIC.
- Storefront API: 10 PUBLIC; slugs answer PUBLIC/AVAILABLE at 29/24/29 USD.
- keepitunderground.com: /shop shows 10 cards; 3 PDPs 200 with correct prices + images; cart -> /api/cart/checkout 200 -> hosted checkout redirect (no payment).
- Observed: for ~1-2 min after publishing, PDP works but checkout returned 400 (catalog cache 60 s). Self-healed.
- Still PRIVATE pending owner sample: OFFLINE beanie, TRANSIT SIGNAL + SUBSURFACE sleeves.

## Checkout fresh-catalog fallback - 2026-10-02
- PR #6 merged (e15e229), Production dpl_681aE2irZTXxG5n5SPKt35JdMuDV READY.
- Checkout re-reads the catalog once (no-store) only on UNKNOWN_VARIANT/VARIANT_UNAVAILABLE; test:store 9/9.
- Live re-check: /shop 10 cards, 3 new PDPs 200, checkout 200 -> hosted checkout redirect (no payment).


## Wave03 full publish - 2026-10-02 04:45
- Owner: 'koik korras ja avalda'. OFFLINE beanie (ee17a091), TRANSIT SIGNAL (5551ad84), TRANSIT SUBSURFACE (c802ed05) -> PUBLIC. Owner proceeded without the recommended physical sample.
- keepitunderground.com /shop: 13 products. New PDPs 200 at 39/39/29 USD.
- Checkout on the just-published beanie returned 200 + hosted redirect immediately (PR #6 fresh-catalog fallback confirmed live). No payment.



## Wave 04 — product creation (2026-10-02)

Scope chosen by owner: 9 makeable products, Private first, review before publishing. Artwork: `evidence/2026-10-02-wave04-art/`.

| Product | Offer ID | Price | Margin | Status | Verification |
|---|---|---|---|---|---|
| KPT - Premium Hoodie (Cotton Heritage M2580) | caf3e2ed-8b80-4b29-bd94-46427a9fef39 | $59 | $25.76 | Private | PASS (admin list) |
| KPT - Heavyweight Tee | 6c250dd6-5ebd-4a75-a9a5-d1bc584f177f | $35 | $13.60 | Private | PASS |
| KPT - Crewneck | 9b4af8fc-347b-4e56-8808-2aacea619a32 | $49 | $25.27 | Private | PASS |
| KPT - Studio Tumbler | 37293c60-4496-4825-b359-356b5347902a | $39 | $19.05 | Private | PASS |
| CONTROL - Mouse Pad | f3e519ab-7b12-496b-959e-6aae2ef0f7eb | $19 | $9.87 | Private | PASS |
| KPT - Crew Socks | b37366cd-aa48-49d7-b20e-dedb8a0872c1 | $19 | $9.05 | Private | PASS (low-res warning accepted) |
| KPT - Beanie (Yupoong 1501KC, embroidery) | 99cdfeba-2da7-46fe-ae2c-1d742fdc4c2a | $29 | $15.21 | Private | PASS |
| Backpack (Sublicolor 601A) | — | $69 | — | — | BLOCKED: Printful embedded designer (cross-origin iframe) |
| Phone case (Allcolor 057) | — | $29 | — | — | BLOCKED: Printful embedded designer (cross-origin iframe) |

- Admin Products list: 20 products, 7 new Private, 13 Public unchanged.
- Storefront probe: 13 public, none of the Wave 04 products exposed; cart create 200, checkout page 200.
- Physical/sample quality: NOT_RUN.

### Wave 04 — published (2026-10-02, on owner's explicit command "teha kõik 7 toodet korraga Public")

- All 7 switched Private → Public in admin; each status re-read after Save (PASS).
- Storefront per-slug probe: 7/7 PUBLIC, AVAILABLE, prices $59/$35/$49/$39/$19/$19/$29 (XL+ sizes carry Fourthwall size upcharge).
- Collection: 20 public. keepitunderground.com /shop: 20 cards after ISR refresh; all 7 product pages 200; site checkout API 200.
- Hosted checkout: cart with kpt-beanie 200, checkout page 200. No order placed.
- QA tooling: `fw-pages.mjs` (paginated collection read, unit-tested in `fw-pages.test.mjs`), `fw-slug-probe.mjs` now reads `SLUGS`, `qa-wave03-live.mjs` reads `OUT`.
- Still BLOCKED: backpack, phone case (Printful embedded designer).

### Wave 04 — phone case unblocked (2026-10-02)

- KPT - MagSafe Tough Case (Allcolor 057, Matte), offer 83986574-4480-4619-8e71-2d61f4ef1bbc, $29, margin $13.05, Private.
- Route: Printful embedded designer's file input is unreachable by automation (cross-origin iframe; desktop control cannot operate Chrome or the Claude app). The owner picks the file in the native dialog; Claude does placement and listing.
- Placement: background fill Black, image W4-PHONE-CASE.png scaled to 3.40 x 6.80 units and centred so KPT, the orbit and the base text sit inside the safe print area (517 DPI "Good").
- Backpack (Sublicolor 601A): designer open, waiting for owner to pick W4-BACKPACK.png.

### Wave 04 — backpack unblocked (2026-10-02)

- KPT - Minimalist Backpack (Sublicolor 601A), offer 22aeebe6-04db-4468-9b37-f078eb90267b, $69, margin $35.05, Private.
- Placement: background #0B0C0C applied to all placements (front, top, bottom panels) so the artwork edge is seamless; W4-BACKPACK.png scaled to 11.4 units wide and centred inside the safe print area; black stitches.
- Colour picker tip: open the custom swatch, then use the keyboard only (Tab / Shift+Tab between R, G, B, Enter to confirm). Any mouse click inside the picker closes it and picks the swatch underneath; Escape reverts.
- Admin list: 22 products, backpack + phone case Private. Wave 04 now 9/9 created; 7 Public, 2 Private.

### Wave 04 — backpack + phone case published (2026-10-02, owner command "Tee seljakott ja telefoniümbris Public")

- Both switched Private → Public; title row re-read shows Public + shop URL (PASS).
- Slug probe: kpt-minimalist-backpack PUBLIC $69 (1 variant); kpt-magsafe-tough-case PUBLIC $29 (18 iPhone models).
- Collection: 22 public. keepitunderground.com /shop: 22 cards; both product pages 200; site checkout API 200.
- Hosted checkout: cart (newest product = backpack) 200, checkout page 200. No order placed.
- Wave 04 complete: 9/9 products Public.


### Shop buyability KPT-00..17 (2026-10-02, strategy handoff 20261002)

- Branch feat/shop-buyability-20261002 @ be5b569, PR #8 (open, NOT merged). Vercel Preview dpl_141taFkDBQhVxSn4sEhVfWVztbBD (READY at 332a23f; preview build for be5b569 pending).
- No products, prices, visibility, orders, payments, DNS or Vercel settings changed. One Fourthwall cart per QA run (no order).
- Evidence: evidence/2026-10-02-kpt00-baseline (read-only catalog snapshot), evidence/2026-10-02-kpt-preview/local-real (real-data browser QA + screenshots).
- Gates: test:store 33/33, test:http 13/13 (mock Fourthwall, real HTTP), browser-qa 12/12 (local mock), real-data local QA 9/9, typecheck, lint, build PASS.
- KPT-00: PASS - main febac3d = prod dpl_FFnnW693 (docs-only on top of audit SHA e15e229); no open PRs; 22 public offers / 55 variants (read-only snapshot); baseline test:store, test:commerce-preview, test:docs, typecheck, lint, build all PASS
- KPT-01: PASS - no preselected size/model; grouped 18-model select; 4XL tee = $41 in buy box + cart (unit, local browser, real-data local build)
- KPT-02: PARTIAL - Fourthwall SIZE_AND_FIT/MORE_DETAILS/RETURNS rendered at the choice; tee/hoodie/crewneck have NO size data in Fourthwall -> honest 'size chart not published' notice; owner must add supplier size charts; no inch/cm toggle
- KPT-03: PASS - unknown slug 404 (prod today 200 = soft 404), upstream 500/429/bad JSON/timeout -> 5xx + retry; listed slug never 404 (cross-check); real HTTP via test:http + real-data run
- KPT-04: PASS - fail-closed currency/visibility/stock, malformed catalog != empty, origin 403, qty>10 refused, 409 PRICE_CHANGED before cart, 413 cap; test:http 13/13
- KPT-05: PASS - /help + footer links to live Fourthwall Returns/Terms/Privacy/Contact (all 200); trust lines at buy button; no unproven promises (content gate test)
- KPT-06: PASS - All 22 / Desk&Studio 9 / Wear 6 / Carry 5 / Wall Art 2, URL state, Back restore, search + price sort, 6 Studio picks; real data 22 cards
- KPT-07: PARTIAL - type + decisive attribute, short name, whole image (object-contain); apparel back print not surfaced (back image cannot be identified from API data)
- KPT-08: PASS - one selection drives gallery/price/cart; iPhone 15 Pro shows its own 2 images (real data); 8 thumbs + more
- KPT-09: PARTIAL - dataLayer adapter + schema, no purchase in browser, PII scrub, view_item_list once; BLOCKED on owner choosing the analytics tool/consent; purchase source (Fourthwall integration) not configured
- KPT-10: NOT_RUN - needs Fourthwall cost/quote data; no prices touched
- KPT-11: NOT_RUN - Signal claims need owner confirmation of what actually exists
- KPT-12: PARTIAL - Product/Offer|AggregateOffer JSON-LD, canonical, sitemap 22, robots; Rich Results Test + Search Console resubmit need production
- KPT-13: PARTIAL - intro loader removed from buy path (was 2.8s+0.8s overlay on every page; stuck without JS); no overflow 320-1440, fonts loaded; CWV lab medians NOT_RUN; product pages are no-store in prod too (follow-up)
- KPT-14: PASS - storage shape validation, 21st item refused w/o eviction, price reconcile, pending lock, bfcache, cart kept after redirect
- KPT-15: BLOCKED - Vercel Preview dpl_141taFkD READY but Preview has no Storefront token for this branch (token scoped to an old branch) -> preview cannot read the catalog; same SHA verified locally against real Fourthwall (9/9); production needs separate release approval
- KPT-16: NOT_RUN - commercial test starts after release
- KPT-17: NOT_RUN - monitoring not activated without owner order
- Found live: production answers HTTP 200 for unknown product URLs (soft 404); fixed on the branch.
- Machine note: NODE_ENV=production is set globally here; use `npm ci --include=dev` in worktrees.


### Release: shop buyability (2026-10-02, owner approval "Annan release loa")

- Preview token now set for all Preview branches (vercel env ls: FOURTHWALL_STOREFRONT_TOKEN, Preview). PR #8 preview redeployed dpl_CUcHvnUkADt6QLeSP87g5eqio5bv @ be5b569 -> real-data QA 9/9.
- PR #8 merged (merge commit b598a17). Production dpl_4vmmdwFZfihpnNrYtyFsfQrjaVmJ, aliases keepitunderground.com -> b598a17.
- Live checks on keepitunderground.com: 9/9 PASS (unknown product 404, sitemap 22, 22 product pages 200 + JSON-LD, /shop 22 cards + real images at 390/1440, categories 9/6/5/2, tee 4XL $41 to cart, checkout API 200 -> hosted link intercepted, no order; phone model images; help + 4 policy pages 200).
- Catalog before/after release identical (22 offers, 55 variants, ids, visibility, prices).
- /story heading fix: PR #9 (af5cd48) - CharReveal wrapped inside words; preview dpl_7nnHZfToNDMz7ZULPzpy33Skgtnj headings QA 4/4 PASS (320/390/768/1440, real Chrome). NOT merged: merge blocked by permission check, needs owner merge.
- execution-record.json: an earlier full re-serialization turned 9 values like 13.00 into 13; restored verbatim from the wave02 backup. Keys written after that backup could not be checked.


### KPT-13 lab + KPT-11 review (2026-10-02)

- Lighthouse lab on production (mobile preset, median of 3): / LCP 4711 ms score 83; /shop LCP 5016 ms score 81; tee LCP 3018 ms score 94; desk mat LCP 3903 ms score 85; CLS 0 everywhere; TBT <= 39 ms. Lab only; INP not measurable in lab. Evidence: evidence/2026-10-02-kpt13-lab.
- Root cause /shop: header text inside ScrollReveal (.reveal opacity 0 until hydration) was the LCP element. PR #10 (cb078ec) renders it directly: local A/B on real catalog LCP 5116 -> 2957 ms, CLS 0. Not merged.
- Home LCP is dominated by the 2.8 s brand loader: owner decision.
- KPT-11 Signal: page promises members-only access, closed events, "First 20 ... early access to SS-2025 collection" and "Prototype Field Jacket - 12 units, Signal Network only"; the gate is a client-side code compare. Not changed: needs owner confirmation.
- PR #9 (/story heading fix) still awaiting owner merge.


### Release 2: PR #9 + PR #10 (2026-10-02, owner order "Merge'i PR #9 ja PR #10")

- PR #9 merged eecd040, PR #10 merged db7b1ec. Gates on merged main: test:store, test:docs, typecheck, lint, build PASS.
- Production dpl_DUirrQBt2K7qGDh7FP1B5rLx92wY, alias keepitunderground.com -> db7b1ec (get_deployment).
- Live headings (/, /story, /signal; 320/390/768/1440, real Chrome): 4/4 PASS, 16 words, no split, no overflow. Evidence: evidence/2026-10-02-release2.
- Live shop checks: 9/9 PASS (404, sitemap 22, 22 pages 200, cards/images/categories, tee 4XL $41, checkout link intercepted - no order, phone model, help + policies).
- Lighthouse lab on production after release (median of 3): / LCP 4872 ms; /shop LCP 4441 ms (was 5016); tee 3553 ms (was 3018); desk mat 3223 ms (was 3903); CLS 0 everywhere. Run-to-run spread on unchanged pages is about +-500 ms, so the production /shop gain is modest; the controlled local A/B (same machine, same data) showed 5116 -> 2957 ms.
- Remaining /shop LCP is render delay (~3.8 s of 4.4 s, TTFB ~0.6 s simulated) on the intro text, not image loading; next candidates: font/critical-CSS chain and 174 KB JS. Not started.


### Home UX audit actions 1-5 (2026-10-02, ProUXAudit rpt_IR52mxnTjDN7tBGir5WiUXk3l1INbeiu, 76/100)

- PR #11 (817a0a0), branch ux/home-audit-20261002. Not merged (needs owner).
- H1: two H1s ("KEEP IT", "UNDERGROUND") -> one H1 "Desk mats, notebooks, prints and wear for the people who build, work and create."; wordmark kept as visual (aria-hidden).
- One hero CTA "SHOP THE OBJECTS"; story link removed from hero (still in nav). Nav HOME removed (logo links home).
- Proof under CTA from live data: 22 OBJECTS FROM $12 - MADE TO ORDER / QUALITY GUARANTEE - MISPRINTS REPLACED OR REFUNDED / SECURE CHECKOUT - HOSTED BY FOURTHWALL.
- Title/meta name the audience. Decorative hero labels moved to section edge.
- Preview dpl_FTZEYCxNFMozeQ75geMkJAZainDP (real catalog, real Chrome): home 4/4 PASS (320/390/768/1440: 1 H1, 1 hero link, proof < 80 px under CTA, unobstructed, no overflow), headings 4/4, shop 9/9.
- The audit JSON plan URL is disallowed by prouxaudit.com robots.txt for the fetch tool; the 5 markdown actions were used as acceptance criteria.


### Home UX release (2026-10-02, owner order "merge PR #11")

- PR #11 merged c353c6d (CI green: Vercel, GitGuardian). Production dpl_9pTCoDkDwbGFPRdaoqPxkTZ14XYR, alias keepitunderground.com -> c353c6d.
- Live: home 4/4 PASS (320/390/768/1440: one H1 "Desk mats, notebooks, prints and wear for the people who build, work and create.", one hero link, proof "22 OBJECTS FROM $12 / QUALITY GUARANTEE / SECURE CHECKOUT" under the CTA, unobstructed, no overflow, no HOME in nav); headings 4/4; shop 9/9 (one Fourthwall cart, no order). Evidence: evidence/2026-10-02-home-ux/live.
- Next: re-run ProUXAudit on https://keepitunderground.com/ to compare with 76/100.


### H-step: non-blocking home, real object in hero, sourced tee chart (2026-10-02, branch feat/home-nonblocking-fit-20261002, draft PR #12)

- Baseline H00: main = Production = c353c6d (dpl_9pTCoDkDwbGFPRdaoqPxkTZ14XYR, alias keepitunderground.com). 22 public offers, 55 variants (evidence/h00-20261002). Open PRs before: none. Owner's untracked files untouched.
- Code SHA a0091abcbc1e8f9a3bbef33080479cd9b56a905b (commits b010538 code, 2d3b751 prep docs, a0091ab e2e). Code ready: yes. Preview dpl_Bt5WFnWyfJCLA776pvUoS9rugfwP READY, githubCommitSha == a0091ab, target null (protected; share link not stored).
- H01 PASS (Preview): intro is a 2 px pointer-transparent aria-hidden line, none under reduced motion; CTA click reaches /shop in ~55-68 ms (production today ~3.5 s); no overlay at DOMContentLoaded, no-JS, back navigation.
- H02 PASS (Preview, 320/390/768/1440 + 200% zoom equivalents): one H1, one tab stop in hero, real Fourthwall desk mat image in a 3:2 window (mat bbox inside the crop), caption name+price+Digital visualisation, STUDIO PICKS with 6 object-contain cards, manifesto after picks, fonts loaded. At 320x700 the CTA is below the first screen (INFO); at 390x844+ it is above.
- H04 PASS for the tee: chart from the Comfort Colors 1717 spec sheet, every cell tested; garment vs body columns separate; sleeve definition = manufacturer's center-back (shop page wording differs, documented). Hoodie and crewneck: still not published (no model-verified source). Phone case: stale "select model at checkout" sentence hidden in presentation only; Fourthwall listing text unchanged.
- Gates: test:store 92/92, test:docs 9/9, typecheck, lint, build PASS; test:http 13/13; repo browser-qa 18/18; Preview buyability 9/9, headings 4/4, home regression 4/4, H01/H02/H04 63 PASS 0 FAIL. test:http/browser-qa needed a Node 25 Windows path fix (fileURLToPath) in tests/e2e.
- Prep only (NOT_RUN / BLOCKED): H03 claim register (119 claims, 36 owner decisions; Signal gate is client-side and its code 140HZ is public), H05 measurement plan (nothing collected), H06 economics BLOCKED_MISSING_INPUTS (only 34 USD retail and 13 USD unit price recorded), H07 asset manifest + 6 DRAFT_NOT_APPROVED pieces. No Production, collector, purchase or order. Lab LCP before/after NOT_RUN.
- Catalog unchanged (re-snapshot 2026-10-02T10:39Z vs H00 09:54Z): 22 offers, 55 variants, ids/access/state/prices/stock identical (evidence/h-preview-20261002/catalog-after).
- Mobile trade-off (owner release decision): production c353c6d has the CTA above the first screen at 390x844 (CTA 490, proof 586-791) and 320x700 (CTA 543). Preview a0091ab puts the product picture first: at 390x844 the CTA is at 783-839 (just above the fold) with proof 879-1084 below it, at 320x700 the CTA is at 807 (below the fold). Desktop/tablet (768+) keep CTA and picture above the fold. Gain: the real object is visible without scrolling; cost: the CTA moves down on small phones.
- Note: the home regression 4/4 (qa-home.mjs) passed after the script was changed to scroll the proof into view before hit-testing, because the proof now sits lower. Lab LCP before/after NOT_RUN; the hero image is likely the LCP element and downloads the full-size render (no srcset): follow-up candidate.
- Evidence: evidence/h-preview-20261002 and evidence/h00-20261002.


### PR #12 fix round (2026-10-02, branch feat/home-nonblocking-fit-20261002, draft PR #12, input: REVIEW.et.md REQUEST CHANGES)

- State checked first: main = Production = c353c6d, PR head was a0091ab, Preview dpl_Bt5WFnWyfJCLA776pvUoS9rugfwP unchanged; tree clean; no other open PRs.
- New SHA 22f28c31daf24a79ca99b9fbe3fd9301cae1a7a2 (commits cea18b1 hero, 22f28c3 rest). Preview dpl_6JU76CjD1h4zSRYFtVvjpuUA14Ek READY, githubCommitSha == 22f28c3, target null (protected; share link not stored). Pushed to the feature branch only; no merge, no Production, no DNS, no account change.
- R1 mobile hero: PASS (Preview, real Chrome). Order offer -> CTA -> proof -> object below 768 px. At scrollY=0 before any scroll/click the CTA is fully inside the first view and uncovered at 320x700 (CTA 384-440), 390x844 (379-435), 768x1024 (493-549), 1440x900 (645-701); negative control (CTA pushed down) correctly fails the same check. Touch target 261x56. Type kept (H1 >= 26 px). The product picture is only PARTLY in the first view at 320x700 and 390x844 (frame starts at 685/680) and fully visible from 768 px. No fixed hero height; 200% (720x450, 640x400 at DPR2) and 400% reflow (320 px) PASS.
- R2 image delivery: PASS functionally. Hero uses next/image: real srcset (256..3840w), currentSrc /_next/image?...&w=640 at DPR1-2 and w=1080 at DPR3 (390 px), upstream imgproxy.fourthwall.dev, signed URL untouched. Bytes: 26 KB (w=640) / 68 KB (w=1080) vs 133 KB for the unoptimized signed original. Owner note: this routes the picture through Vercel Image Optimization (usage/quota applies to the Vercel plan).
- Lab LCP (home, Lighthouse 12 mobile preset, simulated throttling, median of 3, local next start + real catalog, same protocol for all three, evidence/h-pr12-fix-20261002/lab): c353c6d (production) 2644 ms (LCP element = H1); a0091ab 4643 ms (hero image); 22f28c3 4302 ms (hero image; runs 5100/4302/3579, first run is an optimizer cache miss). Observed unthrottled LCP: 75 / 218 / 198 ms. CLS 0 and TBT 17/33/34 ms. Reading: the loader removal does not change LCP (LCP counts paint, not visibility); making the product picture the largest element costs about 1.7 s in the simulated lab; srcset gave about 0.3 s of it back. No field data. The 55-68 ms CTA click is click latency, not LCP.
- R3 tests: qa-home-pr12.mjs (new): CTA aboveFold checked at scrollY=0 before any click/scrollIntoView with a negative control; proof reported as proofVisibleAtLoad and proofUsableAfterScroll separately; qa-home.mjs restored to the original no-scroll requirement plus the separate after-scroll check (proof gap 20 px mobile / 40 px wider, visible at load at all four widths). No-JS, reduced motion, keyboard (one tab stop, visible ring, not covered when focused), back-nav, 320/390/768/1440, zoom, screenshots in evidence/h-pr12-fix-20261002.
- Gates actually run on this SHA: test:store 124/124, test:docs 12/12, typecheck, lint, local real-data build + buyability 9/9 + qa-home-pr12 78 PASS 0 FAIL, test:http 13/13, repo browser-qa 18/18. Preview: buyability 9/9, headings PASS, qa-home PASS 4/4, qa-home-pr12 78 PASS 0 FAIL 14 INFO. NOT_RUN: tests/fourthwall/storefront.test.mjs (needs FOURTHWALL_TEST_TOKEN), test:commerce-preview, CLAUDE.md lines for the new analytics modules (left out to keep the verified SHA).
- H04: identity confirmed by the offer->catalog join (hoodie pro_380 Cotton Heritage M2580, crewneck pro_c49cab91050c41dd96 M2480, desk mats Allcolor SP70018). Crewneck now has a sourced chart (18 cells equal across manufacturer sheet, Fourthwall catalog and shop page; measuring wording is Fourthwall's; sleeve method not equated with the tee's). Hoodie still "not published": 2XL width 26.0 (Fourthwall) vs 26.5 (manufacturer mirror) is OPEN, not averaged; draft support question NOT_SENT (docs/fit-hoodie-2xl-conflict.md).
- H06: 13 USD = OBSERVED catalog base (counted once); 2.9% + 0.30 USD and 0% extra physical markup = PUBLIC_STANDARD; plan Free OBSERVED. Customization quote amount, US shipping, tax, actual payment fee, net payout, reserve stay unknown (actual contribution BLOCKED_MISSING_INPUTS, 29 inputs); planning scenario is separate and labelled PLANNING_ONLY.
- H05: event allowlist (EVENT_SCHEMA), hero_shop_click, checkout_redirect with items/quantity only (no URL), disabled collector plan (owner activation + G- id + granted consent; imported nowhere), cross-domain checklist XD01-XD10 all NOT_RUN. Nothing collects; no purchase from the site.
- H03: /signal open studio-journal proposal written as PROPOSED_NOT_APPLIED (docs/signal-journal-proposal.md); no copy changed.
- Hooks: python3 is not resolvable in Git Bash or PowerShell (only python 3.14 and py exist); main producer = hookify plugin hooks (PreToolUse/PostToolUse/Stop/UserPromptSubmit) running `python3 ...`; also claude-obsidian. Nothing was edited; fix options and owner approval need are in the session diagnosis.
- Evidence: evidence/h-pr12-fix-20261002.
