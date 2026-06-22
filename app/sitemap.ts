import type { MetadataRoute } from "next";
import { client } from "@/lib/sanity";

const siteUrl = "https://aurocy.com";

interface BlogSitemapEntry {
  slug: {
    current: string;
  };
  publishedAt?: string;
  _updatedAt?: string;
}

interface DeckSitemapEntry {
  slug: {
    current: string;
  };
  _updatedAt?: string;
}

async function getBlogSlugs() {
  const query = `
    *[_type == "post" && defined(slug.current)] {
      slug,
      publishedAt,
      _updatedAt
    }
  `;

  return client.fetch<BlogSitemapEntry[]>(query);
}

async function getDeckSlugs() {
  const query = `
    *[_type == "deck" && defined(slug.current)] {
      slug,
      _updatedAt
    }
  `;

  return client.fetch<DeckSitemapEntry[]>(query);
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, decks] = await Promise.all([getBlogSlugs(), getDeckSlugs()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      // Flashcards are currently routed under `/shop` in this App Router setup.
      url: `${siteUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${siteUrl}/blog/${post.slug.current}`,
    lastModified: post._updatedAt || post.publishedAt || new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const deckRoutes: MetadataRoute.Sitemap = decks.map((deck) => ({
    url: `${siteUrl}/shop/${deck.slug.current}`,
    lastModified: deck._updatedAt || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...blogRoutes, ...deckRoutes];
}
