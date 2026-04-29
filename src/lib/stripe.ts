import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(key, {
      apiVersion: "2025-03-31.basil",
    });
  }

  return stripeClient;
}
