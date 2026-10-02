# Unit economics: the two 34 USD desk mats (ticket H06)

Prepared 2026-10-02. No order, sample, payment, price change, discount or Fourthwall change was made. The buyer-side quote below was an owner-approved non-binding checkout read, stopped before payment.

- Actual contribution: **BLOCKED_MISSING_INPUTS**. The platform fee, the actual payment fee in dollars and its base, the shop-side treatment of shipping, the problem reserve, net payout and the customization amount are still unknown.
- Planning scenario: **PLANNING_ONLY**. Arithmetic from observed and public-standard inputs. It is not profit.

**34 - 13 = 21 is still not profit.** It is retail minus the catalog base and nothing else. It leaves out the payment fee, platform fee, shipping the shop pays, the problem reserve, a possible customization amount and acquisition cost. The observed US quote adds buyer-paid shipping and tax, which are pass-through and are never revenue. This repo states no net profit and no paid-acquisition readiness for these mats.

Files: `docs/economics/two-mats.json` (model), `scripts/economics/contribution.mjs` (calculator), `tests/economics/contribution.test.mjs`.

```
node scripts/economics/contribution.mjs          # text report, exit 2 while the actual figure is blocked
node scripts/economics/contribution.mjs --json
node --test tests/economics/contribution.test.mjs
```

## Input classes

Every input in the JSON has one class. The calculator rejects a node with a missing or wrong class.

| Class | Meaning | Needs |
|---|---|---|
| OBSERVED | Read from the Fourthwall account or catalog | source, date |
| PUBLIC_STANDARD | Published standard, not a settled transaction | URL, date, `settledTransaction: false` |
| PLANNING_ASSUMPTION | Owner decision or scenario, never a fact; null = not supplied | owner, decisionNeeded |
| UNKNOWN | Not known; stays null, never 0 | `closes`: what closes it |

The actual contribution accepts only OBSERVED values (an owner PLANNING_ASSUMPTION is also allowed for the discount, the reserve and seller-funded shipping). PUBLIC_STANDARD never feeds it.

## Observed

| Input | Value | Source (2026-10-02) |
|---|---|---|
| Retail price, both mats | 34 USD | public catalog snapshot |
| Catalog base, both mats | 13 USD | Fourthwall catalog product `pro_a0e4db25108747b496` (Allcolor SP70018 `desk-mat-155-x-315`, one size 15.5" x 31.5", ships from US): `priceFrom = priceTo = 13`, print area sale price `$0.00` |
| Account plan | Free, ACTIVE, pro = false | `ecommerce_get-current-subscription` (Pro pricing is out of scope) |

The catalog flat product charge and the manufacturing cost are the **same** 13 USD. The model has one field for it (`catalogBaseUsd`). If a file carries both a "catalog flat fee" and a "production cost" field, they must be equal and are collapsed, so 13 is subtracted once per unit, never twice.

The customization-pricing read returned a USD cost component with **no numeric amount**. The customization quote amount therefore stays UNKNOWN (`customizationAdditionalUsd = null`), and the 13 USD is not marked as a confirmed all-in cost.

### Observed US checkout quote (one New York destination, 2026-10-02)

Non-binding quote on the Fourthwall hosted checkout, owner-approved, taken 2026-10-02 at 12:41 UTC (about 15:40 local). No payment, no order. Destination: 350 5th Ave, New York, NY 10118, a public commercial address used only as a test destination. Delivery method shown: **Standard**, estimated Friday Oct 16 - Tuesday Oct 20 (the same on all three baskets). Evidence: `C:\PROJECTS\kpt-underground\evidence\h-pr12-fix-20261002\us-quote` (`quote-results.json`, page text and screenshots per basket). Amounts as displayed, USD:

| Basket | Items | Shipping | Tax | Total (buyer pays) |
|---|---|---|---|---|
| One SIGNAL / 01 | 34.00 | 7.19 | 3.66 | 44.85 |
| One SUBSURFACE / 02 | 34.00 | 7.19 | 3.66 | 44.85 |
| One of each | 68.00 | 9.84 | 6.91 | 84.75 |

- **Shipping was combined, not doubled.** Two mats show 9.84, not 2 x 7.19 = 14.38. The parcel count is not shown.
- **Tax arithmetic, as an observation only:** in each basket the displayed tax equals 8.875% of (items + shipping): 41.19 x 0.08875 = 3.656, shown as 3.66; 77.84 x 0.08875 = 6.908, shown as 6.91. This holds for these three baskets and this destination. It is not a rule and is not applied to any other state.
- Items + shipping + tax equals the total in every basket; the calculator checks that.

**What this quote proves.** What a New York buyer of these exact baskets was charged for items, Standard shipping and tax at that moment, and that the checkout combined shipping for two mats.

**What it does not prove.**
- It covers **one destination on one date, Standard method only**. Other states, zones and methods are not covered, and shipping and tax can change with the destination, the date, the basket and Fourthwall's settings.
- It is the buyer side. It does not show the platform fee, the payment fee in dollars or the base it is assessed on, whether Fourthwall deducts or passes through the shipping amount (or any seller-funded share), the customization quote amount, net payout, or the reserve.
- The delivery window is an estimate shown at checkout, not a promise.

Buyer-paid shipping and buyer tax are validated by the calculator and are **never** revenue, never added to or subtracted from contribution. They only set the fee base in the planning scenario.

### Owner rule: no discounts

Discount is recorded as 0 with class PLANNING_ASSUMPTION, owner "owner standing rule 2026-10-02" (no discounts and no price changes). It is a policy, not an observed account fact. The three quote baskets showed no discount line.

## Public standard (not a settled transaction)

From https://fourthwall.com/pricing, read 2026-10-02: US credit card 2.9% + 0.30 USD per transaction; extra percentage markup on physical catalog products 0. Rounding is a calculator rule: half up to the cent, once per transaction, fixed fee once per transaction. Fourthwall's real rounding is not confirmed.

The base the percentage is charged on is **not confirmed**: item only, item + shipping, or item + shipping + tax. An earlier dossier (provisional) says the help center charges fees on item + shipping + tax and excludes US sales tax from payouts. Treat that as unconfirmed.

## Planning (labelled, never a fact)

`planningScenario` in the script output: `retail - 13 catalog base - payment fee`, in integer cents, per order case and per fee-base scenario. Status `PLANNING_ONLY`, readiness `NOT_CLAIMED`. The fee is 2.9% (PUBLIC_STANDARD) of the base, rounded half up once per transaction, plus 0.30 USD once per transaction. The 13 USD base is counted once per unit.

The fee base is not confirmed, so all three variants are shown. Buyer shipping and tax are the OBSERVED New York quote lines above (an owner planning value is only a fallback when no observed line exists).

| Order case | Fee base | Base | Payment fee | Planning residual |
|---|---|---|---|---|
| One SIGNAL or one SUBSURFACE | item only | 34.00 | 1.29 (0.986 -> 0.99, + 0.30) | 19.71 |
| | item + shipping | 41.19 | 1.49 (1.19451 -> 1.19, + 0.30) | 19.51 |
| | item + shipping + tax | 44.85 | 1.60 (1.30065 -> 1.30, + 0.30) | 19.40 |
| One of each | item only | 68.00 | 2.27 (1.972 -> 1.97, + 0.30) | 39.73 |
| | item + shipping | 77.84 | 2.56 (2.25736 -> 2.26, + 0.30) | 39.44 |
| | item + shipping + tax | 84.75 (8475 cents) | 2.76 (2.45775 -> 2.46, + 0.30) | 39.24 |

The residual is not profit and not a contribution. It still excludes the customization amount, seller-funded shipping and the shop-side shipping treatment, the problem reserve, a platform fee in dollars and acquisition cost; the discount is 0 by owner rule. Buyer shipping and buyer tax raise only the fee base in the scenario; they are never revenue and are not in the residual. The scenario is valid for the New York quote only.

## Unknown (null in JSON)

| Unknown | What closes it |
|---|---|
| Actual payment fee in dollars, and its assessment base | settled order fee line, or the Fourthwall answer below. The buyer-side quote did not show it. |
| Platform fee in dollars | settled order fee line or Fourthwall answer |
| Shop-side shipping treatment: does Fourthwall deduct or pass through the buyer-paid shipping, and is any part seller-funded | owner shipping settings plus a settled order's shipping line, or the Fourthwall answer. The buyer charge (7.19 / 9.84) is observed; the seller side is not, so it is not assumed 0. |
| Net payout | settled order; cross-check only |
| Customization quote amount | numeric customization price, or written confirmation that 13 is the full price |
| Problem reserve | owner policy figure with a stated basis |
| Other destinations, zones and methods | a further quote per destination; the New York figures are not extrapolated |

Closed since the first version: buyer shipping, buyer tax and the delivery window (OBSERVED for one New York destination, above) and the discount (0 by owner rule, PLANNING_ASSUMPTION).

## Remaining steps for USA numbers

The quote above was taken once for one destination on 2026-10-02. It covers only that destination. The open items are the payment-fee base and the dollar fees, the shop-side shipping treatment, net payout, the customization amount and the reserve. The realistic ways to close them are a **written Fourthwall support question** (draft below, **Status: NOT_SENT**) and the fee line of a settled ordinary order. Another quote is needed only for another destination, and needs the owner's separate permission. No order, sample or payment is made for any of this.

> Subject: Payment fee base and customization price for catalog product pro_a0e4db25108747b496
>
> Hello, we sell two desk mats (catalog product pro_a0e4db25108747b496, Allcolor SP70018, 15.5" x 31.5") on the Free plan, retail 34 USD, shipping to US customers.
> 1. For a US credit card order, is the 2.9% + 0.30 USD fee charged on the item price only, on item + shipping, or on item + shipping + tax?
> 2. Is the 13 USD catalog price the full production price, or does the customization (customizationId cud_6nZ6I9XbTF6ZWVLwPt6tFQ) add a further amount? If it does, what is the USD amount?
> 3. Is any platform fee charged on top of the payment fee on the Free plan for physical catalog products?
> 4. At checkout a New York buyer was shown Standard shipping of 7.19 USD (one mat) or 9.84 USD (two mats) and sales tax. Do you deduct or pass through the shipping amount to us, and is the sales tax excluded from our payout?
>
> Thank you.

## Calculation rule (actual contribution)

Per order case, integer cents: merchandise revenue (price x quantity) minus discount, minus catalog base (once per unit), minus customization addition, minus platform fee, minus payment fee, minus seller-funded shipping, minus problem reserve. Buyer-paid shipping, buyer-collected tax and net payout are required inputs but are never added or subtracted; an optional observed quote total is cross-checked against items - discount + shipping + tax and never used otherwise. The result is "contribution before acquisition", not net profit. While any of platform fee, payment fee, seller-funded shipping, reserve or net payout is null, the status stays BLOCKED_MISSING_INPUTS and no figure is printed.

## Recorded but excluded (not a US customer cost)

- **80.49 and 80.67 USD**: checkout totals of the SIGNAL + SUBSURFACE sample to **Estonia**, with Estonian VAT, duties, Estonia shipping and a sample-cost basket. The 49.64 USD one-mat total and the 22.89 / 31.29 / 31.45 USD shipping figures are the same class.
- **Payment fees 0.69, 1.08, 1.73, 2.63 USD** from those sample checkouts: charged on 13 or 26 USD, not on a US order. No percentage is back-calculated.
- **2 USD fee, 2 USD reserve, 17 USD margin** in the 2026-09-23 planning memo: labelled assumptions.
- **16 USD** variant price field on the PRIVATE products: stale, not a cost.

Full list with sources: `excludedFigures` in the JSON.

## What the 14-day test may and may not claim

May: run the organic test at 34 USD as a demand and fit experiment; count visits, product views, carts, checkouts and paid ordinary orders; state that the actual contribution is BLOCKED_MISSING_INPUTS.

May not, while any actual line is null:
- call 34 USD, 34 - 13, or the planning residual a margin, profit or "contribution";
- declare paid-acquisition readiness, or set a paid budget, CAC or ROAS target;
- use the Estonia sample totals as a US cost;
- offer free shipping, a new price or a bundle discount (each needs its own owner permission);
- treat buyer-collected tax or shipping as income;
- present the New York quote as the shipping or tax for other destinations.

Even after every line is filled, the tool prints `NOT_CLAIMED` for paid-acquisition readiness; that decision stays with the owner.
