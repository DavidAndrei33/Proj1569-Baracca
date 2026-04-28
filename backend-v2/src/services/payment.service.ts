import Stripe from "stripe";
import { env } from "../utils/env.js";

export const isStripeEnabled = Boolean(env.STRIPE_SECRET_KEY);

let stripe: Stripe | null = null;

if (isStripeEnabled) {
  stripe = new Stripe(env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });
}

export function getStripe(): Stripe {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }
  return stripe;
}

export async function createPaymentIntent(
  amount: number,
  currency: string = env.STRIPE_CURRENCY
) {
  const client = getStripe();
  return client.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    automatic_payment_methods: { enabled: true },
  });
}

export async function retrievePaymentIntent(id: string) {
  return getStripe().paymentIntents.retrieve(id);
}

export async function refundPayment(id: string) {
  return getStripe().refunds.create({ payment_intent: id });
}
