import { client } from "@/lib/sanity";
import { withStripePrice } from "@/lib/stripe-server";
import DeckClient from "./DeckClient";

interface Flashcard {
  question: string;
  answer: any;
}

interface SanityDeck {
  _id: string;
  title: string;
  slug: { current: string };
  stripePriceId: string;
  mainImage: any;
  description: any;
  testSet: Flashcard[];
}

async function getDeck(slug: string): Promise<SanityDeck> {
  const query = `
    *[_type == "deck" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      stripePriceId,
      mainImage,
      description,
      testSet
    }
  `;
  return client.fetch(query, { slug });
}

export default async function DeckPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const deck = await getDeck(slug);

  if (!deck) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center">
        Deck not found
      </div>
    );
  }

  return <DeckClient deck={await withStripePrice(deck)} />;
}
