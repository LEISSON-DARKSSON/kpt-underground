import { z } from "zod";

export const shippingSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long"),
  address: z
    .string()
    .min(1, "Address is required")
    .max(200, "Address too long"),
  addressLine2: z.string().max(200).optional().default(""),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City name too long"),
  postalCode: z
    .string()
    .min(1, "Postal code is required")
    .max(20, "Postal code too long"),
  country: z
    .string()
    .min(2, "Country is required")
    .max(2, "Use 2-letter country code"),
  phone: z
    .string()
    .max(20, "Phone number too long")
    .optional()
    .default(""),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

export const COUNTRIES = [
  { code: "DE", name: "Germany" },
  { code: "NL", name: "Netherlands" },
  { code: "BE", name: "Belgium" },
  { code: "AT", name: "Austria" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "PT", name: "Portugal" },
  { code: "GB", name: "United Kingdom" },
  { code: "IE", name: "Ireland" },
  { code: "DK", name: "Denmark" },
  { code: "SE", name: "Sweden" },
  { code: "FI", name: "Finland" },
  { code: "NO", name: "Norway" },
  { code: "PL", name: "Poland" },
  { code: "CZ", name: "Czech Republic" },
  { code: "CH", name: "Switzerland" },
  { code: "US", name: "United States" },
] as const;

export function getShippingCost(country: string): number {
  const EU = ["DE", "NL", "BE", "AT", "FR", "ES", "IT", "PT", "IE", "DK", "SE", "FI", "NO", "PL", "CZ"];
  if (EU.includes(country)) return 0; // Free EU shipping
  if (country === "GB") return 500; // £5 equivalent
  if (country === "CH") return 800;
  if (country === "US") return 1500;
  return 1200; // Default international
}
