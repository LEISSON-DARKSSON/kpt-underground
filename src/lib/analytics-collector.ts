/**
 * DISABLED collector plan (H05): GA4, one web stream, Basic consent mode.
 *
 * This module is pure and has no side effects at import: it creates no script element, makes no network
 * request, reads no cookie or storage. Nothing imports it. It only decides, from explicit inputs,
 * whether a collector MAY be loaded. Wiring it into the app is a separate, owner-approved change.
 *
 * Basic consent semantics: before consent the collector script is not loaded at all, so nothing is
 * sent and no collector cookie is set. Events may buffer in `window.dataLayer` (a local array only).
 * After consent the script is loaded, the buffered events can be flushed, and a later refusal means the
 * script is not loaded on the next visit. Refused or unset consent must never block shopping.
 *
 * It is enabled only when ALL of these hold:
 *   1. the owner explicitly approved activation (`ownerActivation === true`),
 *   2. the Measurement ID is syntactically valid and not a placeholder,
 *   3. consent is exactly "granted".
 * No Measurement ID exists in this repository. Do not invent one.
 */

export type ConsentState = "granted" | "denied" | "unset";

export type CollectorDisabledReason = "owner_activation_missing" | "no_measurement_id" | "invalid_measurement_id" | "consent_denied" | "consent_unset";

export interface CollectorInput {
  measurementId?: unknown;
  consent?: unknown;
  /** Must be the boolean `true`; set only after the owner approved an ID and activation. */
  ownerActivation?: unknown;
}

export type CollectorPlan =
  | { enabled: false; reason: CollectorDisabledReason }
  | {
      enabled: true;
      measurementId: string;
      /** The script may be injected only now, after consent. */
      loadScript: true;
      /** Do not send an automatic page view; the shop's own events are the only events. */
      sendPageView: false;
      /** No advertising features, no ad personalization, no cross-site signals. */
      advertising: false;
    };

const ID_SHAPE = /^G-[A-Z0-9]{10}$/;
const PLACEHOLDER = /^G-(X{10}|0{10})$/;

export function isMeasurementId(value: unknown): value is string {
  return typeof value === "string" && ID_SHAPE.test(value) && !PLACEHOLDER.test(value);
}

export function collectorPlan(input: CollectorInput = {}): CollectorPlan {
  if (input.ownerActivation !== true) return { enabled: false, reason: "owner_activation_missing" };
  if (input.measurementId === undefined || input.measurementId === null || input.measurementId === "") {
    return { enabled: false, reason: "no_measurement_id" };
  }
  if (!isMeasurementId(input.measurementId)) return { enabled: false, reason: "invalid_measurement_id" };
  if (input.consent === "denied") return { enabled: false, reason: "consent_denied" };
  if (input.consent !== "granted") return { enabled: false, reason: "consent_unset" };
  return { enabled: true, measurementId: input.measurementId, loadScript: true, sendPageView: false, advertising: false };
}
