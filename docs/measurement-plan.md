# Measurement plan (ticket H05)

Status: CODE READY, NOT ACTIVATED, updated 2026-10-02 on branch `feat/ga4-collector-20261002` (base `46be9fe`). One GA4 transport (direct gtag, Basic consent, manual page views) is wired into the app shell but inert: with `NEXT_PUBLIC_GA4_MEASUREMENT_ID` or `NEXT_PUBLIC_GA4_OWNER_ACTIVATION` unset it renders nothing, loads nothing and sends nothing. No GA4 property or web stream for `keepitunderground.com` was found in the Google accounts visible on 2026-10-02 (section 10), so no Measurement ID existed at that time. After the owner's approval the same day one property and one web stream were created (section 10); no env var is set, nothing is activated and no data was sent anywhere. Everything that was not run is marked NOT_RUN.

Machine-readable twin: `docs/measurement-contract.json`. Guard tests: `tests/store/measurement-contract.test.mjs`, `tests/store/analytics-allowlist.test.mjs`. Cross-domain procedure: `docs/cross-domain-check.md` (every step NOT_RUN).

## 1. Current state

- `src/lib/analytics.ts` validates every event and pushes it to `window.dataLayer` (a local array nothing reads), then hands it to the one registered forwarder. The only Google code is `src/lib/analytics-collector.ts` (pure rules) and `src/lib/analytics-transport.ts` (the sender); no GTM, Pixel, PostHog or second tag exists. A non-empty `dataLayer` is a browser buffer, not a report.
- Privacy: every event has an explicit ALLOWLIST (`EVENT_SCHEMA`, top level and per item). Unknown params are dropped, every allowed value is shape-checked (ids, list ids, reasons, CTA ids, site paths; no free text, no URLs), and the old `scrub()` key blocklist plus redaction of values containing `@`, `ptkn_` or `://` remains as a second guard. The blocklist now also covers name, street, city, postcode, zip, ip, user/customer ids, session, cart id, checkout and url keys. The schema equals `docs/measurement-contract.json` (tested).
- Unknown or missing values are omitted, never sent as 0. Currency USD accompanies any price or value that is sent.
- `track()` swallows every error, so a blocked or broken `dataLayer` cannot break shopping (covered by the guard test). Events outside the schema are never pushed.
- `purchase` does not exist in `src/` and must never be added there (CLAUDE.md commerce rule 7).
- `hero_shop_click` is emitted by `src/components/home/hero-cta-tracker.tsx`, a client wrapper that renders the same `div` around the unchanged server-rendered hero link and never blocks navigation. Params: `cta_id`, `destination` (site path) only.
- Collector: `collectorPlan` (pure) says whether the tag may run. `createGa4Transport` performs it: consent default (analytics granted; `ad_storage`, `ad_user_data`, `ad_personalization` denied), `js`, `config` (`send_page_view:false`, Google signals and ad personalization off), then an async `gtag.js` script request with its own layer name (`l=kptGa4Layer`) so the shop's `{event}` buffer is never consumed by Google. Every command goes through one real `gtag()` that pushes the `arguments` object (raw arrays are ignored by the consent engine). The consent choice is stored in `localStorage` key `kpt-analytics-consent-v1` and is analytics only: it is not an advertising or e-mail consent. UI: `AnalyticsRoot` (banner, shown only when configured and unset) and `AnalyticsPreference` (footer switch). Page views are manual: the first one right after a grant (or on load with a stored grant), then one per real route change (`usePathname`), deduplicated against StrictMode double effects.

## 2. Events emitted today (static code reading, 2026-10-02)

Money is `cents / 100` exactly once (USD dollars). `item_id` is always the product slug. `item_variant`, when present, is the Fourthwall variant id. The params column lists what the call site sends; the adapter then keeps only the event's allowlist.

| Event | File | Params sent | item_id source | Currency |
|---|---|---|---|---|
| hero_shop_click | `src/components/home/hero-cta-tracker.tsx` | cta_id, destination | none | none (no money) |
| view_item_list | `src/components/store/shop-catalog.tsx` | item_list_id (no search text), currency, items[item_id, item_name, index, price] | `p.slug` | `"USD"` |
| select_item | `src/components/store/product-card.tsx` | item_list_id, currency, items[item_id, item_name, price] | `product.slug` | `"USD"` |
| view_item | `src/components/store/product-purchase.tsx` | currency, value, items[item_id, item_name, item_variant (single-variant products only), price] | `product.slug` | `"USD"` |
| view_cart | `src/lib/store/cart.tsx` | currency, value (omitted when empty), items[item_id, item_variant, price, quantity] | `l.slug` | `"USD"` |
| add_to_cart | `src/lib/store/cart.tsx` | currency, value, items[item_id, item_variant, price, quantity] | `line.slug` | `"USD"` |
| begin_checkout | `src/lib/store/cart.tsx` | currency, value, items[item_id, item_variant, price, quantity] | `l.slug` | `"USD"` |
| checkout_redirect | `src/lib/store/cart.tsx` | currency, value, items[item_id, item_variant, quantity]; never the URL, cart id or session | `l.slug` | `"USD"` |
| checkout_error | `src/lib/store/cart.tsx` (three sites) | reason (PRICE_CHANGED, HTTP_n, NETWORK) | none | none |

Residual gaps (reported, not hidden):

1. `view_item` reports the from-price for multi-variant products and has no `item_variant` there (no variant is chosen at view time). It is unknown, so it is omitted.
2. `view_item` and `view_item_list` fire once per page view: `trackOnce` keys are cleared by a layout effect on every route change (`startPageScope`), so A -> B -> A counts A twice and a re-render or StrictMode re-run counts once. Tested with a simulated route change and in a real browser. Events before consent are not counted at all (no replay).
3. `view_cart` fires on every drawer open, including right after `add_to_cart`.
4. `begin_checkout` fires before server validation, so it also counts attempts that end in `checkout_error`. It is no longer forwarded to Google: Fourthwall's hosted checkout sends its own `begin_checkout` into the same stream.
5. `checkout_redirect` has no per-item price; `value` is the cart subtotal.
6. Item ids are local slugs; reconciliation with the ids Fourthwall natively sends is NOT_RUN.
7. Everything above is verified by static reading and unit tests only. No collector has received anything (NOT_RUN).

## 3. Target contract: one setup, one meaning per event

One GA4 setup, subject to owner confirmation. Reuse an existing property and web stream if one exists; do not invent a Measurement ID and do not run GA4, PostHog and several pixels in parallel.

| Event | Meaning | Source |
|---|---|---|
| hero_shop_click | The home hero CTA was actually activated | Next.js site |
| view_item | A product detail page was viewed | Next.js site |
| add_to_cart | A valid chosen variant was actually added to the cart | Next.js site |
| begin_checkout | Checkout initiation. Not payment | Fourthwall native only (observed from the hosted checkout page, 2026-10-02). The app records it in the local dataLayer but does not forward it, so a checkout is not counted twice |
| checkout_redirect | A valid Fourthwall checkout URL was received. Not a purchase. Never a key event / conversion | Next.js site |
| purchase | A real paid order confirmed by the platform, with `transaction_id`, `currency`, `value`, `items` | Fourthwall native only |

The local extras (`view_item_list`, `select_item`, `view_cart`, `checkout_error`) stay as technical or funnel-detail events with the same one-meaning rule.

Rules:

- `purchase` is never sent from `src/`, a click, an HTTP 200, a redirect or a thank-you URL. Prefer Fourthwall's native purchase event and compare it with the real order count. Do not add a second purchase sender next to it. If native is insufficient, write a separate proposal for a signed, idempotent server-side path; that is not an automatic licence to build it.
- One transaction counts once (`transaction_id` dedupe). Owner test orders, samples, gifts and refunds stay distinguishable.
- Keep item value, shipping and tax separate. Never divide cents twice.
- Local slug `item_id` may differ from what Fourthwall natively sends. Reconcile with real Fourthwall events against the id map in `docs/measurement-contract.json` (22 offers, 55 variants from the 2026-10-02 snapshot) before any report. Reconciliation: NOT_RUN.
- Unknown attribution is reported as unknown, never as zero, organic or new customer.

## 4. Two surfaces, configured separately

| Surface | Collector wiring | Status |
|---|---|---|
| keepitunderground.com (Next.js) | Existing adapter plus the consent-gated GA4 transport | Code ready, inert; no Measurement ID, not activated |
| keepitunderground-shop.fourthwall.com (hosted checkout) | Fourthwall Analytics, Tracking Pixels, GA4 Measurement ID, plus a separate account link for reports | Not configured (Fourthwall GA report previously said Google Analytics is not connected, per strategy S09/E11) |

Connecting one surface does not configure the other.

## 5. Source verification (retrieved 2026-10-02)

| Claim | Result | URL |
|---|---|---|
| W01: Fourthwall takes a GA4 Measurement ID in Analytics, Tracking Pixels; reports are linked separately | CONFIRMED. Page text: paste the Measurement ID into the Tracking Pixels section of the Analytics dashboard; in the Overview section click "Connect for free" to link the Google Analytics account, then "View Google Analytics" | https://help.fourthwall.com/manage-my-shop/shop-settings/add-google-analytics-to-your-site |
| Fourthwall sends GA4 events natively, purchase on the order confirmation page | CONFIRMED on a second Fourthwall page (page views, product views, add-to-cart, purchases; purchase fires on the order confirmation page). `begin_checkout` is not listed there | https://help.fourthwall.com/manage-my-shop/apps-features-and-integrations/setting-up-analytics-and-tracking |
| W01 implies it does not configure the Next.js domain | INFERENCE, not stated. The pages cover a Fourthwall site only; they do not mention external sites | same two pages |
| Fourthwall pages on consent banner, custom domain, cross-domain | NOT CONFIRMED. Neither Fourthwall page mentions consent, cross-domain tracking or custom domains | same two pages |
| W02: GA4 e-commerce events; `items` needs `item_id` or `item_name`; `currency` is set whenever `value` is sent; `purchase` requires `transaction_id`, `currency`, `value`; `refund` requires `transaction_id` | CONFIRMED | https://developers.google.com/analytics/devguides/collection/ga4/ecommerce |
| GA4 cross-domain linker (`_gl`) is added to links and form submissions to the linked domain | CONFIRMED from Google search results (summary, not a full page read): "when the user navigates between domains through a link or a form"; the parameter can be stripped by a redirect that drops unknown query parameters | https://developers.google.com/tag-platform/devguides/cross-domain and https://support.google.com/analytics/answer/10071811 |
| The linker also decorates a programmatic `window.location.assign(url)` (what `cart.tsx` does) | NOT CONFIRMED. Docs describe links and forms only. Expect the attribution test to fail until the URL is decorated, which is a later `src/` change | n/a |
| Fourthwall honors an incoming `_gl` on its checkout host | NOT CONFIRMED | n/a |

Fetch notes: the Fourthwall and Google e-commerce pages were read through a page-summarizing fetch tool, so quotes are summaries. A direct fetch of `https://developers.google.com/analytics/devguides/tag-platform/cross-domain` returned HTTP 404, and the cross-domain page was not read directly afterwards; the cross-domain claim above rests on search-result summaries only.

## 6. Cross-domain attribution test

The concrete procedure, with boolean PASS criteria, owner-gated prerequisites, evidence-hygiene rules and clearly labelled UNVERIFIED hypotheses, is in `docs/cross-domain-check.md`. Every step there is NOT_RUN. Cross-domain is PASS only when the debug view shows continuity on both hostnames; otherwise attribution is reported as unknown. No orders, no payment; stop at the hosted checkout page (HTTP 200).

## 7. Consent and privacy (policy implemented in code; a technical proposal, not legal advice)

- Basic consent, no advertising features. Before consent and after a refusal the Google tag is not loaded and no measurement request is made. Shopping never waits for it: no event call throws, awaits a network call or gates the cart or checkout.
- Events from before consent are never sent and never replayed: the transport receives each event as it happens and ignores it unless consent is granted. The only buffer is the short one that builds while the script loads after the grant (capped at 25 commands; a blocked script stops it).
- Withdrawal stops sending in the same session: `ga-disable-<ID>` is set first, a `consent update` to denied follows, the transport gate closes, and the `_ga` / `_ga_<ID>` cookies are expired. A stored refusal is honoured on the next visit.
- Google sees `page_location` and `page_referrer` only as rebuilt by `safePageLocation` / `safeReferrer`: origin + path, plus `utm_*` campaign tags whose value is a short plain token; no search text, filters, `_gl`, ids or other parameters; an external referrer is reduced to its origin. They are added to every event, to `config` and to `gtag('set')`. UNVERIFIED until a real receipt: whether Google's own automatic events (`user_engagement`, `scroll` and so on) use the `set` values instead of `document.location`.
- Page titles (`dt`, which real `gtag.js` sends on every hit) are static strings or the Fourthwall product name; no page builds a title from search text, filters or other visitor input (read from `src/app/*/page.tsx` and `generateMetadata`, 2026-10-02). If that ever changes, set `page_title` explicitly next to `page_location`.
- No PII in events: the field allowlist is implemented per event in `EVENT_SCHEMA`, with `scrub()` as the second guard, and the transport refuses any event name outside the schema (so a stray `purchase` cannot go out).
- Never treat checkout contact data as marketing consent. Do not import customer addresses into marketing tools.
- Ad blockers and refusals shrink the visible data. The Fourthwall order ledger stays the financial source of truth; do not compute conversion from zero or unknown sessions.

## 8. PASS criteria for the owner-gated activation

PASS needs all of the following, each with evidence (collector debug view or report screenshot, SHA, environment, time). Today every item is NOT_RUN.

1. Collector receives at least one real `view_item` and `add_to_cart` (and, from Fourthwall natively, `begin_checkout`) with correct `item_id` (and `item_variant`) and USD values. A non-empty `dataLayer` is not a PASS. NOT_RUN
2. Consent refused: add to cart and checkout still work, nothing is sent; consent granted: events arrive. NOT_RUN
3. No forbidden field in any received payload (allowlist enforced, inspected in the collector). NOT_RUN
4. Cross-domain test (section 6) recorded as PASS, or recorded as unknown with attribution reported as unknown. NOT_RUN
5. Id reconciliation table: local slug `item_id` vs the ids Fourthwall natively sends, documented. NOT_RUN
6. Test, sample and owner traffic is distinguishable from real traffic. NOT_RUN
7. `purchase`: stays NOT_RUN until a real, platform-confirmed order exists; then one transaction counts exactly once and matches amount, currency, id and count. NOT_RUN
8. No second purchase sender exists next to Fourthwall's native one. NOT_RUN

Layered report when finished: code ready, Preview verified, in Production, collector really collecting, first real order verified, order fulfilled. One does not replace the next.

## 9. Blocked until the owner decides

- Which GA4 property and web stream to use (section 10: none for this site was found).
- Any account, property or stream creation, Tracking Pixels entry in Fourthwall, setting the two env vars in Vercel, or publishing this branch to Production.
- Checkout URL decoration for cross-domain (only if `docs/cross-domain-check.md` shows the linker does not carry over). This branch changes neither `cart.tsx` call sites nor the checkout route.

## 10. Asset search and the activation decision (read-only, 2026-10-02)

Searched, read only: Google Analytics in the browser profile signed in as the owner's Google account, all 10 Analytics accounts and the Tag Manager list; property names matching "keep" and "underground" (none); the data streams of the LEISSON CREATIVE account (`304551897`). Found: property `429821431` (stream `https://www.leisson.eu`) and property `554535675` PROUXAUDIT (stream `https://prouxaudit.com`); both belong to other projects and must not be used. The other signed-in Google account on the owner's company domain has no Analytics account; a third signed-in account belongs to another project and was not opened. No Google tag ID appears in the server HTML of `keepitunderground.com` or the Fourthwall shop (the Fourthwall page may inject tags with script, which was not run). Conclusion: no GA4 property or web stream for `keepitunderground.com` is visible to this login. Vercel project `kpt-underground`, environment variable key names and targets only (values not decrypted), checked 2026-10-02: no `NEXT_PUBLIC_GA4_*` key exists for Preview or Production, so the transport is inert on every deployment of this branch and after a merge (the keys present are the Fourthwall ones only). Supermetrics GA4 was not authenticated (no OAuth grant was made).

Update, 2026-10-02, after the owner's explicit approval in chat: the property and stream were created in the Google Analytics UI under account LEISSON CREATIVE (`304551897`): property `KEEP IT UNDERGROUND` (`557166408`, Estonia time zone, USD, industry Shopping, objectives drive sales and web traffic) with ONE web stream `keepitunderground.com` (`https://keepitunderground.com`, stream id `15953572089`). Enhanced Measurement was turned OFF at creation and read back off on the stream page (only the unconfigurable standard page view remains). The Measurement ID belongs in the two env vars only, never in this repository. Nothing else was changed: no Fourthwall Tracking Pixels entry, no env var in Vercel, no push, no Preview, no Production. Still open before real collection: QA / internal-traffic filter and data retention (not set yet), the Preview-only env vars, the Preview DebugView receipt at the branch SHA, then the final-SHA confirmation. The steps below that are already done: step 1 (property and stream, Enhanced Measurement off).

Decision needed from the owner (one question): approve creating ONE GA4 property with ONE web stream for `keepitunderground.com` under account LEISSON CREATIVE (`304551897`), or name an existing one. If approved, the activation steps are, in order, each needing the owner's go:

1. Create the property and stream with ALL Enhanced Measurement toggles OFF for the first activation. "Page changes based on browser history" must be off (this code sends the SPA page views itself; leaving it on double counts); site search, form interactions (the shop's `role=search` form), outbound clicks, scrolls, video and file downloads are Google-side automatic events whose URLs and parameters this code cannot clean, so each is re-enabled only after it was inspected in DebugView. Set a QA / internal-traffic filter and data retention.
2. Set the two env vars on Preview only; push the branch; check on the Preview URL, in DebugView, at the exact branch SHA, that consent unset or denied sends nothing and a grant sends one `page_view` and the events. Real collection stays NOT_RUN until that receipt exists.
3. Only then, with an explicit final-SHA confirmation, set the env vars for Production.

## 11. Tests (reusable, `tests/measurement/`)

- `npm run test:measurement`: transport against a fake browser (cases 1-9, URL hygiene, caps, cookies) and the negative control for the contact-capture scanner (the fixture with a signup form must fail the check, the fixture without must pass; a pattern with a raw control character is rejected).
- `npm run test:measurement:browser`: real build, real Chromium, Google hosts intercepted, `gtag.js` replaced by a stub that plays the observable parts (reads the layer at load, honours `ga-disable`, one collect per event). It proves our command sequence, consent gating, route handling, URL hygiene and that shopping never depends on measurement. It does not prove real `gtag.js` behaviour on the wire. Needs `PLAYWRIGHT_MODULE` (and `CHROMIUM_PATH`).

## 12. Hosted shop and checkout, observed 2026-10-02 (after the owner entered the Measurement ID in Fourthwall Tracking pixels)

- The hosted shop and checkout load `gtag.js` for our ID through Fourthwall's own GTM, next to Fourthwall's own tags (its GA ids, Google Ads remarketing, Microsoft Clarity and others). Hits with our ID arrive from the hosted pages, and a `_ga_` cookie for our stream exists on the hosted domain.
- Fourthwall's "Enable cookie policy" is ON and shows a banner (Accept all, Reject all, Manage preferences). It runs Google Consent Mode in its ADVANCED form, not our Basic form: before a choice, and after Reject all, hits with our ID are still sent as cookieless pings (consent state `G100`, `npa=1`); after Accept all they carry full consent. Our own banner choice is not passed to the hosted side. Fourthwall's other platform tags (for example Clarity) kept loading after Reject all; those are Fourthwall's, not ours.
- So the "nothing is sent before consent" rule holds for keepitunderground.com only. On the hosted side the owner has accepted Fourthwall's behaviour by entering the ID; clearing the field in Fourthwall admin (Analytics, Options, Tracking pixels) stops our ID there.
- No linker is added on the handoff, so hosted hits use their own client id and appear as a separate user and session unless a later check proves otherwise. Cross-domain stays NOT_RUN.
- An automated browser gets `403 Forbidden` from the hosted shop (bot protection); this was not bypassed. Observations used the owner's real Chrome with the stored Fourthwall consent cookie removed first.
