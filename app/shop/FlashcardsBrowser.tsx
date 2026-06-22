"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search } from "lucide-react";
import { urlFor } from "@/lib/sanity";

interface Deck {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  mainImage: any;
  descriptionText: string;
}

function normalizeSearchValue(value: string) {
  return value.toLowerCase().replace(/[\W_]+/g, "");
}

function getExcerpt(text: string, maxLength = 120) {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength).trim()}...`;
}

export default function FlashcardsBrowser({ decks }: { decks: Deck[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Grab the discount from the environment variable (defaults to 0 if undefined)
  const discountPercent = Number(process.env.NEXT_PUBLIC_GLOBAL_DISCOUNT_PERCENT) || 0;
  const isDiscounted = discountPercent > 0;

  const filteredDecks = useMemo(() => {
    const query = normalizeSearchValue(searchQuery);

    if (!query) {
      return decks;
    }

    return decks.filter((deck) => {
      const title = normalizeSearchValue(deck.title);
      const description = normalizeSearchValue(deck.descriptionText);

      return title.includes(query) || description.includes(query);
    });
  }, [decks, searchQuery]);

  return (
    <div>
      <div className="mx-auto mb-10 max-w-2xl">
        <label
          htmlFor="flashcard-search"
          className="mb-3 block text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-400"
        >
          Search Flashcards
        </label>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/70 px-4 py-3 shadow-lg shadow-black/10">
          <Search className="h-5 w-5 shrink-0 text-slate-500" />
          <input
            id="flashcard-search"
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search by title or description..."
            className="w-full border-0 bg-transparent text-base text-white outline-none placeholder:text-slate-500"
          />
        </div>
        <p className="mt-3 text-sm text-slate-400">
          Showing {filteredDecks.length} of {decks.length} flashcard decks
        </p>
      </div>

      {filteredDecks.length === 0 ? (
        <div className="rounded-2xl border border-slate-700/60 bg-[#121a2b] px-6 py-12 text-center text-slate-300">
          No flashcards match your search yet. Try a different title or keyword.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filteredDecks.map((deck, index) => {
            // Calculate pricing dynamically for each deck
            const basePrice = deck.price / 100;
            const finalPrice = isDiscounted 
              ? basePrice * (1 - discountPercent / 100) 
              : basePrice;

            return (
              <motion.div
                key={deck._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <Link href={`/shop/${deck.slug.current}`} className="block h-full">
                  <div className="h-full overflow-hidden rounded-2xl border border-gray-700/30 bg-[#121a2b]">
                    <div className="relative h-48 overflow-hidden">
                      {deck.mainImage && (
                        <img
                          src={urlFor(deck.mainImage).width(400).height(300).url()}
                          alt={deck.title}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="mb-2 text-xl font-bold">{deck.title}</h3>
                      <p className="mb-5 min-h-[3.75rem] text-sm leading-6 text-slate-400">
                        {deck.descriptionText
                          ? getExcerpt(deck.descriptionText)
                          : "Premium A-Level flashcards built for fast, focused revision."}
                      </p>
                      
                      {/* Updated Pricing UI */}
                      <div className="flex items-center gap-3">
                        {isDiscounted && (
                          <span className="text-lg font-medium text-slate-500 line-through">
                            £{basePrice.toFixed(2)}
                          </span>
                        )}
                        <span className="text-2xl font-bold text-white">
                          £{finalPrice.toFixed(2)}
                        </span>
                        {isDiscounted && (
                          <span className="rounded bg-blue-500/20 px-2 py-1 text-xs font-bold text-blue-400">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>
                      {/* End Updated Pricing UI */}

                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}