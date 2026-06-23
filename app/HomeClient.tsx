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

export default function HomeClient({ decks }: { decks: Deck[] }) {
  const discountPercent = Number(process.env.NEXT_PUBLIC_GLOBAL_DISCOUNT_PERCENT) || 0;
  const isDiscounted = discountPercent > 0;
  const saleEndsAt = new Date("2026-09-01T00:00:00.000Z");
  const showPromoBanner = new Date() < saleEndsAt;

  // Debug log decks and images
  useEffect(() => {
    console.log("HomeClient: Decks received:", decks);
    decks.forEach((deck, index) => {
      console.log(`Deck ${index} (${deck.title}):`, {
        mainImage: deck.mainImage,
        imageUrl: deck.mainImage ? urlFor(deck.mainImage).width(400).height(300).url() : "No image",
      });
    });
  }, [decks]);
  return (
    <>
      {showPromoBanner && (
        <section className="border-b border-blue-500/20 bg-gradient-to-r from-blue-600/10 via-slate-900/80 to-blue-600/10 px-4 py-3 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl text-center">
            <p className="text-sm font-medium tracking-[0.02em] text-blue-300 sm:text-base">
              ☀️ 40% Summer Sale for Year 10 & Year 12 students — ends September 1st!
            </p>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-5xl sm:text-7xl font-bold tracking-tight mb-8"
            >
              Master Your <span className="text-blue-400">A-Levels</span> with Aurocy
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
            >
              High-yield Anki flashcards designed to help you ace your exams with confidence.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex gap-4 justify-center"
            >
              <Link href="/shop">
                <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">
                  Browse Decks
                </button>
              </Link>
              <Link href="/blog">
                <button className="px-8 py-3 border border-gray-600 hover:border-gray-500 rounded-lg font-semibold transition-colors">
                  Learn More
                </button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Bento Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Decks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {decks.map((deck, index) => {
              const basePrice = deck.price / 100;
              const finalPrice = isDiscounted
                ? basePrice * (1 - discountPercent / 100)
                : basePrice;

              return (
                <motion.div
                  key={deck._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ y: -8, scale: 1.02 }}
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
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
