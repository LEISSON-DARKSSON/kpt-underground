# Unit economics: the two 34 USD desk mats (ticket H06)

Prepared 2026-10-02, read-only. No order, sample, payment, price change, discount or Fourthwall change was made.

- Actual contribution: **BLOCKED_MISSING_INPUTS**. US shipping, buyer tax, the real payment fee in dollars, net payout, discount, seller-funded shipping and the problem reserve are still unknown.
- Planning scenario: **PLANNING_ONLY**. Arithmetic from observed and public-standard inputs. It is not profit.

**34 - 13 = 21 is not profit.** It is retail minus the catalog base and nothing else. It leaves out the payment fee, platform fee, discounts, shipping the shop pays, the problem reserve, a possible customization amount and acquisition cost. This repo states no net profit and no paid-acquisition readiness for these mats.

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

The actual contribution accepts only OBSERVED values (an owner PLANNING_ASSUMPTION is also allowed for the reserve and seller-funded shipping). PUBLIC_STANDARD never feeds it.

## Observed

| Input | Value | Source (2026-10-02) |
|---|---|---|
| Retail price, both mats | 34 USD | public catalog snapshot |
| Catalog base, both mats | 13 USD | Fourthwall catalog product `pro_a0e4db25108747b496` (Allcolor SP70018 `desk-mat-155-x-315`, one size 15.5" x 31.5", ships from US): `priceFrom = priceTo = 13`, print area sale price `$0.00` |
| Account plan | Free, ACTIVE, pro = false | `ecommerce_get-current-subscription` (Pro pricing is out of scope) |

The catalog flat product charge and the manufacturing cost are the **same** 13 USD. The model has one field for it (`catalogBaseUsd`). If a file carries both a "catalog flat fee" and a "production cost" field, they must be equal and are collapsed, so 13 is subtracted once per unit, never twice.

The customization-pricing read returned a USD cost component with **no numeric amount**. The customization quote amount therefore stays UNKNOWN (`customizationAdditionalUsd = null`), and the 13 USD is not marked as a confirmed all-in cost.

## Public standard (not a settled transaction)

From https://fourthwall.com/pricing, read 2026-10-02: US credit card 2.9% + 0.30 USD per transaction; extra percentage markup on physical catalog products 0. Rounding is a calculator rule: half up to the cent, once per transaction, fixed fee once per transaction. Fourthwall's real rounding is not confirmed.

The base the percentage is charged on is **not confirmed**: item only, item + shipping, or item + shipping + tax. An earlier dossier (provisional) says the help center charges fees on item + shipping + tax and excludes US sales tax from payouts. Treat that as unconfirmed.

## Planning (labelled, never a fact)

`planningScenario` in the script output: `retail - 13 catalog base - payment fee`, in integer cents, per order case and per fee-base scenario. Status `PLANNING_ONLY`, readiness `NOT_CLAIMED`.

| Order case | Fee base | Payment fee | Planning residual |
|---|---|---|---|
| One SIGNAL or one SUBSURFACE | item only, 34.00 | 1.29 (2.9% of 34.00 = 0.986, rounds to 0.99, plus 0.30) | 19.71 |
| One of each | item only, 68.00 | 2.27 (2.9% of 68.00 = 1.972, rounds to 1.97, plus 0.30) | 39.73 |
| Any case | item + shipping, item + shipping + tax | needs an owner planning value for buyer shipping (and tax) | NOT_COMPUTABLE until supplied |

The residual is not profit and not a contribution. It still excludes the customization amount, discount, seller-funded shipping, the problem reserve, a platform fee in dollars and acquisition cost. Buyer shipping and buyer tax raise only the fee base in the scenario; they are never revenue.

## Unknown (null in JSON)

| Unknown | What closes it |
|---|---|
| US buyer shipping quote and shipping cost | non-binding US quote, see below |
| Buyer-collected US tax | same quote (pass-through, never revenue) |
| Actual payment fee in dollars, and its base | same quote, or the Fourthwall answer below |
| Platform fee in dollars | settled order fee line or Fourthwall answer |
| Net payout | settled order; cross-check only |
| Customization quote amount | numeric customization price, or written confirmation that 13 is the full price |
| Discount, seller-funded shipping, problem reserve | owner decisions (no free shipping or bundle discount without separate permission) |

## The one remaining step for USA numbers

A **non-binding quote for three baskets**: one SIGNAL, one SUBSURFACE, one of each, to a US test address, stopped before "Complete order". It needs the owner's **separate permission** and a test destination. It gives buyer shipping, buyer tax, one parcel or two, and the fee line. Nothing is ordered or paid.

Alternative: a written Fourthwall support question. Draft below. **Status: NOT_SENT.**

> Subject: Payment fee base and customization price for catalog product pro_a0e4db25108747b496
>
> Hello, we sell two desk mats (catalog product pro_a0e4db25108747b496, Allcolor SP70018, 15.5" x 31.5") on the Free plan, retail 34 USD, shipping to US customers.
> 1. For a US credit card order, is the 2.9% + 0.30 USD fee charged on the item price only, on item + shipping, or on item + shipping + tax?
> 2. Is the 13 USD catalog price the full production price, or does the customization (customizationId cud_6nZ6I9XbTF6ZWVLwPt6tFQ) add a further amount? If it does, what is the USD amount?
> 3. Is any platform fee charged on top of the payment fee on the Free plan for physical catalog products?
> 4. For an order with one or two of these mats, what is the US shipping rate, is sales tax collected from the buyer, and is that tax excluded from our payout?
>
> Thank you.

## Calculation rule (actual contribution)

Per order case, integer cents: merchandise revenue (price x quantity) minus discount, minus catalog base (once per unit), minus customization addition, minus platform fee, minus payment fee, minus seller-funded shipping, minus problem reserve. Buyer-paid shipping, buyer-collected tax and net payout are required inputs but are never added or subtracted. The result is "contribution before acquisition", not net profit.

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
- treat buyer-collected tax or shipping as income.

Even after the quote is in, the tool prints `NOT_CLAIMED` for paid-acquisition readiness; that decision stays with the owner.
