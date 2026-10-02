# Unit economics: the two 34 USD desk mats (ticket H06)

Status: **BLOCKED_MISSING_INPUTS**. Prepared 2026-10-02, read-only. No order, sample, payment, price change, discount or Fourthwall change was made.

34 USD is a price, not a profit. The only cost written down is the production cost of 13 USD. Retail minus that 13 USD (21 USD) is not a margin: it leaves out the platform fee, the payment fee, discounts, shipping the shop pays, the problem reserve, and acquisition cost. This repo does not state a net profit or paid-acquisition readiness for these mats.

Files: `docs/economics/two-mats.json` (model, every value sourced or null), `scripts/economics/contribution.mjs` (calculator), `tests/economics/contribution.test.mjs`.

```
node scripts/economics/contribution.mjs          # text report, exit 2 while blocked
node scripts/economics/contribution.mjs --json   # same, machine-readable
node --test tests/economics/contribution.test.mjs
```

## Scope

SIGNAL / 01 (`keep-it-underground-signal-01-desk-mat`) and SUBSURFACE / 02 (`keep-it-underground-subsurface-desk-mat`), one variant each (15.5" x 31.5"), target market US, Standard delivery. Three order cases, because neither shipping nor fees scale linearly: one SIGNAL, one SUBSURFACE, and one SIGNAL + one SUBSURFACE. Whether the two mats leave in one parcel is part of the third quote.

## What is known (written down)

| Line | Value | Source | Date |
|---|---|---|---|
| Retail price, both mats | 34.00 USD | `C:\PROJECTS\kpt-underground\evidence\h00-20261002\public-catalog-snapshot.json:3225` (SIGNAL), `:3149` (SUBSURFACE) | 2026-10-02 |
| Production cost, each mat | 13.00 USD | `C:\PROJECTS\kpt-underground\execution-record.json:299` and `:308`; `execution-report.md:158` and `:142` (sample-cost checkout unit price); the handoff `KEEP-IT-UNDERGROUND-Claude-Handoff\CLAUDE-HANDOFF.md:387` calls it the product base | 2026-10-01 |

Caveat on the 13 USD: it is the unit price shown in a sample-cost checkout. It has not been read as a base-cost line on a 34 USD customer order, and it is not known whether any Fourthwall profit figure is already net of fees. Confirm it (see gaps) before treating it as final.

## Recorded but excluded (not a US customer cost)

- **80.49 USD and 80.67 USD**: checkout totals of the SIGNAL + SUBSURFACE sample to **Estonia** (`execution-report.md:150`, `:160`). They contain Estonian VAT, customs duties, Estonia shipping and a sample-cost basket. Not a US shipping estimate. The 49.64 USD one-mat total and the 22.89 / 31.29 / 31.45 USD shipping figures are the same class.
- **Payment fees 0.69, 1.08, 1.73, 2.63 USD** from those sample checkouts: charged on a 13 or 26 USD subtotal, not on a 34 or 68 USD US order. No percentage is back-calculated from them.
- **2 USD fee, 2 USD reserve, 17 USD margin** in the 2026-09-23 planning memo (`...\reference\2026-09-23-business-memo-HISTORICAL.md:37`): labelled planning assumptions, not quotes.
- **16 USD** variant price field on the PRIVATE products: stale, not a cost.

Full list with reasons: `excludedFigures` in the JSON.

## What is missing, and what closes each gap

All closing steps are read-only or owner-run non-binding quotes. Nobody places an order; a quote stops before "Complete order".

| Missing input (null in JSON) | Which figure closes it |
|---|---|
| Platform fee (per order case) | Fourthwall plan/billing page, or the fee line of the profit panel on the offer. Record whether it is already inside the payment fee. |
| Payment fee (per order case) | Owner-run non-binding Fourthwall checkout quote with a **US** address, taken to the shipping step and stopped before payment, for each of the three baskets. Or the admin profit panel. |
| Buyer-paid US shipping (per order case) | The same US quote: Standard shipping for one SIGNAL, one SUBSURFACE, and both together; note one parcel or two. Pass-through, never revenue. |
| Seller-funded shipping | Owner decision and Fourthwall shipping settings. A real 0 needs a source and date. No free shipping without separate owner permission. |
| Discount | Owner confirms in Fourthwall admin which promotions are active and records the USD per order case. No new discount or bundle price without separate owner permission. |
| Problem reserve | Owner policy figure with a stated basis (reprint, refund, quality replacement per order). Not a Fourthwall figure. |
| Quote timestamp | ISO time of each US quote. |
| Confirmation of the 13 USD base | Fourthwall admin product view for each mat (the view that produced `baseCostUsdShown` for Waves 02-04). |
| Buyer-collected US tax (optional) | Same US quote. Shown for the buyer's delivered total only; never revenue, never in contribution. |

The calculator needs every line above (except tax) non-null, sourced and dated. A single null keeps the status BLOCKED and names the input. Nothing is ever read as 0.

## Calculation rule

Per order case, in integer cents: merchandise revenue (price x quantity) minus discount, minus production cost, minus platform fee, minus payment fee, minus seller-funded shipping, minus problem reserve. Buyer-paid shipping and buyer-collected tax are not added. If Fourthwall shows a figure that is already net of production cost or payment fee, enter the other lines accordingly so nothing is subtracted twice. The result is "contribution before acquisition", not net profit.

## What the 14-day test may and may not claim

May: run the organic test for the two mats at 34 USD (see `docs/14-DAY-EXPERIMENT` in the strategy package) as a demand and fit experiment; count visits, product views, carts, checkouts and paid ordinary orders; say that cost status is BLOCKED_MISSING_INPUTS until the lines above are filled.

May not, while any line is null:
- call 34 USD, or 34 minus 13, a margin, profit or "contribution";
- declare paid-acquisition readiness, or set a paid budget or CAC target;
- state ROAS or CAC;
- use the Estonia sample totals as a US cost;
- offer free shipping, a new price, or a bundle discount (each needs its own owner permission);
- treat buyer-collected tax or shipping as income.

After the quotes are in and the contribution is positive and known, it is the figure for the "paid orders but negative or unknown contribution" decision rule. Even then the tool prints `NOT_CLAIMED` for paid-acquisition readiness; that decision stays with the owner.
