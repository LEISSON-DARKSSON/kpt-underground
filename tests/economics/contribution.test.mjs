import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  computeContribution,
  formatReport,
  classProblems,
  percentFeeCents,
  paymentFeeCents,
  STATUS,
  SCENARIO_STATUS,
  ROUNDING_RULE,
} from "../../scripts/economics/contribution.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const real = () => JSON.parse(fs.readFileSync(path.join(root, "docs/economics/two-mats.json"), "utf8"));

// Synthetic numbers only. They are not real quotes.
const obs = (value) => ({ class: "OBSERVED", value, source: "synthetic test input", date: "2026-10-02" });
const unknown = () => ({ class: "UNKNOWN", value: null, closes: "synthetic: the quote that closes this" });
const planning = (value) => ({ class: "PLANNING_ASSUMPTION", value, owner: "test owner", decisionNeeded: "synthetic decision" });
const publicStd = (value) => ({ class: "PUBLIC_STANDARD", value, source: "https://example.test/pricing", date: "2026-10-02", settledTransaction: false });

const ORDER_FIELDS = ["platformFeeUsd", "paymentFeeUsd", "discountUsd", "sellerFundedShippingUsd", "supportReserveUsd", "quotedBuyerShippingUsd", "buyerCollectedTaxUsd", "actualNetPayoutUsd"];

function complete() {
  return {
    currency: "USD",
    platform: {
      paymentFeeRate: publicStd(0.029),
      paymentFeeFixedUsd: publicStd(0.3),
      extraPhysicalCatalogMarkupRate: publicStd(0),
    },
    products: [
      { key: "A", priceUsd: obs(34), catalogBaseUsd: obs(13), customizationAdditionalUsd: obs(0) },
      { key: "B", priceUsd: obs(34), catalogBaseUsd: obs(13.5), customizationAdditionalUsd: obs(0) },
    ],
    orders: [
      {
        key: "ONE-A",
        items: [{ productKey: "A", quantity: 1 }],
        platformFeeUsd: obs(1.1),
        paymentFeeUsd: obs(1.53),
        discountUsd: obs(0),
        sellerFundedShippingUsd: obs(0),
        supportReserveUsd: obs(2),
        quotedBuyerShippingUsd: obs(9.99),
        buyerCollectedTaxUsd: obs(2.87),
        actualNetPayoutUsd: obs(18.2),
        quoteCheckedAt: { class: "OBSERVED", value: "2026-10-02T12:00:00Z", source: "synthetic", date: "2026-10-02" },
        planning: { plannedBuyerShippingUsd: planning(null), plannedBuyerTaxUsd: planning(null) },
      },
      {
        key: "TWO-A-B",
        items: [
          { productKey: "A", quantity: 1 },
          { productKey: "B", quantity: 1 },
        ],
        platformFeeUsd: obs(2.2),
        paymentFeeUsd: obs(2.5),
        discountUsd: obs(3.4),
        sellerFundedShippingUsd: obs(4.25),
        supportReserveUsd: obs(4),
        quotedBuyerShippingUsd: obs(12.5),
        buyerCollectedTaxUsd: obs(5.1),
        actualNetPayoutUsd: obs(40),
        quoteCheckedAt: { class: "OBSERVED", value: "2026-10-02T12:05:00Z", source: "synthetic", date: "2026-10-02" },
        planning: { plannedBuyerShippingUsd: planning(null), plannedBuyerTaxUsd: planning(null) },
      },
    ],
  };
}

test("all-unknown model is BLOCKED_MISSING_INPUTS, prints no actual number, scenario stays separate", () => {
  const m = complete();
  for (const p of m.products) for (const f of ["priceUsd", "catalogBaseUsd", "customizationAdditionalUsd"]) p[f] = unknown();
  for (const o of m.orders) {
    for (const f of ORDER_FIELDS) o[f] = unknown();
    o.quoteCheckedAt = unknown();
  }
  const r = computeContribution(m);
  assert.equal(r.status, "BLOCKED_MISSING_INPUTS");
  assert.equal(r.orders.length, 0);
  assert.equal(r.missing.length, 2 * 3 + 2 * 9);
  assert.equal(r.paidAcquisitionReadiness, "NOT_CLAIMED");
  assert.equal(r.planningScenario.status, SCENARIO_STATUS.NOT_COMPUTABLE, "no observed price or base: nothing to plan with");
  const text = formatReport(r);
  assert.match(text, /BLOCKED_MISSING_INPUTS/);
  assert.match(text, /orders\[ONE-A\]\.paymentFeeUsd/);
  assert.doesNotMatch(text, /contribution per order/);
});

test("complete synthetic inputs give exact integer-cent arithmetic", () => {
  const r = computeContribution(complete());
  assert.equal(r.status, STATUS.COMPUTED);
  const [one, two] = r.orders;
  // 3400 - 0 - 1300 - 0 - 110 - 153 - 0 - 200 = 1637
  assert.equal(one.contributionCents, 1637);
  assert.equal(one.contributionPerUnitCents, 1637);
  assert.equal(one.lineCents.merchandiseRevenue, 3400);
  // 6800 - 340 - (1300 + 1350) - 0 - 220 - 250 - 425 - 400 = 2515
  assert.equal(two.contributionCents, 2515);
  assert.equal(two.lineCents.catalogBase, 2650);
  assert.equal(two.units, 2);
  assert.equal(two.contributionPerUnitCents, null, "2515 cents does not split into whole cents");
  for (const o of r.orders) assert.ok(Number.isInteger(o.contributionCents));
  assert.match(formatReport(r), /= contribution per order 16\.37/);
});

test("a single null line blocks the actual figure and is named; null is never read as 0", () => {
  for (const field of ORDER_FIELDS) {
    const m = complete();
    m.orders[0][field] = unknown();
    const r = computeContribution(m);
    assert.equal(r.status, STATUS.BLOCKED_MISSING_INPUTS, field);
    assert.deepEqual(r.missing, [`orders[ONE-A].${field}`]);
    assert.equal(r.orders.length, 0);
  }
  for (const field of ["priceUsd", "catalogBaseUsd", "customizationAdditionalUsd"]) {
    const m = complete();
    m.products[0][field] = unknown();
    assert.deepEqual(computeContribution(m).missing, [`products[A].${field}`]);
  }
  const m2 = complete();
  delete m2.orders[1].supportReserveUsd;
  assert.deepEqual(computeContribution(m2).missing, ["orders[TWO-A-B].supportReserveUsd"]);
  const m3 = complete();
  m3.orders[0].quoteCheckedAt = unknown();
  assert.deepEqual(computeContribution(m3).missing, ["orders[ONE-A].quoteCheckedAt"]);
});

test("actual contribution stays blocked while US shipping, buyer tax or net payout is null, even with a full planning scenario", () => {
  for (const field of ["quotedBuyerShippingUsd", "buyerCollectedTaxUsd", "actualNetPayoutUsd"]) {
    const m = complete();
    m.orders[0][field] = unknown();
    const r = computeContribution(m);
    assert.equal(r.status, STATUS.BLOCKED_MISSING_INPUTS, field);
    assert.equal(r.orders.length, 0, field);
    assert.equal(r.planningScenario.status, SCENARIO_STATUS.PLANNING_ONLY, `${field}: the scenario is separate and still labelled`);
    assert.doesNotMatch(formatReport(r), /contribution per order/);
  }
});

test("a recorded, sourced 0 is accepted and differs from null", () => {
  const m = complete();
  assert.equal(computeContribution(m).status, STATUS.COMPUTED); // discount and seller shipping are sourced 0 in ONE-A
  m.orders[0].discountUsd = unknown();
  assert.equal(computeContribution(m).status, STATUS.BLOCKED_MISSING_INPUTS);
});

test("invalid inputs are blocked, never coerced", () => {
  const cases = [
    ["string number", { class: "OBSERVED", value: "13", source: "x", date: "2026-10-02" }],
    ["negative", { class: "OBSERVED", value: -1, source: "x", date: "2026-10-02" }],
    ["three decimals", { class: "OBSERVED", value: 1.005, source: "x", date: "2026-10-02" }],
    ["NaN", { class: "OBSERVED", value: Number.NaN, source: "x", date: "2026-10-02" }],
    ["no source", { class: "OBSERVED", value: 1, date: "2026-10-02" }],
    ["no date", { class: "OBSERVED", value: 1, source: "x" }],
    ["bare number", 1],
  ];
  for (const [label, bad] of cases) {
    const m = complete();
    m.orders[0].paymentFeeUsd = bad;
    const r = computeContribution(m);
    assert.equal(r.status, STATUS.BLOCKED_INVALID_INPUT, label);
    assert.equal(r.orders.length, 0, label);
    assert.equal(r.invalid[0].input, "orders[ONE-A].paymentFeeUsd", label);
    assert.equal(r.planningScenario.status, SCENARIO_STATUS.BLOCKED_INVALID_INPUT, `${label}: no scenario number from an invalid model`);
  }
});

test("class validation: unclassified, UNKNOWN non-null, PLANNING without owner, OBSERVED null, PUBLIC_STANDARD not flagged", () => {
  const bad = (mutate) => {
    const m = complete();
    mutate(m);
    return computeContribution(m);
  };
  const noClass = bad((m) => { delete m.orders[0].paymentFeeUsd.class; });
  assert.equal(noClass.status, STATUS.BLOCKED_INVALID_INPUT);
  assert.match(noClass.invalid[0].reason, /class must be one of/);

  const unknownNotNull = bad((m) => { m.orders[0].paymentFeeUsd = { class: "UNKNOWN", value: 0, closes: "x" }; });
  assert.equal(unknownNotNull.status, STATUS.BLOCKED_INVALID_INPUT);
  assert.match(unknownNotNull.invalid[0].reason, /UNKNOWN must stay null/);
  assert.deepEqual(classProblems({ class: "UNKNOWN", value: null }), ["UNKNOWN needs closes: what figure closes it"]);

  const noOwner = bad((m) => { m.orders[0].planning.plannedBuyerShippingUsd = { class: "PLANNING_ASSUMPTION", value: 9.99, decisionNeeded: "x" }; });
  assert.equal(noOwner.status, STATUS.BLOCKED_INVALID_INPUT);
  assert.match(noOwner.invalid[0].reason, /PLANNING_ASSUMPTION needs an owner/);
  assert.equal(noOwner.planningScenario.status, SCENARIO_STATUS.BLOCKED_INVALID_INPUT);

  const observedNull = bad((m) => { m.orders[0].paymentFeeUsd = { class: "OBSERVED", value: null, source: "x", date: "2026-10-02" }; });
  assert.equal(observedNull.status, STATUS.BLOCKED_INVALID_INPUT);
  assert.match(observedNull.invalid[0].reason, /OBSERVED value is null/);

  const notSettledFlag = bad((m) => { delete m.platform.paymentFeeRate.settledTransaction; });
  assert.equal(notSettledFlag.status, STATUS.BLOCKED_INVALID_INPUT);
  assert.match(notSettledFlag.invalid[0].reason, /settledTransaction: false/);
  const noUrl = bad((m) => { m.platform.paymentFeeRate.source = "fourthwall pricing page"; });
  assert.match(noUrl.invalid[0].reason, /URL source/);
});

test("PUBLIC_STANDARD and PLANNING_ASSUMPTION never feed the actual figure; owner policy may for reserve and seller shipping", () => {
  const pub = complete();
  pub.orders[0].paymentFeeUsd = publicStd(1.29);
  const r1 = computeContribution(pub);
  assert.equal(r1.status, STATUS.BLOCKED_INVALID_INPUT);
  assert.match(r1.invalid[0].reason, /class PUBLIC_STANDARD is not allowed here/);
  assert.equal(r1.orders.length, 0);

  const plan = complete();
  plan.orders[0].paymentFeeUsd = planning(1.29);
  assert.match(computeContribution(plan).invalid[0].reason, /class PLANNING_ASSUMPTION is not allowed here/);

  const base = complete();
  base.products[0].priceUsd = publicStd(34);
  assert.equal(computeContribution(base).status, STATUS.BLOCKED_INVALID_INPUT);

  const policy = complete();
  policy.orders[0].supportReserveUsd = planning(2);
  policy.orders[0].sellerFundedShippingUsd = planning(0);
  const r2 = computeContribution(policy);
  assert.equal(r2.status, STATUS.COMPUTED);
  assert.deepEqual(r2.orders[0].planningAssumptionsUsed.sort(), ["sellerFundedShippingUsd", "supportReserveUsd"]);
  assert.equal(r2.orders[0].contributionCents, 1637);
});

test("double-count guard: the 13 USD catalog flat fee and production cost are one cost, counted once", () => {
  const m = complete();
  m.products[0].manufacturingCostUsd = obs(13); // same cost under the other name
  m.products[0].catalogFlatFeeUsd = obs(13);
  const r = computeContribution(m);
  assert.equal(r.status, STATUS.COMPUTED);
  assert.equal(r.orders[0].lineCents.catalogBase, 1300, "13 USD once, not 26");
  assert.equal(r.orders[0].contributionCents, 1637, "same contribution as with the single field");
  assert.deepEqual(r.orders[0].catalogBaseAliasesCollapsed.sort(), ["catalogBaseUsd", "catalogFlatFeeUsd", "manufacturingCostUsd"]);
  assert.equal(r.planningScenario.orders[0].catalogBaseCents, 1300);
  assert.equal(r.planningScenario.orders[0].scenarios[0].planningResidualCents, 3400 - 1300 - 129);

  // Alias only (legacy name) works the same.
  const legacy = complete();
  legacy.products[0].manufacturingCostUsd = legacy.products[0].catalogBaseUsd;
  delete legacy.products[0].catalogBaseUsd;
  assert.equal(computeContribution(legacy).orders[0].lineCents.catalogBase, 1300);

  // Two figures that differ cannot both be "the" catalog base.
  const conflict = complete();
  conflict.products[0].manufacturingCostUsd = obs(14);
  const rc = computeContribution(conflict);
  assert.equal(rc.status, STATUS.BLOCKED_INVALID_INPUT);
  assert.match(rc.invalid[0].reason, /one cost but the fields differ/);

  // Quantity multiplies the base per unit; it is still never doubled by a second field.
  const two = complete();
  two.products[0].catalogFlatFeeUsd = obs(13);
  two.orders[0].items = [{ productKey: "A", quantity: 2 }];
  assert.equal(computeContribution(two).planningScenario.orders[0].catalogBaseCents, 2600);
});

test("planningScenario is labelled PLANNING_ONLY, never profit, never readiness", () => {
  const r = computeContribution(complete());
  const s = r.planningScenario;
  assert.equal(s.status, SCENARIO_STATUS.PLANNING_ONLY);
  assert.equal(s.label, "PLANNING_ONLY");
  assert.equal(s.paidAcquisitionReadiness, "NOT_CLAIMED");
  assert.equal(s.feeBaseConfirmed, false);
  assert.equal(s.roundingRule, ROUNDING_RULE);
  assert.equal(s.feeInputs.class, "PUBLIC_STANDARD");
  assert.equal(s.feeInputs.settledTransaction, false);
  assert.doesNotMatch(Object.keys(s).join(" ") + JSON.stringify(s.orders.map((o) => Object.keys(o))), /profit|contribution/i);
  for (const o of s.orders) for (const sc of o.scenarios) assert.ok(sc.status === "PLANNING_ONLY" || sc.status === "NOT_COMPUTABLE");
  const text = formatReport(r);
  assert.match(text, /PLANNING SCENARIO: PLANNING_ONLY/);
  assert.match(text, /not profit/i);

  // Item-only: always computable. 3400 x 2.9% = 98.6 -> 99, + 30 fixed = 129; 3400 - 1300 - 129 = 1971.
  const itemOnly = s.orders[0].scenarios[0];
  assert.equal(itemOnly.id, "ITEM_ONLY");
  assert.equal(itemOnly.feeBaseCents, 3400);
  assert.equal(itemOnly.paymentFeeCents, 129);
  assert.equal(itemOnly.planningResidualCents, 1971);
  // Two mats: 6800 x 2.9% = 197.2 -> 197, fixed 30 once (not per mat) = 227; 6800 - 2650 - 227 = 3923 (B base is 13.50 here).
  assert.equal(s.orders[1].scenarios[0].paymentFeeCents, 227);
  assert.equal(s.orders[1].scenarios[0].planningResidualCents, 6800 - 2650 - 227);
});

test("shipping and tax scenarios need explicit owner planning values; null is never coerced to 0", () => {
  const none = computeContribution(complete()).planningScenario.orders[0].scenarios;
  assert.equal(none[1].status, SCENARIO_STATUS.NOT_COMPUTABLE);
  assert.deepEqual(none[1].needs, ["orders[ONE-A].planning.plannedBuyerShippingUsd"]);
  assert.equal(none[1].feeBaseCents, undefined);
  assert.deepEqual(none[2].needs, ["orders[ONE-A].planning.plannedBuyerShippingUsd", "orders[ONE-A].planning.plannedBuyerTaxUsd"]);

  const m = complete();
  m.orders[0].planning.plannedBuyerShippingUsd = planning(9.99);
  const withShip = computeContribution(m).planningScenario.orders[0].scenarios;
  // base 3400 + 999 = 4399; 4399 x 2.9% = 127.571 -> 128; + 30 = 158; 3400 - 1300 - 158 = 1942
  assert.equal(withShip[1].status, SCENARIO_STATUS.PLANNING_ONLY);
  assert.equal(withShip[1].feeBaseCents, 4399);
  assert.equal(withShip[1].paymentFeeCents, 158);
  assert.equal(withShip[1].planningResidualCents, 1942, "buyer shipping raises the fee base but is never added as revenue");
  assert.equal(withShip[2].status, SCENARIO_STATUS.NOT_COMPUTABLE, "tax scenario still needs a tax planning value");

  m.orders[0].planning.plannedBuyerTaxUsd = planning(2.8);
  const withBoth = computeContribution(m).planningScenario.orders[0].scenarios;
  // base 4679; 4679 x 2.9% = 135.691 -> 136; + 30 = 166; 3400 - 1300 - 166 = 1934
  assert.equal(withBoth[2].feeBaseCents, 4679);
  assert.equal(withBoth[2].paymentFeeCents, 166);
  assert.equal(withBoth[2].planningResidualCents, 1934);
  assert.equal(computeContribution(m).planningScenario.orders[0].merchandiseCents, 3400, "tax and shipping never become merchandise revenue");

  // A planning value in an OBSERVED node is a class error, not a scenario input.
  const wrong = complete();
  wrong.orders[0].planning.plannedBuyerShippingUsd = obs(9.99);
  assert.equal(computeContribution(wrong).planningScenario.orders[0].scenarios[1].status, SCENARIO_STATUS.NOT_COMPUTABLE);
});

test("2.9% on 3400 cents is computed in integer cents, rounded half up once per transaction", () => {
  assert.equal(percentFeeCents(3400, 29000), 99, "98.6 rounds up to 99");
  assert.equal(paymentFeeCents(3400, 29000, 30), 129);
  assert.equal(percentFeeCents(500, 29000), 15, "exactly 14.5 rounds half up to 15");
  assert.equal(percentFeeCents(100, 29000), 3, "2.9 rounds to 3");
  assert.equal(percentFeeCents(10, 29000), 0, "0.29 rounds to 0");
  assert.equal(percentFeeCents(0, 29000), 0);
  assert.equal(percentFeeCents(3400, 0), 0, "a published 0 markup adds nothing");
  for (const base of [1, 99, 3400, 6800, 123456]) assert.ok(Number.isInteger(percentFeeCents(base, 29000)));
  assert.match(ROUNDING_RULE, /half up/);
  assert.match(ROUNDING_RULE, /once per transaction/);
});

test("buyer-collected tax and buyer-paid shipping are excluded from revenue and actual contribution", () => {
  const base = computeContribution(complete());
  const m = complete();
  m.orders[0].buyerCollectedTaxUsd = obs(999.99);
  m.orders[0].quotedBuyerShippingUsd = obs(123.45);
  m.orders[0].actualNetPayoutUsd = obs(5.55);
  m.orders[1].buyerCollectedTaxUsd = obs(55.55);
  const changed = computeContribution(m);
  assert.equal(changed.status, STATUS.COMPUTED);
  for (let i = 0; i < 2; i++) {
    assert.equal(changed.orders[i].contributionCents, base.orders[i].contributionCents);
    assert.equal(changed.orders[i].lineCents.merchandiseRevenue, base.orders[i].lineCents.merchandiseRevenue);
  }
  assert.equal(changed.orders[0].excludedPassThroughCents.buyerCollectedTax, 99999);
  assert.equal(changed.orders[0].excludedPassThroughCents.buyerPaidShipping, 12345);
  assert.equal(changed.orders[0].crossCheckOnlyCents.actualNetPayout, 555, "net payout is a cross-check, never arithmetic");
});

test("unknown product or bad quantity in an order is invalid", () => {
  const m = complete();
  m.orders[0].items = [{ productKey: "ZZZ", quantity: 1 }];
  assert.equal(computeContribution(m).status, STATUS.BLOCKED_INVALID_INPUT);
  const q = complete();
  q.orders[0].items = [{ productKey: "A", quantity: 0 }];
  assert.equal(computeContribution(q).status, STATUS.BLOCKED_INVALID_INPUT);
});

test("the real docs/economics/two-mats.json: actual contribution BLOCKED, planning scenario PLANNING_ONLY", () => {
  const model = real();
  const r = computeContribution(model);
  assert.equal(model.schema, "kpt-two-mats-economics/2");
  assert.equal(model.products.length, 2);
  assert.deepEqual(model.products.map((p) => p.slug).sort(), [
    "keep-it-underground-signal-01-desk-mat",
    "keep-it-underground-subsurface-desk-mat",
  ]);
  assert.equal(model.orders.length, 3);
  assert.deepEqual(r.invalid, [], "every node is validly classified");
  assert.equal(r.status, STATUS.BLOCKED_MISSING_INPUTS);
  assert.equal(r.orders.length, 0);
  assert.equal(r.missing.length, 2 + 3 * 9);
  assert.ok(r.missing.includes("orders[ORDER-SIGNAL-X1].paymentFeeUsd"));
  assert.ok(r.missing.includes("orders[ORDER-SIGNAL-X1].buyerCollectedTaxUsd"));
  assert.ok(r.missing.includes("orders[ORDER-SIGNAL-X1].actualNetPayoutUsd"));
  assert.ok(r.missing.includes("orders[ORDER-TWO-MATS-SIGNAL-X1-SUBSURFACE-X1].quotedBuyerShippingUsd"));
  assert.ok(r.missing.includes("products[SIGNAL-DESK-MAT].customizationAdditionalUsd"));
  assert.ok(!r.missing.some((m) => m.endsWith(".catalogBaseUsd") || m.endsWith(".priceUsd")), "price and the 13 USD catalog base are observed");
  assert.equal(r.paidAcquisitionReadiness, "NOT_CLAIMED");

  const s = r.planningScenario;
  assert.equal(s.status, SCENARIO_STATUS.PLANNING_ONLY);
  const [signal, subsurface, both] = s.orders;
  assert.equal(signal.scenarios[0].planningResidualCents, 1971);
  assert.equal(subsurface.scenarios[0].planningResidualCents, 1971);
  assert.equal(both.catalogBaseCents, 2600);
  assert.equal(both.scenarios[0].planningResidualCents, 3973);
  for (const o of s.orders) {
    assert.equal(o.scenarios[1].status, SCENARIO_STATUS.NOT_COMPUTABLE, "no owner shipping planning value supplied");
    assert.equal(o.scenarios[2].status, SCENARIO_STATUS.NOT_COMPUTABLE);
  }
});

test("real model input classes: observed base and plan, public-standard fees, unknowns stay null", () => {
  const model = real();
  for (const p of model.products) {
    assert.equal(p.priceUsd.class, "OBSERVED");
    assert.equal(p.priceUsd.value, 34);
    assert.equal(p.catalogBaseUsd.class, "OBSERVED");
    assert.equal(p.catalogBaseUsd.value, 13);
    assert.match(p.catalogBaseUsd.source, /pro_a0e4db25108747b496/);
    assert.equal(p.manufacturingCostUsd, undefined, "the 13 USD has one field, not a second production-cost line");
    assert.equal(p.catalogFlatFeeUsd, undefined);
    assert.equal(p.customizationAdditionalUsd.class, "UNKNOWN", "customization quote amount is not confirmed");
    assert.equal(p.customizationAdditionalUsd.value, null);
  }
  const pl = model.platform;
  assert.equal(pl.plan.class, "OBSERVED");
  assert.equal(pl.plan.value, "Free");
  assert.equal(pl.plan.pro, false);
  assert.equal(pl.paymentFeeRate.class, "PUBLIC_STANDARD");
  assert.equal(pl.paymentFeeRate.value, 0.029);
  assert.equal(pl.paymentFeeFixedUsd.class, "PUBLIC_STANDARD");
  assert.equal(pl.paymentFeeFixedUsd.value, 0.3);
  assert.equal(pl.extraPhysicalCatalogMarkupRate.class, "PUBLIC_STANDARD");
  assert.equal(pl.extraPhysicalCatalogMarkupRate.value, 0);
  for (const f of ["paymentFeeRate", "paymentFeeFixedUsd", "extraPhysicalCatalogMarkupRate"]) {
    assert.equal(pl[f].settledTransaction, false);
    assert.match(pl[f].source, /^https:\/\/fourthwall\.com\/pricing/);
  }
  assert.equal(pl.paymentFeeAssessmentBase.class, "UNKNOWN");
  assert.equal(pl.paymentFeeAssessmentBase.value, null);
  for (const o of model.orders) {
    for (const f of ORDER_FIELDS) {
      assert.equal(o[f].class, "UNKNOWN", `${o.key}.${f}`);
      assert.equal(o[f].value, null, `${o.key}.${f}`);
    }
    assert.equal(o.planning.plannedBuyerShippingUsd.class, "PLANNING_ASSUMPTION");
    assert.equal(o.planning.plannedBuyerShippingUsd.value, null, "no planning shipping value was supplied by the owner");
    assert.ok(o.planning.plannedBuyerShippingUsd.owner);
    assert.equal(o.paidAcquisitionApproved, false);
  }
});

test("the real model classifies every value, never stores a bare 0 for an unknown, keeps excluded figures", () => {
  const model = real();
  const walk = (node, where) => {
    if (!node || typeof node !== "object") return;
    if (!Array.isArray(node) && "value" in node) {
      assert.deepEqual(classProblems(node), [], `${where}: ${JSON.stringify(classProblems(node))}`);
      if (node.class === "UNKNOWN") assert.equal(node.value, null, `${where}: unknown must be null, not 0`);
      if (node.value === 0 && node.class !== "PLANNING_ASSUMPTION") assert.ok(node.source && node.date, `${where}: a real 0 needs source and date`);
      return;
    }
    for (const [k, v] of Object.entries(node)) if (!["excludedFigures", "valueFormat", "inputClasses", "items"].includes(k)) walk(v, `${where}.${k}`);
  };
  walk({ platform: model.platform, products: model.products, orders: model.orders }, "model");
  const excluded = JSON.stringify(model.excludedFigures);
  assert.match(excluded, /80\.49/);
  assert.match(excluded, /80\.67/);
  assert.match(excluded, /Estonia/);
  // The Estonia sample totals must not appear as live inputs anywhere else.
  const inputs = JSON.stringify({ platform: model.platform, products: model.products, orders: model.orders });
  assert.doesNotMatch(inputs, /"value":\s*80\.(49|67)/);
});
