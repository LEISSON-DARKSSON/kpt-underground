"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { shippingSchema, COUNTRIES, getShippingCost } from "@/lib/checkout-schema";
import type { ShippingFormData } from "@/lib/checkout-schema";
import { useCart } from "@/lib/cart-context";
import { formatEUR } from "@/lib/products";
// Zod validation via checkout-schema

interface FieldErrors {
  [key: string]: string | undefined;
}

function FormField({
  label,
  name,
  type = "text",
  value,
  error,
  required,
  onChange,
  autoComplete,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  value: string;
  error?: string;
  required?: boolean;
  onChange: (name: string, value: string) => void;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={`field-${name}`}
        className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted"
      >
        {label}{required && <span className="text-green ml-1">*</span>}
      </label>
      <input
        id={`field-${name}`}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="bg-ink border border-dim px-4 py-3 font-mono text-[13px] text-paper placeholder:text-dim transition-colors duration-200 focus:border-green focus:outline-none"
        style={{ borderColor: error ? "var(--orange)" : undefined }}
        data-cursor="h"
      />
      {error && (
        <span className="font-mono text-[9px] tracking-[0.1em] text-orange">
          {error}
        </span>
      )}
    </div>
  );
}

export function ShippingForm() {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const formRef = useRef<HTMLFormElement>(null);

  const [form, setForm] = useState<ShippingFormData>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    addressLine2: "",
    city: "",
    postalCode: "",
    country: "DE",
    phone: "",
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const shippingCost = getShippingCost(form.country);
  const orderTotal = totalPrice + shippingCost;
  const artistFund = Math.round(totalPrice * 0.1);

  const handleChange = useCallback((name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);

      /* Validate */
      const result = shippingSchema.safeParse(form);
      if (!result.success) {
        const fieldErrors: FieldErrors = {};
        result.error.issues.forEach((issue) => {
          const field = issue.path[0] as string;
          if (!fieldErrors[field]) fieldErrors[field] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }

      if (items.length === 0) {
        setSubmitError("Your cart is empty.");
        return;
      }

      setSubmitting(true);

      try {
        const payload = {
          items: items.map((i) => ({
            name: i.product.name,
            ref: i.product.ref,
            size: i.size,
            price: i.product.price,
            qty: i.qty,
          })),
          shipping: result.data,
          shippingCost,
        };

        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Checkout failed");
        }

        if (data.mode === "demo") {
          /* Demo mode — no Stripe key configured */
          clearCart();
          router.push("/confirmation");
        } else if (data.url) {
          /* Stripe Checkout — redirect */
          window.location.href = data.url;
        }
      } catch (err) {
        setSubmitError(
          err instanceof Error ? err.message : "Something went wrong. Try again."
        );
      } finally {
        setSubmitting(false);
      }
    },
    [form, items, shippingCost, clearCart, router]
  );

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate>
      {/* ─── Contact ─── */}
      <div className="mb-10">
        <h2 className="font-display text-[28px] tracking-[0.06em] text-paper mb-6">
          CONTACT
        </h2>
        <FormField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          error={errors.email}
          required
          onChange={handleChange}
          autoComplete="email"
          placeholder="operator@underground.net"
        />
      </div>

      {/* ─── Shipping ─── */}
      <div className="mb-10">
        <h2 className="font-display text-[28px] tracking-[0.06em] text-paper mb-6">
          SHIPPING
        </h2>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="First name"
              name="firstName"
              value={form.firstName}
              error={errors.firstName}
              required
              onChange={handleChange}
              autoComplete="given-name"
            />
            <FormField
              label="Last name"
              name="lastName"
              value={form.lastName}
              error={errors.lastName}
              required
              onChange={handleChange}
              autoComplete="family-name"
            />
          </div>

          <FormField
            label="Address"
            name="address"
            value={form.address}
            error={errors.address}
            required
            onChange={handleChange}
            autoComplete="address-line1"
          />

          <FormField
            label="Apartment, suite, etc."
            name="addressLine2"
            value={form.addressLine2 ?? ""}
            error={errors.addressLine2}
            onChange={handleChange}
            autoComplete="address-line2"
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="City"
              name="city"
              value={form.city}
              error={errors.city}
              required
              onChange={handleChange}
              autoComplete="address-level2"
            />
            <FormField
              label="Postal code"
              name="postalCode"
              value={form.postalCode}
              error={errors.postalCode}
              required
              onChange={handleChange}
              autoComplete="postal-code"
            />
          </div>

          {/* Country select */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="field-country"
              className="font-mono text-[9px] tracking-[0.2em] uppercase text-muted"
            >
              Country<span className="text-green ml-1">*</span>
            </label>
            <select
              id="field-country"
              name="country"
              value={form.country}
              onChange={(e) => handleChange("country", e.target.value)}
              className="bg-ink border border-dim px-4 py-3 font-mono text-[13px] text-paper transition-colors duration-200 focus:border-green focus:outline-none appearance-none"
              data-cursor="h"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.country && (
              <span className="font-mono text-[9px] tracking-[0.1em] text-orange">
                {errors.country}
              </span>
            )}
          </div>

          <FormField
            label="Phone (optional)"
            name="phone"
            type="tel"
            value={form.phone ?? ""}
            error={errors.phone}
            onChange={handleChange}
            autoComplete="tel"
          />
        </div>
      </div>

      {/* ─── Order Summary ─── */}
      <div className="mb-10 border-t border-dim pt-8">
        <h2 className="font-display text-[28px] tracking-[0.06em] text-paper mb-6">
          ORDER SUMMARY
        </h2>

        <div className="flex flex-col gap-3 mb-6">
          {items.map((item) => (
            <div
              key={`${item.product.id}-${item.size}`}
              className="flex justify-between items-center"
            >
              <div>
                <span className="font-mono text-[11px] text-paper">
                  {item.product.name}
                </span>
                <span className="font-mono text-[9px] text-muted ml-2">
                  {item.size} × {item.qty}
                </span>
              </div>
              <span className="font-mono text-[11px] text-paper">
                {formatEUR(item.product.price * item.qty)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-dim pt-4">
          <div className="flex justify-between">
            <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted">
              Subtotal
            </span>
            <span className="font-mono text-[11px] text-paper">
              {formatEUR(totalPrice)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-muted">
              Shipping
            </span>
            <span className="font-mono text-[11px] text-paper">
              {shippingCost === 0 ? "FREE" : formatEUR(shippingCost)}
            </span>
          </div>
          <div className="flex justify-between border-t border-dim pt-2 mt-1">
            <span className="font-mono text-[9px] tracking-[0.14em] uppercase text-green">
              Artist Fund (10%)
            </span>
            <span className="font-mono text-[11px] text-green">
              {formatEUR(artistFund)}
            </span>
          </div>
          <div className="flex justify-between border-t border-dim pt-3 mt-2">
            <span className="font-display text-[22px] tracking-[0.06em] text-paper">
              TOTAL
            </span>
            <span className="font-display text-[22px] tracking-[0.06em] text-green">
              {formatEUR(orderTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── Submit Error ─── */}
      {submitError && (
        <div className="mb-6 border border-orange/30 bg-orange/5 px-4 py-3">
          <span className="font-mono text-[11px] text-orange">{submitError}</span>
        </div>
      )}

      {/* ─── Submit ─── */}
      <button
        type="submit"
        disabled={submitting || items.length === 0}
        className="w-full font-display text-[22px] tracking-[0.08em] py-5 transition-all duration-200 disabled:opacity-30"
        style={{
          backgroundColor: "var(--green)",
          color: "var(--ink)",
        }}
        data-cursor="shop"
        data-cursor-label="PAY"
      >
        {submitting ? (
          <span className="inline-flex items-center gap-3">
            <span
              className="w-3 h-3 border border-ink rounded-full border-t-transparent"
              style={{ animation: "spin 0.6s linear infinite" }}
            />
            PROCESSING...
          </span>
        ) : (
          `COMPLETE ORDER — ${formatEUR(orderTotal)}`
        )}
      </button>

      {/* ─── Security Note ─── */}
      <p className="font-mono text-[8px] tracking-[0.14em] uppercase text-dim text-center mt-4">
        Secure checkout powered by Stripe // All transactions encrypted
      </p>
    </form>
  );
}
