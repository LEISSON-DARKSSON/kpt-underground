import { NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";

const checkoutRequestSchema = z.object({
  items: z.array(
    z.object({
      name: z.string(),
      ref: z.string(),
      size: z.string(),
      price: z.number().positive(),
      qty: z.number().int().positive().max(10),
    })
  ).min(1, "Cart is empty"),
  shipping: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    address: z.string().min(1),
    addressLine2: z.string().optional(),
    city: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().length(2),
    phone: z.string().optional(),
  }),
  shippingCost: z.number().min(0),
});

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;

  /* ── No Stripe key: demo mode ── */
  if (!stripeKey) {
    return NextResponse.json({
      mode: "demo",
      url: "/confirmation",
      sessionId: `demo_${Date.now()}`,
    });
  }

  /* ── Production: create Stripe Checkout Session ── */
  try {
    const body = await request.json();
    const validated = checkoutRequestSchema.parse(body);

    const stripe = new Stripe(stripeKey);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] =
      validated.items.map((item) => ({
        price_data: {
          currency: "eur",
          product_data: {
            name: `${item.name} — ${item.size}`,
            description: item.ref,
          },
          unit_amount: item.price,
        },
        quantity: item.qty,
      }));

    /* Add shipping as a line item if non-zero */
    if (validated.shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "eur",
          product_data: {
            name: "Shipping",
            description: `Delivery to ${validated.shipping.country}`,
          },
          unit_amount: validated.shippingCost,
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: validated.shipping.email,
      line_items: lineItems,
      shipping_address_collection: undefined,
      metadata: {
        customerName: `${validated.shipping.firstName} ${validated.shipping.lastName}`,
        shippingAddress: `${validated.shipping.address}, ${validated.shipping.city}, ${validated.shipping.postalCode}, ${validated.shipping.country}`,
        artistFundAllocation: String(
          Math.round(
            validated.items.reduce((sum, i) => sum + i.price * i.qty, 0) * 0.1
          )
        ),
      },
      success_url: `${request.headers.get("origin")}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get("origin")}/checkout`,
    });

    return NextResponse.json({
      mode: "live",
      url: session.url,
      sessionId: session.id,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: err.flatten() },
        { status: 400 }
      );
    }
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
