import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { computeContribution, formatReport, STATUS } from "../../scripts/economics/contribution.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const real = () => JSON.parse(fs.readFileSync(path.join(root, "docs/economics/two-mats.json"), "utf8"));

const known = (value) => ({ value, source: "synthetic test input", date: "2026-10-02" });
const unknown = () => ({ value: null, missing: "test" });

// Synthetic numbers only. They are not real quotes.
function complete() {
  return {
    currency: "USD",
    products: [
      { key: "A", priceUsd: known(34), manufacturingCostUsd: known(13) },
      { key: "B", priceUsd: known(34), manufacturingCostUsd: known(13.5) },
    ],
    orders: [
      {
        key: "ONE-A",
        items: [{ productKey: "A", quantity: 1 }],
        platformFeeUsd: known(1.1),
        paymentFeeUsd: known(1.53),
        discountUsd: known(0),
        sellerFundedShippingUsd: known(0),
        supportReserveUsd: known(2),
        quotedBuyerShippingUsd: known(9.99),
        buyerCollectedTaxUsd: known(2.87),
        quoteCheckedAt: { value: "2026-10-02T12:00:00Z" },
      },
      {
        key: "TWO-A-B",
        items: [
          { productKey: "A", quantity: 1 },
          { productKey: "B", quantity: 1 },
        ],
        platformFeeUsd: known(2.2),
        paymentFeeUsd: known(2.5),
        discountUsd: known(3.4),
        sellerFundedShippingUsd: known(4.25),
        supportReserveUsd: known(4),
        quotedBuyerShippingUsd: known(12.5),
        buyerCollectedTaxUsd: unknown(),
        quoteCheckedAt: { value: "2026-10-02T12:05:00Z" },
      },
    ],
  };
}

test("all-null model is BLOCKED_MISSING_INPUTS and prints no number", () => {
  const m = complete();
  for (const p of m.products) {
    p.priceUsd = unknown();
    p.manufacturingCostUsd = unknown();
  }
  for (const o of m.orders) {
    for (const f of ["platformFeeUsd", "paymentFeeUsd", "discountUsd", "sellerFundedShippingUsd", "supportReserveUsd", "quotedBuyerShippingUsd"]) {
      o[f] = unknown();
    }
    o.quoteCheckedAt = unknown();
  }
  const r = computeContribution(m);
  assert.equal(r.status, STATUS.BLOCKED_MISSING_INPUTS);
  assert.equal(r.status, "BLOCKED_MISSING_INPUTS");
  assert.equal(r.orders.length, 0);
  assert.equal(r.missing.length, 4 + 2 * 7);
  assert.equal(r.paidAcquisitionReadiness, "NOT_CLAIMED");
  const text = formatReport(r);
  assert.match(text, /BLOCKED_MISSING_INPUTS/);
  assert.match(text, /orders\[ONE-A\]\.paymentFeeUsd/);
  assert.doesNotMatch(text, /contribution per order/);
});

test("complete synthetic inputs give exact integer-cent arithmetic", () => {
  const r = computeContribution(complete());
  assert.equal(r.status, STATUS.COMPUTED);
  const [one, two] = r.orders;
  // 3400 - 0 - 1300 - 110 - 153 - 0 - 200 = 1637
  assert.equal(one.contributionCents, 1637);
  assert.equal(one.contributionPerUnitCents, 1637);
  assert.equal(one.lineCents.merchandiseRevenue, 3400);
  // 6800 - 340 - (1300 + 1350) - 220 - 250 - 425 - 400 = 2515
  assert.equal(two.contributionCents, 2515);
  assert.equal(two.lineCents.manufacturingCost, 2650);
  assert.equal(two.units, 2);
  assert.equal(two.contributionPerUnitCents, null, "2515 cents does not split into whole cents");
  for (const o of r.orders) assert.ok(Number.isInteger(o.contributionCents));
  assert.match(formatReport(r), /= contribution per order 16\.37/);
});

test("a single null line blocks the whole model and is named; null is never read as 0", () => {
  for (const field of ["platformFeeUsd", "paymentFeeUsd", "discountUsd", "sellerFundedShippingUsd", "supportReserveUsd", "quotedBuyerShippingUsd"]) {
    const m = complete();
    m.orders[0][field] = unknown();
    const r = computeContribution(m);
    assert.equal(r.status, STATUS.BLOCKED_MISSING_INPUTS, field);
    assert.deepEqual(r.missing, [`orders[ONE-A].${field}`]);
    assert.equal(r.orders.length, 0);
  }
  const m = complete();
  m.products[0].manufacturingCostUsd = unknown();
  const r = computeContribution(m);
  assert.equal(r.status, STATUS.BLOCKED_MISSING_INPUTS);
  assert.deepEqual(r.missing, ["products[A].manufacturingCostUsd"]);
  const m2 = complete();
  delete m2.orders[1].supportReserveUsd;
  assert.deepEqual(computeContribution(m2).missing, ["orders[TWO-A-B].supportReserveUsd"]);
  const m3 = complete();
  m3.orders[0].quoteCheckedAt = unknown();
  assert.deepEqual(computeContribution(m3).missing, ["orders[ONE-A].quoteCheckedAt"]);
});

test("a recorded, sourced 0 is accepted and differs from null", () => {
  const m = complete();
  assert.equal(computeContribution(m).status, STATUS.COMPUTED); // discount and seller shipping are sourced 0 in order ONE-A
  m.orders[0].discountUsd = unknown();
  assert.equal(computeContribution(m).status, STATUS.BLOCKED_MISSING_INPUTS);
});

test("invalid inputs are blocked, never coerced", () => {
  const cases = [
    ["string number", { value: "13", source: "x", date: "2026-10-02" }],
    ["negative", { value: -1, source: "x", date: "2026-10-02" }],
    ["three decimals", { value: 1.005, source: "x", date: "2026-10-02" }],
    ["NaN", { value: Number.NaN, source: "x", date: "2026-10-02" }],
    ["no source", { value: 1, date: "2026-10-02" }],
    ["no date", { value: 1, source: "x" }],
    ["bare number", 1],
  ];
  for (const [label, bad] of cases) {
    const m = complete();
    m.orders[0].paymentFeeUsd = bad;
    const r = computeContribution(m);
    assert.equal(r.status, STATUS.BLOCKED_INVALID_INPUT, label);
    assert.equal(r.orders.length, 0, label);
    assert.equal(r.invalid[0].input, "orders[ONE-A].paymentFeeUsd", label);
  }
});

test("buyer-collected tax and buyer-paid shipping are excluded from revenue and contribution", () => {
  const base = computeContribution(complete());
  const m = complete();
  m.orders[0].buyerCollectedTaxUsd = known(999.99);
  m.orders[0].quotedBuyerShippingUsd = known(123.45);
  m.orders[1].buyerCollectedTaxUsd = known(55.55);
  const changed = computeContribution(m);
  assert.equal(changed.status, STATUS.COMPUTED);
  for (let i = 0; i < 2; i++) {
    assert.equal(changed.orders[i].contributionCents, base.orders[i].contributionCents);
    assert.equal(changed.orders[i].lineCents.merchandiseRevenue, base.orders[i].lineCents.merchandiseRevenue);
  }
  assert.equal(changed.orders[0].excludedPassThroughCents.buyerCollectedTax, 99999);
  assert.equal(changed.orders[0].excludedPassThroughCents.buyerPaidShipping, 12345);
  assert.equal(base.orders[1].excludedPassThroughCents.buyerCollectedTax, null);
  // Tax may stay null without blocking: it is optional and never revenue.
  assert.equal(base.status, STATUS.COMPUTED);
});

test("unknown product or bad quantity in an order is invalid", () => {
  const m = complete();
  m.orders[0].items = [{ productKey: "ZZZ", quantity: 1 }];
  assert.equal(computeContribution(m).status, STATUS.BLOCKED_INVALID_INPUT);
  const q = complete();
  q.orders[0].items = [{ productKey: "A", quantity: 0 }];
  assert.equal(computeContribution(q).status, STATUS.BLOCKED_INVALID_INPUT);
});

test("the real docs/economics/two-mats.json is BLOCKED until every required line is filled", () => {
  const model = real();
  const r = computeContribution(model);
  assert.equal(model.products.length, 2);
  assert.deepEqual(model.products.map((p) => p.slug).sort(), [
    "keep-it-underground-signal-01-desk-mat",
    "keep-it-underground-subsurface-desk-mat",
  ]);
  assert.equal(model.orders.length, 3);
  assert.equal(r.status, STATUS.BLOCKED_MISSING_INPUTS);
  assert.equal(r.orders.length, 0);
  assert.ok(r.missing.includes("orders[ORDER-SIGNAL-X1].paymentFeeUsd"));
  assert.ok(r.missing.includes("orders[ORDER-TWO-MATS-SIGNAL-X1-SUBSURFACE-X1].quotedBuyerShippingUsd"));
});

test("the real model never stores a bare 0 for an unknown and keeps recorded facts sourced", () => {
  const model = real();
  const walk = (node, where) => {
    if (node && typeof node === "object" && !Array.isArray(node) && "value" in node && where !== "excludedFigures") {
      if (node.value === null) assert.ok(typeof node.missing === "string" && node.missing.length > 20, `${where}: null needs a missing note`);
      else if (typeof node.value === "number") {
        assert.ok(node.source && node.date, `${where}: number needs source and date`);
        assert.ok(node.value > 0, `${where}: unknown must be null, not 0`);
      }
    }
    if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) if (k !== "excludedFigures") walk(v, `${where}.${k}`);
  };
  walk(model, "model");
  for (const o of model.orders) assert.equal(o.paidAcquisitionApproved, false);
  const excluded = JSON.stringify(model.excludedFigures);
  assert.match(excluded, /80\.49/);
  assert.match(excluded, /80\.67/);
  assert.match(excluded, /Estonia/);
  // The Estonia sample totals must not appear as live inputs anywhere else.
  const inputs = JSON.stringify({ products: model.products, orders: model.orders });
  assert.doesNotMatch(inputs, /"value":\s*80\.(49|67)/);
});
