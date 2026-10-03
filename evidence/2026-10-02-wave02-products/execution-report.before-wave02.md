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
