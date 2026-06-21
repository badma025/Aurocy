import { client } from "@/lib/sanity";
import ShopClient from "./ShopClient";

interface Deck {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  mainImage: any;
}

async function getDecks(): Promise<Deck[]> {
  const query = `
    *[_type == "deck" && defined(slug.current)] {
      _id,
      title,
      slug,
      price,
      mainImage
    }
  `;
  return client.fetch(query);
}

export default async function Shop() {
  const decks = await getDecks();

  return (
    <div className="min-h-screen bg-[#0B1120] text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Shop</h1>
          <p className="text-xl text-gray-300">Choose your A-Level deck and start studying</p>
        </div>

        <ShopClient decks={decks} />
      </div>
    </div>
  );
}
