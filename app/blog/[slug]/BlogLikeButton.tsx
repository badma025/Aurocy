"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

const likedPostsStorageKey = "liked-blog-posts";

function getStoredLikedPosts() {
  try {
    const rawValue = localStorage.getItem(likedPostsStorageKey);
    const parsedValue = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function setStoredLikedPosts(postIds: string[]) {
  localStorage.setItem(likedPostsStorageKey, JSON.stringify(postIds));
}

export default function BlogLikeButton({
  postId,
  slug,
  initialLikes,
}: {
  postId: string;
  slug: string;
  initialLikes: number;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const inFlightRef = useRef(false);

  useEffect(() => {
    const likedPosts = getStoredLikedPosts();
    setHasLiked(likedPosts.includes(postId));
  }, [postId]);

  const handleLike = async () => {
    if (hasLiked || isSubmitting || inFlightRef.current) {
      return;
    }

    inFlightRef.current = true;
    const previousLikes = likes;
    const likedPosts = getStoredLikedPosts();
    const nextLikedPosts = likedPosts.includes(postId)
      ? likedPosts
      : [...likedPosts, postId];

    setHasLiked(true);
    setLikes((currentLikes) => currentLikes + 1);
    setIsSubmitting(true);
    setIsAnimating(true);
    setStoredLikedPosts(nextLikedPosts);

    try {
      const response = await fetch("/api/blog/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          slug,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null);
        const errorMessage =
          typeof errorBody?.error === "string" ? errorBody.error : "Failed to like blog post.";
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Blog like failed:", error);

      setHasLiked(false);
      setLikes(previousLikes);
      setStoredLikedPosts(likedPosts);
    } finally {
      setIsSubmitting(false);
      inFlightRef.current = false;
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleLike}
      disabled={hasLiked || isSubmitting}
      animate={isAnimating ? { scale: [1, 1.2, 1] } : { scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onAnimationComplete={() => setIsAnimating(false)}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        hasLiked
          ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
          : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500 hover:text-white"
      } disabled:cursor-not-allowed`}
      aria-label={hasLiked ? "You already liked this post" : "Like this post"}
    >
      <Heart className={`h-4 w-4 ${hasLiked ? "fill-current" : ""}`} />
      <span>{likes}</span>
      <span>{hasLiked ? "Liked" : "Like"}</span>
    </motion.button>
  );
}
