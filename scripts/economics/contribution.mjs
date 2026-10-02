// H06: contribution before acquisition for the two desk mats.
// Read-only. No dependencies. Usage: node scripts/economics/contribution.mjs [model.json] [--json]
//
// Rule: a number comes out only when EVERY required input is a sourced, dated,
// non-null number. Otherwise the status is BLOCKED_MISSING_INPUTS (or
// BLOCKED_INVALID_INPUT) and no number derived from the retail price is printed.
// Nothing here claims net profit or paid-acquisition readiness.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const STATUS = Object.freeze({
  COMPUTED: "COMPUTED",
  BLOCKED_MISSING_INPUTS: "BLOCKED_MISSING_INPUTS",
  BLOCKED_INVALID_INPUT: "BLOCKED_INVALID_INPUT",
});

// Per product (once): sale price and production cost.
const PRODUCT_FIELDS = ["priceUsd", "manufacturingCostUsd"];
// Per order: each line is separate. Tax is deliberately absent: pass-through.
const ORDER_MONEY_FIELDS = [
  "platformFeeUsd",
  "paymentFeeUsd",
  "discountUsd",
  "sellerFundedShippingUsd",
  "supportReserveUsd",
  "quotedBuyerShippingUsd",
];
const ORDER_DATE_FIELD = "quoteCheckedAt";

const isText = (v) => typeof v === "string" && v.trim().length > 0;

// Returns { ok: true, cents } | { ok: false, kind: "missing" | "invalid", reason }.
// The null check comes BEFORE any arithmetic: in JS, Number(null) and null * 100 are 0.
function readMoney(field) {
  if (field === undefined || field === null) return { ok: false, kind: "missing", reason: "field absent" };
  if (typeof field !== "object" || Array.isArray(field)) {
    return { ok: false, kind: "invalid", reason: "expected { value, source, date }; a bare value has no source" };
  }
  const v = field.value;
  if (v === null || v === undefined) return { ok: false, kind: "missing", reason: "value is null" };
  if (typeof v !== "number" || !Number.isFinite(v)) {
    return { ok: false, kind: "invalid", reason: "value is not a finite number (strings are never coerced)" };
  }
  if (v < 0) return { ok: false, kind: "invalid", reason: "negative amount" };
  const scaled = v * 100;
  const cents = Math.round(scaled);
  if (Math.abs(scaled - cents) > 1e-6) return { ok: false, kind: "invalid", reason: "more than two decimals" };
  if (!isText(field.source) || !isText(field.date)) {
    return { ok: false, kind: "invalid", reason: "number without source and date" };
  }
  return { ok: true, cents };
}

function readDate(field) {
  if (field === undefined || field === null) return { ok: false, kind: "missing", reason: "field absent" };
  const v = typeof field === "object" ? field.value : undefined;
  if (v === null || v === undefined) return { ok: false, kind: "missing", reason: "value is null" };
  if (!isText(v) || Number.isNaN(Date.parse(v))) return { ok: false, kind: "invalid", reason: "not an ISO date" };
  return { ok: true, value: v };
}

export function computeContribution(model) {
  const missing = [];
  const invalid = [];
  const note = (where, r) => {
    if (r.kind === "missing") missing.push(where);
    else invalid.push({ input: where, reason: r.reason });
  };

  const products = new Map();
  const productList = Array.isArray(model?.products) ? model.products : [];
  const orderList = Array.isArray(model?.orders) ? model.orders : [];
  if (productList.length === 0) invalid.push({ input: "products", reason: "no products" });
  if (orderList.length === 0) invalid.push({ input: "orders", reason: "no orders" });

  for (const p of productList) {
    const parsed = { key: p?.key };
    for (const f of PRODUCT_FIELDS) {
      const r = readMoney(p?.[f]);
      if (r.ok) parsed[f] = r.cents;
      else note(`products[${p?.key}].${f}`, r);
    }
    products.set(p?.key, parsed);
  }

  const parsedOrders = [];
  for (const o of orderList) {
    const po = { key: o?.key, items: [], lines: {} };
    for (const f of ORDER_MONEY_FIELDS) {
      const r = readMoney(o?.[f]);
      if (r.ok) po.lines[f] = r.cents;
      else note(`orders[${o?.key}].${f}`, r);
    }
    const d = readDate(o?.[ORDER_DATE_FIELD]);
    if (d.ok) po.quoteCheckedAt = d.value;
    else note(`orders[${o?.key}].${ORDER_DATE_FIELD}`, d);

    // Buyer-collected tax is optional and pass-through. It is validated but never used.
    if (o?.buyerCollectedTaxUsd && o.buyerCollectedTaxUsd.value !== null && o.buyerCollectedTaxUsd.value !== undefined) {
      const t = readMoney(o.buyerCollectedTaxUsd);
      if (t.ok) po.buyerCollectedTaxCents = t.cents;
      else note(`orders[${o?.key}].buyerCollectedTaxUsd`, t);
    }

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

  const base = {
    currency: model?.currency ?? "USD",
    measure: "Contribution before acquisition. Not net profit. Not a paid-acquisition decision.",
    paidAcquisitionReadiness: "NOT_CLAIMED",
    requiredInputs: {
      perProduct: PRODUCT_FIELDS,
      perOrder: [...ORDER_MONEY_FIELDS, ORDER_DATE_FIELD],
      passThroughNeverRevenue: ["quotedBuyerShippingUsd", "buyerCollectedTaxUsd"],
    },
  };

  if (missing.length > 0 || invalid.length > 0) {
    return {
      ...base,
      status: missing.length > 0 ? STATUS.BLOCKED_MISSING_INPUTS : STATUS.BLOCKED_INVALID_INPUT,
      missing,
      invalid,
      orders: [], // no number is ever printed from a partial model
    };
  }

  const orders = parsedOrders.map((po) => {
    let revenueCents = 0;
    let manufacturingCents = 0;
    let units = 0;
    for (const it of po.items) {
      const prod = products.get(it.productKey);
      revenueCents += prod.priceUsd * it.quantity;
      manufacturingCents += prod.manufacturingCostUsd * it.quantity;
      units += it.quantity;
    }
    const l = po.lines;
    // Buyer shipping and buyer tax are pass-through: not revenue, not cost.
    const contributionCents =
      revenueCents -
      l.discountUsd -
      manufacturingCents -
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
        manufacturingCost: manufacturingCents,
        platformFee: l.platformFeeUsd,
        paymentFee: l.paymentFeeUsd,
        sellerFundedShipping: l.sellerFundedShippingUsd,
        supportReserve: l.supportReserveUsd,
      },
      excludedPassThroughCents: {
        buyerPaidShipping: l.quotedBuyerShippingUsd,
        buyerCollectedTax: po.buyerCollectedTaxCents ?? null,
      },
      contributionCents,
      // Per-unit figure only when it is an exact number of cents.
      contributionPerUnitCents: contributionCents % units === 0 ? contributionCents / units : null,
    };
  });

  return { ...base, status: STATUS.COMPUTED, missing: [], invalid: [], orders };
}

const usd = (cents) => `${cents < 0 ? "-" : ""}${Math.floor(Math.abs(cents) / 100)}.${String(Math.abs(cents) % 100).padStart(2, "0")}`;

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
    out.push("", "No contribution figure is printed: retail price minus base cost alone is not a margin.");
    return out.join("\n");
  }
  for (const o of result.orders) {
    out.push("", `${o.key}  (${o.units} unit${o.units === 1 ? "" : "s"}, quote ${o.quoteCheckedAt})`);
    const L = o.lineCents;
    out.push(`  merchandise revenue      ${usd(L.merchandiseRevenue)}`);
    out.push(`  - discount               ${usd(L.discount)}`);
    out.push(`  - production cost        ${usd(L.manufacturingCost)}`);
    out.push(`  - platform fee           ${usd(L.platformFee)}`);
    out.push(`  - payment fee            ${usd(L.paymentFee)}`);
    out.push(`  - seller-funded shipping ${usd(L.sellerFundedShipping)}`);
    out.push(`  - problem reserve        ${usd(L.supportReserve)}`);
    out.push(`  = contribution per order ${usd(o.contributionCents)}`);
    out.push(`    per unit               ${o.contributionPerUnitCents === null ? "n/a (not a whole number of cents)" : usd(o.contributionPerUnitCents)}`);
    out.push(`  excluded pass-through: buyer shipping ${usd(o.excludedPassThroughCents.buyerPaidShipping)}, buyer tax ${o.excludedPassThroughCents.buyerCollectedTax === null ? "not recorded" : usd(o.excludedPassThroughCents.buyerCollectedTax)}`);
  }
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
