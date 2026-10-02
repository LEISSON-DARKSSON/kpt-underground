# Measurement plan (ticket H05)

Status: PREPARATION, updated 2026-10-02 on branch `feat/home-nonblocking-fit-20261002`. The adapter now enforces a per-event allowlist and emits `hero_shop_click`; a GA4 one-stream, Basic-consent collector plan exists but is DISABLED and imported by nothing. No collector is active, no third-party script is loaded, no account or Measurement ID exists, no data was sent anywhere. Everything that was not run is marked NOT_RUN.

Machine-readable twin: `docs/measurement-contract.json`. Guard tests: `tests/store/measurement-contract.test.mjs`, `tests/store/analytics-allowlist.test.mjs`. Cross-domain procedure: `docs/cross-domain-check.md` (every step NOT_RUN).

## 1. Current state

- `src/lib/analytics.ts` pushes events to `window.dataLayer` and nowhere else. No vendor script (`gtag`, GTM, Pixel, PostHog and so on) exists in `src/`. Nothing is collected. A non-empty `dataLayer` is a browser buffer, not a report.
- Privacy: every event has an explicit ALLOWLIST (`EVENT_SCHEMA`, top level and per item). Unknown params are dropped, every allowed value is shape-checked (ids, list ids, reasons, CTA ids, site paths; no free text, no URLs), and the old `scrub()` key blocklist plus redaction of values containing `@`, `ptkn_` or `://` remains as a second guard. The blocklist now also covers name, street, city, postcode, zip, ip, user/customer ids, session, cart id, checkout and url keys. The schema equals `docs/measurement-contract.json` (tested).
- Unknown or missing values are omitted, never sent as 0. Currency USD accompanies any price or value that is sent.
- `track()` swallows every error, so a blocked or broken `dataLayer` cannot break shopping (covered by the guard test). Events outside the schema are never pushed.
- `purchase` does not exist in `src/` and must never be added there (CLAUDE.md commerce rule 7).
- `hero_shop_click` is emitted by `src/components/home/hero-cta-tracker.tsx`, a client wrapper that renders the same `div` around the unchanged server-rendered hero link and never blocks navigation. Params: `cta_id`, `destination` (site path) only.
- `src/lib/analytics-collector.ts` (`collectorPlan`) is the prepared, DISABLED GA4 variant: one web stream, Basic consent (the script is not loaded before consent). It returns `enabled:false` unless the owner activation flag is exactly true, the Measurement ID is a valid non-placeholder `G-XXXXXXXXXX` and consent is exactly `granted`. It is pure, has no imports and no side effects, and is imported by nothing (tested).

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
2. `view_item` fires once per product id per full page load (module-level `trackOnce` set). Client-side revisits are not counted again: an undercount, never a repeat. Tested with a simulated SPA route change.
3. `view_cart` fires on every drawer open, including right after `add_to_cart`.
4. `begin_checkout` fires before server validation, so it also counts attempts that end in `checkout_error`.
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
| begin_checkout | Checkout initiation. Not payment | Next.js site |
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
| keepitunderground.com (Next.js) | Existing adapter plus a consent-gated tag for the chosen tool | Not configured |
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

## 7. Consent and privacy

- Refused or unset consent must never block, delay or alter shopping: no event call may throw, await a network call, or gate the cart or checkout. Current `track()` already swallows errors; the consent gate must keep that property.
- Before consent, the tag is not loaded. `dataLayer` pushes may buffer locally but nothing leaves the browser. Whether to use Consent Mode or no-tag-until-consent is an owner policy decision.
- No PII in events: no email, full name, address, phone, card data, token or cookie value, and no fingerprinting. The field allowlist is implemented per event in `EVENT_SCHEMA` (item_id, item_variant, item_name, item_list_id, index, price, quantity, currency, value, reason, cta_id, destination; no `transaction_id` exists in `src/`), with `scrub()` as the second guard.
- Never treat checkout contact data as marketing consent. Do not import customer addresses into marketing tools.
- Ad blockers and refusals shrink the visible data. The Fourthwall order ledger stays the financial source of truth; do not compute conversion from zero or unknown sessions.

## 8. PASS criteria for the owner-gated activation

PASS needs all of the following, each with evidence (collector debug view or report screenshot, SHA, environment, time). Today every item is NOT_RUN.

1. Collector receives at least one real `view_item`, `add_to_cart` and `begin_checkout` with correct `item_id` (and `item_variant`) and USD values. A non-empty `dataLayer` is not a PASS. NOT_RUN
2. Consent refused: add to cart and checkout still work, nothing is sent; consent granted: events arrive. NOT_RUN
3. No forbidden field in any received payload (allowlist enforced, inspected in the collector). NOT_RUN
4. Cross-domain test (section 6) recorded as PASS, or recorded as unknown with attribution reported as unknown. NOT_RUN
5. Id reconciliation table: local slug `item_id` vs the ids Fourthwall natively sends, documented. NOT_RUN
6. Test, sample and owner traffic is distinguishable from real traffic. NOT_RUN
7. `purchase`: stays NOT_RUN until a real, platform-confirmed order exists; then one transaction counts exactly once and matches amount, currency, id and count. NOT_RUN
8. No second purchase sender exists next to Fourthwall's native one. NOT_RUN

Layered report when finished: code ready, Preview verified, in Production, collector really collecting, first real order verified, order fulfilled. One does not replace the next.

## 9. Blocked until the owner decides

- Choice of collector (recommendation: the single GA4 setup, reusing any existing property and stream).
- Consent policy and banner (EU and US visitors). The prepared variant is Basic consent (no script before consent).
- Which GA4 property and web stream to use, and whether one already exists.
- Any account creation, Tracking Pixels entry in Fourthwall, tag load, import of `src/lib/analytics-collector.ts` into the app, or setting `ownerActivation`.
- Checkout URL decoration for cross-domain (only if `docs/cross-domain-check.md` shows the linker does not carry over).
