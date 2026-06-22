import { NextResponse } from "next/server";
import Stripe from "stripe";

function resolveBaseUrl(request: Request) {
  const candidates = [
    process.env.NEXT_PUBLIC_BASE_URL,
    request.headers.get("origin"),
    "http://localhost:3000",
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;

    try {
      return new URL(candidate).origin;
    } catch {}
  }

  return "http://localhost:3000";
}

export async function POST(request: Request) {
  try {
    const { stripePriceId, name, price, deckSlug } = await request.json();
    const baseUrl = resolveBaseUrl(request);
    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;

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
      success_url: successUrl,
      cancel_url: `${baseUrl}/?canceled=true`,
      metadata: {
        deckSlug,
        product_name: name,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
