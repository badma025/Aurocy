import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not configured.");
}

const stripe = new Stripe(stripeSecretKey);

export async function getStripeUnitAmount(stripePriceId: string) {
  if (!stripePriceId) {
    throw new Error("Missing stripePriceId for price lookup.");
  }

  const price = await stripe.prices.retrieve(stripePriceId);

  if (price.unit_amount === null) {
    throw new Error(`Stripe price "${stripePriceId}" is missing a unit_amount.`);
  }

  return price.unit_amount;
}

export async function withStripePrice<T extends { stripePriceId: string }>(
  deck: T,
): Promise<T & { price: number }> {
  const price = await getStripeUnitAmount(deck.stripePriceId);

  return {
    ...deck,
    price,
  };
}

export async function withStripePrices<T extends { stripePriceId: string }>(
  decks: T[],
): Promise<Array<T & { price: number }>> {
  return Promise.all(decks.map((deck) => withStripePrice(deck)));
}

export { stripe };
