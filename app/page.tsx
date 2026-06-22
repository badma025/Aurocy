import { client } from "@/lib/sanity";
import { withStripePrices } from "@/lib/stripe-server";
import HomeClient from "./HomeClient";

interface Deck {
  _id: string;
  title: string;
  slug: { current: string };
  stripePriceId: string;
  mainImage: any;
}

async function getFeaturedDecks(): Promise<Deck[]> {
  const query = `
    *[_type == "deck" && defined(slug.current)] | order(_createdAt desc) [0...3] {
      _id,
      title,
      slug,
      stripePriceId,
      mainImage
    }
  `;
  return client.fetch(query);
}

export default async function Home() {
  const decks = await withStripePrices(await getFeaturedDecks());

  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      <HomeClient decks={decks} />
    </div>
  );
}
