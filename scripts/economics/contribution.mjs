// H06: contribution before acquisition for the two desk mats.
// Read-only. No dependencies. Usage: node scripts/economics/contribution.mjs [model.json] [--json]
//
// Two separate outputs:
//   1. ACTUAL contribution. A number comes out only when EVERY required input is a
//      non-null OBSERVED number with source and date (an owner PLANNING_ASSUMPTION is also
//      accepted for discountUsd, sellerFundedShippingUsd and supportReserveUsd). Otherwise the
//      status is BLOCKED_MISSING_INPUTS (or BLOCKED_INVALID_INPUT) and nothing derived from
//      retail is printed.
//   2. planningScenario. Status PLANNING_ONLY. Built only from OBSERVED + PUBLIC_STANDARD +
//      explicitly supplied PLANNING_ASSUMPTION values. It is never profit, never contribution,
//      never paid-acquisition readiness. The fee-base variants use the OBSERVED buyer
//      shipping and tax quote lines when present (and a quoteCheckedAt); otherwise the owner's
//      planning fallback values; otherwise they are NOT_COMPUTABLE.
//
// Every input carries a class: OBSERVED | PUBLIC_STANDARD | PLANNING_ASSUMPTION | UNKNOWN.
// null is never coerced to 0. The 13 USD catalog base (catalog flat fee == manufacturing cost)
// is counted once. Buyer-collected tax and buyer-paid shipping are validated and read as inputs
// but are never revenue and never added to or subtracted from contribution; they only set the
// fee base in the planning scenario. An observed quote is valid for its own destination and date only.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const STATUS = Object.freeze({
  COMPUTED: "COMPUTED",
  BLOCKED_MISSING_INPUTS: "BLOCKED_MISSING_INPUTS",
  BLOCKED_INVALID_INPUT: "BLOCKED_INVALID_INPUT",
});

export const SCENARIO_STATUS = Object.freeze({
  PLANNING_ONLY: "PLANNING_ONLY",
  NOT_COMPUTABLE: "NOT_COMPUTABLE",
  BLOCKED_INVALID_INPUT: "BLOCKED_INVALID_INPUT",
});

export const INPUT_CLASS = Object.freeze({
  OBSERVED: "OBSERVED",
  PUBLIC_STANDARD: "PUBLIC_STANDARD",
  PLANNING_ASSUMPTION: "PLANNING_ASSUMPTION",
  UNKNOWN: "UNKNOWN",
});

export const FEE_BASE = Object.freeze({
  ITEM_ONLY: "ITEM_ONLY",
  ITEM_PLUS_SHIPPING: "ITEM_PLUS_SHIPPING",
  ITEM_PLUS_SHIPPING_PLUS_TAX: "ITEM_PLUS_SHIPPING_PLUS_TAX",
});

export const ROUNDING_RULE =
  "Percentage fee = baseCents x rate, rounded half up to a whole cent once per transaction (integer ppm arithmetic); the fixed fee is added once per transaction, not per unit. Fourthwall's real rounding is not confirmed.";

// Canonical product cost field and its aliases. They name ONE cost: catalog flat fee == production cost.
const CATALOG_BASE_FIELD = "catalogBaseUsd";
const CATALOG_BASE_ALIASES = [CATALOG_BASE_FIELD, "manufacturingCostUsd", "catalogFlatFeeUsd", "productionCostUsd"];
const ACTUAL_ONLY = [INPUT_CLASS.OBSERVED];
const ACTUAL_OR_OWNER_POLICY = [INPUT_CLASS.OBSERVED, INPUT_CLASS.PLANNING_ASSUMPTION];

// Per product (once): sale price, catalog base, and the customization amount ADDITIONAL to the base.
const PRODUCT_FIELDS = ["priceUsd", CATALOG_BASE_FIELD, "customizationAdditionalUsd"];
// Per order: every line is required for the ACTUAL contribution.
const ORDER_MONEY_FIELDS = [
  "platformFeeUsd",
  "paymentFeeUsd",
  "discountUsd",
  "sellerFundedShippingUsd",
  "supportReserveUsd",
  "quotedBuyerShippingUsd",
  "buyerCollectedTaxUsd",
  "actualNetPayoutUsd",
];
const ORDER_ALLOWED_CLASSES = {
  discountUsd: ACTUAL_OR_OWNER_POLICY,
  sellerFundedShippingUsd: ACTUAL_OR_OWNER_POLICY,
  supportReserveUsd: ACTUAL_OR_OWNER_POLICY,
};
// Read and required, but never added or subtracted.
const PASS_THROUGH = ["quotedBuyerShippingUsd", "buyerCollectedTaxUsd"];
// Optional observed quote total: when present it is read and cross-checked against
// merchandise - discount + buyer shipping + buyer tax. Never revenue, never contribution.
const OPTIONAL_PASS_THROUGH = ["quotedBuyerTotalUsd"];
const CROSS_CHECK_ONLY = ["actualNetPayoutUsd"];
const ORDER_DATE_FIELD = "quoteCheckedAt";

const SKIP_KEYS = new Set(["items", "excludedFigures", "valueFormat", "inputClasses"]);
const isText = (v) => typeof v === "string" && v.trim().length > 0;
const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

// ---------- class validation ----------

// Returns a list of problems for one classified node, [] when valid.
export function classProblems(node) {
  const c = node.class;
  if (!Object.values(INPUT_CLASS).includes(c)) return [`class must be one of ${Object.values(INPUT_CLASS).join(", ")}`];
  const v = node.value;
  const p = [];
  switch (c) {
    case INPUT_CLASS.OBSERVED:
      if (v === null || v === undefined) p.push("OBSERVED value is null; an unread figure is UNKNOWN");
      if (!isText(node.source) || !isText(node.date)) p.push("OBSERVED needs source and date");
      break;
    case INPUT_CLASS.PUBLIC_STANDARD:
      if (v === null || v === undefined) p.push("PUBLIC_STANDARD value is null; an unpublished figure is UNKNOWN");
      if (!isText(node.source) || !/^https?:\/\//.test(node.source) || !isText(node.date)) p.push("PUBLIC_STANDARD needs a URL source and a date");
      if (node.settledTransaction !== false) p.push("PUBLIC_STANDARD must declare settledTransaction: false");
      break;
    case INPUT_CLASS.PLANNING_ASSUMPTION:
      if (!isText(node.owner)) p.push("PLANNING_ASSUMPTION needs an owner");
      if (!isText(node.decisionNeeded)) p.push("PLANNING_ASSUMPTION needs decisionNeeded");
      break;
    case INPUT_CLASS.UNKNOWN:
      if (v !== null) p.push("UNKNOWN must stay null; never 0 and never a guess");
      if (!isText(node.closes)) p.push("UNKNOWN needs closes: what figure closes it");
      break;
    default:
      break;
  }
  return p;
}

// Walks every node that has a `value` and checks its class. Returns { invalid, flagged }.
function walkClasses(model) {
  const invalid = [];
  const flagged = new Set();
  const visit = (node, where) => {
    if (!node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach((el, i) => visit(el, `${where}[${isPlainObject(el) && isText(el.key) ? el.key : i}]`));
      return;
    }
    if (Object.prototype.hasOwnProperty.call(node, "value")) {
      const problems = classProblems(node);
      for (const reason of problems) invalid.push({ input: where, reason });
      if (problems.length) flagged.add(where);
      return;
    }
    for (const [k, v] of Object.entries(node)) {
      if (SKIP_KEYS.has(k)) continue;
      visit(v, where ? `${where}.${k}` : k);
    }
  };
  for (const k of ["platform", "products", "orders"]) if (model && k in model) visit(model[k], k);
  return { invalid, flagged };
}

// ---------- readers (integer cents, null never coerced) ----------

// Returns { ok: true, cents, cls } | { ok: false, kind: "missing" | "invalid", reason }.
// The null check comes BEFORE any arithmetic: in JS, Number(null) and null * 100 are 0.
function readMoney(field, allowed) {
  if (field === undefined || field === null) return { ok: false, kind: "missing", reason: "field absent" };
  if (!isPlainObject(field)) {
    return { ok: false, kind: "invalid", reason: "expected a classified { class, value, ... } node; a bare value has no class or source" };
  }
  const v = field.value;
  if (v === null || v === undefined) return { ok: false, kind: "missing", reason: "value is null" };
  if (allowed && !allowed.includes(field.class)) {
    return { ok: false, kind: "invalid", reason: `class ${field.class ?? "none"} is not allowed here (allowed: ${allowed.join(", ")})` };
  }
  if (typeof v !== "number" || !Number.isFinite(v)) {
    return { ok: false, kind: "invalid", reason: "value is not a finite number (strings are never coerced)" };
  }
  if (v < 0) return { ok: false, kind: "invalid", reason: "negative amount" };
  const scaled = v * 100;
  const cents = Math.round(scaled);
  if (Math.abs(scaled - cents) > 1e-6) return { ok: false, kind: "invalid", reason: "more than two decimals" };
  if (field.class !== INPUT_CLASS.PLANNING_ASSUMPTION && (!isText(field.source) || !isText(field.date))) {
    return { ok: false, kind: "invalid", reason: "number without source and date" };
  }
  return { ok: true, cents, cls: field.class };
}

function readRatePpm(field, allowed) {
  if (field === undefined || field === null) return { ok: false, kind: "missing", reason: "field absent" };
  if (!isPlainObject(field)) return { ok: false, kind: "invalid", reason: "expected a classified node" };
  const v = field.value;
  if (v === null || v === undefined) return { ok: false, kind: "missing", reason: "value is null" };
  if (!allowed.includes(field.class)) return { ok: false, kind: "invalid", reason: `class ${field.class ?? "none"} is not allowed here` };
  if (typeof v !== "number" || !Number.isFinite(v) || v < 0 || v > 1) return { ok: false, kind: "invalid", reason: "rate must be a finite number between 0 and 1" };
  const scaled = v * 1e6;
  const ppm = Math.round(scaled);
  if (Math.abs(scaled - ppm) > 1e-6) return { ok: false, kind: "invalid", reason: "rate has more than six decimals" };
  return { ok: true, ppm, cls: field.class };
}

function readDate(field) {
  if (field === undefined || field === null) return { ok: false, kind: "missing", reason: "field absent" };
  const v = typeof field === "object" ? field.value : undefined;
  if (v === null || v === undefined) return { ok: false, kind: "missing", reason: "value is null" };
  if (field.class !== INPUT_CLASS.OBSERVED) return { ok: false, kind: "invalid", reason: "class must be OBSERVED" };
  if (!isText(v) || Number.isNaN(Date.parse(v))) return { ok: false, kind: "invalid", reason: "not an ISO date" };
  return { ok: true, value: v };
}

// ---------- fee arithmetic ----------

// baseCents x ratePpm / 1_000_000, rounded half up. Integer arithmetic only.
export function percentFeeCents(baseCents, ratePpm) {
  return Math.floor((baseCents * ratePpm + 500000) / 1000000);
}

export function paymentFeeCents(baseCents, ratePpm, fixedCents) {
  return percentFeeCents(baseCents, ratePpm) + fixedCents;
}

// ---------- model ----------

export function computeContribution(model) {
  const missing = [];
  const invalid = [];
  const classWalk = walkClasses(model);
  invalid.push(...classWalk.invalid);
  const note = (where, r) => {
    if (r.kind === "missing") missing.push(where);
    else if (!classWalk.flagged.has(where)) invalid.push({ input: where, reason: r.reason });
  };

  const products = new Map();
  const productList = Array.isArray(model?.products) ? model.products : [];
  const orderList = Array.isArray(model?.orders) ? model.orders : [];
  if (productList.length === 0) invalid.push({ input: "products", reason: "no products" });
  if (orderList.length === 0) invalid.push({ input: "orders", reason: "no orders" });

  for (const p of productList) {
    const parsed = { key: p?.key };
    for (const f of PRODUCT_FIELDS) {
      if (f === CATALOG_BASE_FIELD) {
        // The catalog flat fee and the production cost are ONE cost. Collapse the aliases; never add them.
        const present = CATALOG_BASE_ALIASES.filter((a) => p?.[a] !== undefined);
        if (present.length === 0) {
          missing.push(`products[${p?.key}].${CATALOG_BASE_FIELD}`);
          continue;
        }
        const reads = present.map((a) => ({ a, r: readMoney(p[a], ACTUAL_ONLY) }));
        let allOk = true;
        for (const { a, r } of reads) {
          if (!r.ok) {
            allOk = false;
            note(`products[${p?.key}].${a}`, r);
          }
        }
        if (!allOk) continue;
        if (new Set(reads.map(({ r }) => r.cents)).size > 1) {
          invalid.push({
            input: `products[${p?.key}].${present.join("/")}`,
            reason: "catalog flat fee and production cost are one cost but the fields differ; record it once",
          });
          continue;
        }
        parsed[CATALOG_BASE_FIELD] = reads[0].r.cents;
        parsed.catalogBaseAliasesCollapsed = present;
        continue;
      }
      const r = readMoney(p?.[f], ACTUAL_ONLY);
      if (r.ok) parsed[f] = r.cents;
      else note(`products[${p?.key}].${f}`, r);
    }
    products.set(p?.key, parsed);
  }

  const parsedOrders = [];
  for (const o of orderList) {
    const po = { key: o?.key, items: [], lines: {}, classes: {}, raw: o };
    for (const f of ORDER_MONEY_FIELDS) {
      const r = readMoney(o?.[f], ORDER_ALLOWED_CLASSES[f] ?? ACTUAL_ONLY);
      if (r.ok) {
        po.lines[f] = r.cents;
        po.classes[f] = r.cls;
      } else note(`orders[${o?.key}].${f}`, r);
    }
    for (const f of OPTIONAL_PASS_THROUGH) {
      if (o?.[f] === undefined) continue; // optional; an absent total is fine, a bad one is reported
      const r = readMoney(o[f], ACTUAL_ONLY);
      if (r.ok) po.lines[f] = r.cents;
      else if (r.kind !== "missing") note(`orders[${o?.key}].${f}`, r);
    }
    const d = readDate(o?.[ORDER_DATE_FIELD]);
    if (d.ok) po.quoteCheckedAt = d.value;
    else note(`orders[${o?.key}].${ORDER_DATE_FIELD}`, d);

    const items = Array.isArray(o?.items) ? o.items : [];
    if (items.length === 0) invalid.push({ input: `orders[${o?.key}].items`, reason: "no items" });
    for (const it of items) {
      if (!products.has(it?.productKey)) {
        invalid.push({ input: `orders[${o?.key}].items`, reason: `unknown product ${it?.productKey}` });
      } else if (!Number.isInteger(it?.quantity) || it.quantity < 1) {
        invalid.push({ input: `orders[${o?.key}].items[${it?.productKey}].quantity`, reason: "quantity must be a positive integer" });
      } else {
        po.items.push({ productKey: it.productKey, quantity: it.quantity });
      }
    }
    parsedOrders.push(po);
  }

  // Consistency of an observed quote: total = merchandise - discount + buyer shipping + buyer tax.
  // A validation only. The total, shipping and tax never enter revenue or contribution.
  for (const po of parsedOrders) {
    const l = po.lines;
    if (l.quotedBuyerTotalUsd === undefined || l.quotedBuyerShippingUsd === undefined || l.buyerCollectedTaxUsd === undefined || l.discountUsd === undefined) continue;
    let merchandise = 0;
    let priced = po.items.length > 0;
    for (const it of po.items) {
      const price = products.get(it.productKey)?.priceUsd;
      if (price === undefined) priced = false;
      else merchandise += price * it.quantity;
    }
    if (!priced) continue;
    const expected = merchandise - l.discountUsd + l.quotedBuyerShippingUsd + l.buyerCollectedTaxUsd;
    if (expected !== l.quotedBuyerTotalUsd) {
      invalid.push({
        input: `orders[${po.key}].quotedBuyerTotalUsd`,
        reason: `observed total ${l.quotedBuyerTotalUsd} cents does not equal merchandise - discount + buyer shipping + buyer tax = ${expected} cents`,
      });
    }
  }

  const base = {
    currency: model?.currency ?? "USD",
    measure: "ACTUAL contribution before acquisition. Not net profit. Not a paid-acquisition decision.",
    paidAcquisitionReadiness: "NOT_CLAIMED",
    requiredInputs: {
      perProduct: PRODUCT_FIELDS,
      perOrder: [...ORDER_MONEY_FIELDS, ORDER_DATE_FIELD],
      passThroughNeverRevenue: PASS_THROUGH,
      optionalPassThroughNeverRevenue: OPTIONAL_PASS_THROUGH,
      crossCheckOnly: CROSS_CHECK_ONLY,
      allowedClassesForActual:
        "OBSERVED (discountUsd, sellerFundedShippingUsd and supportReserveUsd also accept an owner PLANNING_ASSUMPTION); PUBLIC_STANDARD never feeds the actual figure",
    },
  };

  const planningScenario = computePlanningScenario(model, products, parsedOrders, invalid);

  if (missing.length > 0 || invalid.length > 0) {
    return {
      ...base,
      status: invalid.length > 0 ? STATUS.BLOCKED_INVALID_INPUT : STATUS.BLOCKED_MISSING_INPUTS,
      missing,
      invalid,
      orders: [], // no actual number is ever printed from a partial model
      planningScenario,
    };
  }

  const orders = parsedOrders.map((po) => {
    let revenueCents = 0;
    let catalogBaseCents = 0;
    let customizationCents = 0;
    let units = 0;
    const collapsed = new Set();
    for (const it of po.items) {
      const prod = products.get(it.productKey);
      revenueCents += prod.priceUsd * it.quantity;
      catalogBaseCents += prod[CATALOG_BASE_FIELD] * it.quantity;
      customizationCents += prod.customizationAdditionalUsd * it.quantity;
      units += it.quantity;
      for (const a of prod.catalogBaseAliasesCollapsed) collapsed.add(a);
    }
    const l = po.lines;
    // Buyer shipping, buyer tax and net payout are never added or subtracted here.
    const contributionCents =
      revenueCents -
      l.discountUsd -
      catalogBaseCents -
      customizationCents -
      l.platformFeeUsd -
      l.paymentFeeUsd -
      l.sellerFundedShippingUsd -
      l.supportReserveUsd;
    return {
      key: po.key,
      units,
      quoteCheckedAt: po.quoteCheckedAt,
      lineCents: {
        merchandiseRevenue: revenueCents,
        discount: l.discountUsd,
        catalogBase: catalogBaseCents,
        customizationAdditional: customizationCents,
        platformFee: l.platformFeeUsd,
        paymentFee: l.paymentFeeUsd,
        sellerFundedShipping: l.sellerFundedShippingUsd,
        supportReserve: l.supportReserveUsd,
      },
      catalogBaseCountedOnce: true,
      catalogBaseAliasesCollapsed: [...collapsed],
      planningAssumptionsUsed: Object.entries(po.classes).filter(([, c]) => c === INPUT_CLASS.PLANNING_ASSUMPTION).map(([f]) => f),
      excludedPassThroughCents: {
        buyerPaidShipping: l.quotedBuyerShippingUsd,
        buyerCollectedTax: l.buyerCollectedTaxUsd,
        buyerQuotedTotal: l.quotedBuyerTotalUsd ?? null,
      },
      crossCheckOnlyCents: { actualNetPayout: l.actualNetPayoutUsd },
      contributionCents,
      // Per-unit figure only when it is an exact number of cents.
      contributionPerUnitCents: contributionCents % units === 0 ? contributionCents / units : null,
    };
  });

  return { ...base, status: STATUS.COMPUTED, missing: [], invalid: [], orders, planningScenario };
}

// ---------- planning scenario ----------

function computePlanningScenario(model, products, parsedOrders, invalidSoFar) {
  const head = {
    label: "PLANNING_ONLY",
    notice: "Planning arithmetic from observed and public-standard inputs. NOT profit, NOT actual contribution, NOT paid-acquisition readiness.",
    formula: "planningResidual = retail - catalogBase (counted once) - paymentFee(feeBase)",
    roundingRule: ROUNDING_RULE,
    paidAcquisitionReadiness: "NOT_CLAIMED",
    feeBaseConfirmed: false,
    excludedUnknowns: [
      "customizationAdditionalUsd (customization quote amount, UNKNOWN)",
      "shop-side shipping treatment: whether Fourthwall deducts or passes through the buyer-paid shipping, and any seller-funded share",
      "buyer shipping and buyer tax (pass-through): only the fee base, never revenue, never subtracted or added",
      "discount (owner standing rule 0, PLANNING_ASSUMPTION; nothing is subtracted)",
      "support / problem reserve",
      "platform fee in dollars",
      "actual payment fee in dollars and its assessment base",
      "actual net payout",
      "acquisition cost",
    ],
  };
  if (invalidSoFar.length > 0) {
    return { ...head, status: SCENARIO_STATUS.BLOCKED_INVALID_INPUT, reasons: invalidSoFar.map((i) => `${i.input}: ${i.reason}`), orders: [] };
  }

  const reasons = [];
  const plat = model?.platform;
  const feeClasses = [INPUT_CLASS.PUBLIC_STANDARD, INPUT_CLASS.OBSERVED];
  const rate = readRatePpm(plat?.paymentFeeRate, feeClasses);
  const markup = readRatePpm(plat?.extraPhysicalCatalogMarkupRate, feeClasses);
  const fixed = readMoney(plat?.paymentFeeFixedUsd, feeClasses);
  if (!rate.ok) reasons.push(`platform.paymentFeeRate: ${rate.reason}`);
  if (!markup.ok) reasons.push(`platform.extraPhysicalCatalogMarkupRate: ${markup.reason}`);
  if (!fixed.ok) reasons.push(`platform.paymentFeeFixedUsd: ${fixed.reason}`);
  for (const p of products.values()) {
    if (p.priceUsd === undefined) reasons.push(`products[${p.key}].priceUsd: not an OBSERVED number`);
    if (p[CATALOG_BASE_FIELD] === undefined) reasons.push(`products[${p.key}].${CATALOG_BASE_FIELD}: not an OBSERVED number`);
  }
  if (reasons.length > 0) return { ...head, status: SCENARIO_STATUS.NOT_COMPUTABLE, reasons, orders: [] };

  const totalPpm = rate.ppm + markup.ppm;
  const allPublic = [rate.cls, markup.cls, fixed.cls].every((c) => c === INPUT_CLASS.PUBLIC_STANDARD);
  const feeInputs = {
    percentRatePpm: totalPpm,
    fixedFeeCents: fixed.cents,
    class: allPublic ? INPUT_CLASS.PUBLIC_STANDARD : "MIXED_OBSERVED_AND_PUBLIC_STANDARD",
    settledTransaction: false,
  };

  let computedAny = false;
  const orders = parsedOrders.map((po) => {
    let merchandiseCents = 0;
    let catalogBaseCents = 0;
    let units = 0;
    for (const it of po.items) {
      const prod = products.get(it.productKey);
      merchandiseCents += prod.priceUsd * it.quantity;
      catalogBaseCents += prod[CATALOG_BASE_FIELD] * it.quantity; // once per unit; aliases already collapsed
      units += it.quantity;
    }
    // Buyer shipping and tax for the fee-base variants: the OBSERVED quote line wins (it is only
    // usable together with quoteCheckedAt); the owner's planning value is a fallback; else NOT_COMPUTABLE.
    const planning = po.raw?.planning ?? {};
    const quoteUsable = po.quoteCheckedAt !== undefined;
    const pick = (observedCents, plannedField) => {
      if (quoteUsable && observedCents !== undefined) return { ok: true, cents: observedCents, source: INPUT_CLASS.OBSERVED };
      const planned = readMoney(plannedField, [INPUT_CLASS.PLANNING_ASSUMPTION]);
      return planned.ok ? { ok: true, cents: planned.cents, source: INPUT_CLASS.PLANNING_ASSUMPTION } : { ok: false };
    };
    const ship = pick(po.lines.quotedBuyerShippingUsd, planning.plannedBuyerShippingUsd);
    const tax = pick(po.lines.buyerCollectedTaxUsd, planning.plannedBuyerTaxUsd);
    const shipPath = `orders[${po.key}].quotedBuyerShippingUsd (OBSERVED, with quoteCheckedAt) or orders[${po.key}].planning.plannedBuyerShippingUsd`;
    const taxPath = `orders[${po.key}].buyerCollectedTaxUsd (OBSERVED, with quoteCheckedAt) or orders[${po.key}].planning.plannedBuyerTaxUsd`;

    const scenario = (id, baseCents, needs) => {
      if (needs.length > 0) return { id, status: SCENARIO_STATUS.NOT_COMPUTABLE, needs };
      const fee = paymentFeeCents(baseCents, totalPpm, fixed.cents);
      computedAny = true;
      return {
        id,
        status: SCENARIO_STATUS.PLANNING_ONLY,
        feeBaseCents: baseCents,
        paymentFeeCents: fee,
        planningResidualCents: merchandiseCents - catalogBaseCents - fee,
      };
    };
    const shipCents = ship.ok ? ship.cents : 0;
    const taxCents = tax.ok ? tax.cents : 0;
    return {
      key: po.key,
      units,
      merchandiseCents,
      catalogBaseCents,
      catalogBaseCountedOnce: true,
      // Pass-through amounts used only as fee-base components. Never revenue.
      buyerShippingCents: ship.ok ? ship.cents : null,
      buyerShippingSource: ship.ok ? ship.source : null,
      buyerTaxCents: tax.ok ? tax.cents : null,
      buyerTaxSource: tax.ok ? tax.source : null,
      scenarios: [
        scenario(FEE_BASE.ITEM_ONLY, merchandiseCents, []),
        scenario(FEE_BASE.ITEM_PLUS_SHIPPING, merchandiseCents + shipCents, ship.ok ? [] : [shipPath]),
        scenario(
          FEE_BASE.ITEM_PLUS_SHIPPING_PLUS_TAX,
          merchandiseCents + shipCents + taxCents,
          [...(ship.ok ? [] : [shipPath]), ...(tax.ok ? [] : [taxPath])],
        ),
      ],
    };
  });

  return { ...head, status: computedAny ? SCENARIO_STATUS.PLANNING_ONLY : SCENARIO_STATUS.NOT_COMPUTABLE, feeInputs, reasons: [], orders };
}

// ---------- report ----------

const usd = (cents) => `${cents < 0 ? "-" : ""}${Math.floor(Math.abs(cents) / 100)}.${String(Math.abs(cents) % 100).padStart(2, "0")}`;

function formatScenario(s) {
  const out = ["", `PLANNING SCENARIO: ${s.status} (label ${s.label})`, s.notice, `Rule: ${s.formula}`, `Rounding: ${s.roundingRule}`];
  if (s.orders.length === 0) {
    for (const r of s.reasons) out.push(`  - ${r}`);
    return out;
  }
  out.push(
    `Fee inputs: ${s.feeInputs.class}, not a settled transaction: ${s.feeInputs.percentRatePpm / 10000}% + ${usd(s.feeInputs.fixedFeeCents)} USD per transaction. Fee base NOT confirmed; every base below is a scenario.`,
  );
  for (const o of s.orders) {
    out.push(`  ${o.key} (${o.units} unit${o.units === 1 ? "" : "s"}): retail ${usd(o.merchandiseCents)}, catalog base ${usd(o.catalogBaseCents)} (once per unit, never twice)`);
    const part = (label, cents, source) => (cents === null ? `${label} not available` : `${label} ${usd(cents)} [${source}]`);
    out.push(`    buyer-paid pass-through, fee base only, never revenue: ${part("shipping", o.buyerShippingCents, o.buyerShippingSource)}, ${part("tax", o.buyerTaxCents, o.buyerTaxSource)}`);
    for (const sc of o.scenarios) {
      if (sc.status === SCENARIO_STATUS.PLANNING_ONLY) {
        out.push(`    ${sc.id}: fee base ${usd(sc.feeBaseCents)}, payment fee ${usd(sc.paymentFeeCents)}, planning residual ${usd(sc.planningResidualCents)}  [PLANNING_ONLY]`);
      } else {
        out.push(`    ${sc.id}: NOT_COMPUTABLE, needs planning input ${sc.needs.join(", ")}`);
      }
    }
  }
  if (s.orders.some((o) => o.buyerShippingSource === INPUT_CLASS.OBSERVED || o.buyerTaxSource === INPUT_CLASS.OBSERVED)) {
    out.push("OBSERVED buyer shipping and tax come from a quote for one destination on one date (Standard method); other destinations are not covered and the amounts can change.");
  }
  out.push("Not in these numbers (unknown): " + s.excludedUnknowns.join("; ") + ".");
  out.push("The planning residual is not profit and not a contribution figure; paid-acquisition readiness: NOT_CLAIMED.");
  return out;
}

export function formatReport(result) {
  const out = [];
  out.push(`STATUS: ${result.status}`);
  out.push(result.measure);
  out.push(`Paid-acquisition readiness: ${result.paidAcquisitionReadiness} (this tool never claims it)`);
  if (result.status !== STATUS.COMPUTED) {
    if (result.missing.length) {
      out.push("", `Missing inputs (${result.missing.length}):`);
      for (const m of result.missing) out.push(`  - ${m}`);
    }
    if (result.invalid.length) {
      out.push("", `Invalid inputs (${result.invalid.length}):`);
      for (const i of result.invalid) out.push(`  - ${i.input}: ${i.reason}`);
    }
    out.push("", "No ACTUAL figure is printed: retail price minus base cost alone is not a margin.");
    out.push(...formatScenario(result.planningScenario));
    return out.join("\n");
  }
  for (const o of result.orders) {
    out.push("", `${o.key}  (${o.units} unit${o.units === 1 ? "" : "s"}, quote ${o.quoteCheckedAt})`);
    const L = o.lineCents;
    out.push(`  merchandise revenue      ${usd(L.merchandiseRevenue)}`);
    out.push(`  - discount               ${usd(L.discount)}`);
    out.push(`  - catalog base (once)    ${usd(L.catalogBase)}`);
    out.push(`  - customization addition ${usd(L.customizationAdditional)}`);
    out.push(`  - platform fee           ${usd(L.platformFee)}`);
    out.push(`  - payment fee            ${usd(L.paymentFee)}`);
    out.push(`  - seller-funded shipping ${usd(L.sellerFundedShipping)}`);
    out.push(`  - problem reserve        ${usd(L.supportReserve)}`);
    out.push(`  = contribution per order ${usd(o.contributionCents)}`);
    out.push(`    per unit               ${o.contributionPerUnitCents === null ? "n/a (not a whole number of cents)" : usd(o.contributionPerUnitCents)}`);
    out.push(`  excluded pass-through: buyer shipping ${usd(o.excludedPassThroughCents.buyerPaidShipping)}, buyer tax ${usd(o.excludedPassThroughCents.buyerCollectedTax)}${o.excludedPassThroughCents.buyerQuotedTotal === null ? "" : `, buyer total ${usd(o.excludedPassThroughCents.buyerQuotedTotal)}`}; net payout ${usd(o.crossCheckOnlyCents.actualNetPayout)} is a cross-check only`);
    if (o.planningAssumptionsUsed.length) out.push(`  uses owner planning assumption(s): ${o.planningAssumptionsUsed.join(", ")}`);
  }
  out.push(...formatScenario(result.planningScenario));
  return out.join("\n");
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const args = process.argv.slice(2);
  const asJson = args.includes("--json");
  const file = args.find((a) => !a.startsWith("--")) ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../docs/economics/two-mats.json");
  let model;
  try {
    model = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (error) {
    console.error(`Cannot read ${file}: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
  const result = computeContribution(model);
  console.log(asJson ? JSON.stringify(result, null, 2) : formatReport(result));
  process.exit(result.status === STATUS.COMPUTED ? 0 : 2);
}
