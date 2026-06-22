import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";
import { getStripeUnitAmount, stripe } from "@/lib/stripe-server";

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
    // We only extract the slug. Never trust the frontend price!
    const { deckSlug } = await request.json(); 
    
    const baseUrl = resolveBaseUrl(request);
    const successUrl = `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`;

    if (!deckSlug || typeof deckSlug !== "string") {
      return NextResponse.json(
        { error: "Missing deckSlug for fulfillment." },
        { status: 400 }
      );
    }

    // 1. SECURE FETCH: Get the Stripe price ID from Sanity and the display title
    const deck = await client.fetch(
      `*[_type == "deck" && slug.current == $deckSlug][0]{ title, stripePriceId }`,
      { deckSlug }
    );

    if (!deck) {
      return NextResponse.json({ error: "Deck not found in database" }, { status: 404 });
    }

    if (!deck.stripePriceId || typeof deck.stripePriceId !== "string") {
      return NextResponse.json(
        { error: "Deck is missing a Stripe price ID in Sanity." },
        { status: 400 }
      );
    }

    const baseUnitAmount = await getStripeUnitAmount(deck.stripePriceId);

    // 2. Apply the global discount mathematically using Stripe as the pricing source
    const discountPercent = Number(process.env.NEXT_PUBLIC_GLOBAL_DISCOUNT_PERCENT) || 0;
    
    const finalPriceInPence = Math.round(baseUnitAmount * (1 - discountPercent / 100));

    // 3. Create the Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "gbp",
            product_data: { 
              name: deck.title,
              description: discountPercent > 0 ? `Launch Promo: ${discountPercent}% OFF applied` : undefined,
            },
            unit_amount: finalPriceInPence,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: successUrl,
      cancel_url: `${baseUrl}/shop`, // Send them back to the shop if they cancel
      metadata: {
        deckSlug,
        product_name: deck.title, // Passed for your webhook fulfillment
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Something went wrong";
    console.error("Checkout Route Error:", message);
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
