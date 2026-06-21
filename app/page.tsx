import { client } from "@/lib/sanity";
import HomeClient from "./HomeClient";

interface Deck {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  mainImage: any;
}

async function getFeaturedDecks(): Promise<Deck[]> {
  const query = `
    *[_type == "deck" && defined(slug.current)] | order(_createdAt desc) [0...3] {
      _id,
      title,
      slug,
      price,
      mainImage
    }
  `;
  return client.fetch(query);
}

export default async function Home() {
  const decks = await getFeaturedDecks();

  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      <HomeClient decks={decks} />
    </div>
  );
}
