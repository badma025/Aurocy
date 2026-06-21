import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  try {
    const { stripePriceId, name, price, deckSlug } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe secret key not configured - did you restart the dev server?" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    if (stripePriceId && !stripePriceId.startsWith("price_")) {
      return NextResponse.json(
        {
          error:
            "Invalid Stripe Price ID! Make sure you're using a Price ID (starts with 'price_'), not a Product ID (starts with 'prod_')!",
        },
        { status: 400 }
      );
    }

    if (!deckSlug || typeof deckSlug !== "string") {
      return NextResponse.json(
        { error: "Missing deckSlug for fulfillment." },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: stripePriceId
        ? [
            {
              price: stripePriceId,
              quantity: 1,
            },
          ]
        : [
            {
              price_data: {
                currency: "gbp",
                product_data: { name },
                unit_amount: price,
              },
              quantity: 1,
            },
          ],
      mode: "payment",
      success_url: `${request.headers.get("origin")}/?success=true`,
      cancel_url: `${request.headers.get("origin")}/?canceled=true`,
      metadata: {
        deckSlug,
        product_name: name,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong";

    console.error("Stripe error:", error);

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
