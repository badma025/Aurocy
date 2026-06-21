"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { urlFor } from "@/lib/sanity";

interface Deck {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  mainImage: any;
}

export default function ShopClient({ decks }: { decks: Deck[] }) {
  // Debug log decks and images
  useEffect(() => {
    console.log("ShopClient: Decks received:", decks);
    decks.forEach((deck, index) => {
      console.log(`Deck ${index} (${deck.title}):`, {
        mainImage: deck.mainImage,
        imageUrl: deck.mainImage ? urlFor(deck.mainImage).width(400).height(300).url() : "No image",
      });
    });
  }, [decks]);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {decks.map((deck, index) => (
        <motion.div
          key={deck._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ y: -4 }}
        >
          <Link href={`/shop/${deck.slug.current}`} className="block h-full">
            <div className="h-full bg-[#121a2b] border border-gray-700/30 rounded-2xl overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                {deck.mainImage && (
                  <img
                    src={urlFor(deck.mainImage).width(400).height(300).url()}
                    alt={deck.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{deck.title}</h3>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">
                    £{(deck.price / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}
