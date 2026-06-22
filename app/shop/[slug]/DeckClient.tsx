"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PortableText } from "@portabletext/react";
import { urlFor } from "@/lib/sanity";

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

export default function DeckClient({ deck }: { deck: Deck }) {
  const [flippedIndex, setFlippedIndex] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const components = {
    list: {
      bullet: ({ children }: any) => (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-white marker:text-white">{children}</ul>
      ),
      number: ({ children }: any) => (
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-white marker:text-white">{children}</ol>
      ),
    },
    listItem: {
      bullet: ({ children }: any) => <li className="text-sm leading-6 text-white">{children}</li>,
      number: ({ children }: any) => <li className="text-sm leading-6 text-white">{children}</li>,
    },
  };

  // Grab the discount from the environment variable (defaults to 0 if undefined)
  const discountPercent = Number(process.env.NEXT_PUBLIC_GLOBAL_DISCOUNT_PERCENT) || 0;
  const isDiscounted = discountPercent > 0;
  
  // Calculate pricing dynamically
  const basePrice = deck.price / 100;
  const finalPrice = isDiscounted 
    ? basePrice * (1 - discountPercent / 100) 
    : basePrice;

  const handleBuyNow = async () => {
    setCheckoutLoading(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // THE FIX: Only send the slug! The backend handles the rest securely.
        body: JSON.stringify({
          deckSlug: deck.slug.current,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert(error instanceof Error ? error.message : "Error creating checkout session");
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section - Split Layout */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          {/* Left: Image & Description */}
          <div>
            {deck.mainImage && (
              <div className="rounded-2xl overflow-hidden mb-8">
                <img
                  src={urlFor(deck.mainImage).width(600).height(400).url()}
                  alt={deck.title}
                  className="w-full h-auto"
                />
              </div>
            )}
            <div className="prose prose-invert max-w-none">
              <PortableText components={components} value={deck.description} />
            </div>
          </div>

          {/* Right: Pricing & Buy Button */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{deck.title}</h1>
            
            {/* Updated Pricing UI with Discount Logic */}
            <div className="mb-8 flex items-end gap-3">
              {isDiscounted && (
                <span className="text-2xl font-bold text-slate-500 line-through mb-1">
                  £{basePrice.toFixed(2)}
                </span>
              )}
              <span className="text-5xl font-bold text-blue-400">
                £{finalPrice.toFixed(2)}
              </span>
              {isDiscounted && (
                <span className="rounded bg-blue-500/20 px-3 py-1.5 text-sm font-bold text-blue-400 mb-2">
                  {discountPercent}% OFF
                </span>
              )}
            </div>
            
            <button
              onClick={handleBuyNow}
              disabled={checkoutLoading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-xl font-bold text-xl transition-colors z-50 cursor-pointer"
              style={{ position: "relative", zIndex: 50 }}
            >
              {checkoutLoading ? "Redirecting..." : "Buy Now"}
            </button>
          </div>
        </div>

        {/* Test Set Section */}
        {deck.testSet && deck.testSet.length > 0 && (
          <section>
            <h2 className="text-3xl font-bold mb-8 text-center">
              Free Test Set (10 Cards)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {deck.testSet.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() =>
                    setFlippedIndex(flippedIndex === index ? null : index)
                  }
                  className="perspective-1000"
                >
                  <div
                    className={`relative h-64 w-full transition-transform duration-600 transform-style-3d ${
                      flippedIndex === index ? "rotate-y-180" : ""
                    }`}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 bg-[#121a2b] border border-gray-700 rounded-2xl p-6 flex items-center justify-center backface-hidden">
                      <p className="text-lg font-semibold text-center">
                        {card.question}
                      </p>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 bg-[#1a2541] border border-blue-600 rounded-2xl p-6 flex items-center justify-center backface-hidden rotate-y-180 overflow-y-auto">
                      <div className="prose prose-invert max-w-none text-center">
                        <PortableText value={card.answer} />
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-gray-400 text-sm mt-2">
                    Click to flip
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
