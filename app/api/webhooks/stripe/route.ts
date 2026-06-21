import { NextResponse } from "next/server";
import { Resend } from "resend";
import Stripe from "stripe";
import { createElement } from "react";
import ReceiptEmail from "@/components/emails/ReceiptEmail";
import { client } from "@/lib/sanity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DeckDownload = {
  title: string | null;
  downloadUrl: string | null;
};

export async function GET() {
  return NextResponse.json({
    message: "Stripe webhook endpoint. Send POST requests from Stripe only.",
  });
}

export async function POST(request: Request) {
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");

  if (!stripeSecretKey || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe webhook configuration." },
      { status: 500 }
    );
  }

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header." },
      { status: 400 }
    );
  }

  const stripe = new Stripe(stripeSecretKey);
  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown signature verification error.";

    console.error("Stripe webhook signature verification failed:", message);

    return NextResponse.json({ error: message }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerEmail =
          session.customer_details?.email ?? session.customer_email ?? null;
        const customerName =
          session.customer_details?.name ?? customerEmail ?? "there";
        const deckSlug = session.metadata?.deckSlug ?? null;

        await handleDeckDelivery({
          customerEmail,
          customerName,
          deckSlug,
        });
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown webhook processing error.";

    console.error("Stripe webhook processing failed:", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function handleDeckDelivery({
  customerEmail,
  customerName,
  deckSlug,
}: {
  customerEmail: string | null;
  customerName: string;
  deckSlug: string | null;
}) {
  if (!customerEmail) {
    console.warn("Stripe checkout completed without a customer email.");
    return;
  }

  if (!deckSlug) {
    throw new Error("Stripe session metadata is missing deckSlug.");
  }

  const deck = await getDeckDownloadBySlug(deckSlug);

  if (!deck) {
    throw new Error(`No deck found in Sanity for slug "${deckSlug}".`);
  }

  if (!deck.downloadUrl) {
    throw new Error(
      `Deck "${deckSlug}" is missing a download file URL in Sanity.`
    );
  }

  await sendDeckEmail({
    customerEmail,
    customerName,
    deckName: deck.title ?? deckSlug,
    downloadUrl: deck.downloadUrl,
  });
}

async function getDeckDownloadBySlug(
  deckSlug: string
): Promise<DeckDownload | null> {
  const query = `
    *[_type == "deck" && slug.current == $slug][0]{
      title,
      "downloadUrl": downloadFile.asset->url
    }
  `;

  return client.withConfig({ useCdn: false }).fetch(query, { slug: deckSlug });
}

async function sendDeckEmail({
  customerEmail,
  customerName,
  deckName,
  downloadUrl,
}: {
  customerEmail: string;
  customerName: string;
  deckName: string;
  downloadUrl: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw new Error("Missing RESEND_API_KEY for fulfillment email delivery.");
  }

  const resend = new Resend(resendApiKey);
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "Aurocy <onboarding@resend.dev>";

  const result = await resend.emails.send({
    from: fromEmail,
    to: customerEmail,
    subject: `Your Aurocy flashcards: ${deckName}`,
    react: createElement(ReceiptEmail, {
      customerName,
      deckName,
      downloadUrl,
    }),
  });

  if (result.error) {
    throw new Error(result.error.message);
  }
}
