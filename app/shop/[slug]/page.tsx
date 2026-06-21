import { client } from "@/lib/sanity";
import DeckClient from "./DeckClient";

interface Flashcard {
  question: string;
  answer: any;
}

interface Deck {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  stripePriceId: string;
  mainImage: any;
  description: any;
  testSet: Flashcard[];
}

async function getDeck(slug: string): Promise<Deck> {
  const query = `
    *[_type == "deck" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      price,
      stripePriceId,
      mainImage,
      description,
      testSet
    }
  `;
  return client.fetch(query, { slug });
}

export default async function DeckPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; // Await the params promise!
  console.log("DeckPage: Slug parameter received:", slug);
  
  const deck = await getDeck(slug);
  console.log("DeckPage: Fetched deck from Sanity:", deck);

  if (!deck) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white flex items-center justify-center">
        Deck not found
      </div>
    );
  }

  return <DeckClient deck={deck} />;
}
