import { client } from "@/lib/sanity";
import { withStripePrices } from "@/lib/stripe-server";
import TestimonialsSection from "@/components/testimonials-section";
import HomeClient from "./HomeClient";

export const revalidate = 60;

const featuredDeckSlugs = [
  "aqa-a-level-physics",
  "edexcel-a-level-further-maths",
  "aqa-a-level-computer-science-flashcards",
] as const;

interface Deck {
  _id: string;
  title: string;
  slug: { current: string };
  stripePriceId: string;
  mainImage: any;
}

async function getFeaturedDecks(): Promise<Deck[]> {
  const query = `
    *[_type == "deck" && slug.current in $featuredSlugs] {
      _id,
      title,
      slug,
      stripePriceId,
      mainImage
    }
  `;

  const decks = await client.fetch<Deck[]>(
    query,
    { featuredSlugs: featuredDeckSlugs },
    { next: { revalidate: 60 } },
  );

  return featuredDeckSlugs
    .map((slug) => decks.find((deck) => deck.slug.current === slug))
    .filter((deck): deck is Deck => Boolean(deck));
}

export default async function Home() {
  const decks = await withStripePrices(await getFeaturedDecks());

  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      <HomeClient decks={decks} />
      <TestimonialsSection />
    </div>
  );
}
