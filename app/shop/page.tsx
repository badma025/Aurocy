import { client } from "@/lib/sanity";
import { withStripePrices } from "@/lib/stripe-server";
import FlashcardsBrowser from "./FlashcardsBrowser";

interface PortableTextChild {
  text?: string;
}

interface PortableTextBlock {
  children?: PortableTextChild[];
}

interface Deck {
  _id: string;
  title: string;
  slug: { current: string };
  stripePriceId: string;
  mainImage: any;
  description?: PortableTextBlock[];
}

interface DeckCard {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  mainImage: any;
  descriptionText: string;
}

function toPlainText(blocks: PortableTextBlock[] = []) {
  return blocks
    .flatMap((block) => block.children ?? [])
    .map((child) => child.text ?? "")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

async function getDecks(): Promise<Deck[]> {
  const query = `
    *[_type == "deck" && defined(slug.current)] {
      _id,
      title,
      slug,
      stripePriceId,
      mainImage,
      description
    }
  `;
  return client.fetch(query);
}

export default async function Shop() {
  const decks = await withStripePrices(await getDecks());
  const deckCards: DeckCard[] = decks.map((deck) => ({
    _id: deck._id,
    title: deck.title,
    slug: deck.slug,
    price: deck.price,
    mainImage: deck.mainImage,
    descriptionText: toPlainText(deck.description),
  }));

  return (
    <div className="min-h-screen bg-[#0B1120] text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Shop</h1>
          <p className="text-xl text-gray-300">Choose your A-Level deck and start studying</p>
        </div>

        <FlashcardsBrowser decks={deckCards} />
      </div>
    </div>
  );
}
