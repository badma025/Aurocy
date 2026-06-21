import Link from "next/link";
import { client, urlFor } from "@/lib/sanity";

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage: any;
  publishedAt: string;
  body: any;
}

async function getPosts() {
  const query = `
    *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
      _id,
      title,
      slug,
      mainImage,
      publishedAt
    }
  `;
  return client.fetch<Post[]>(query);
}

export default async function Blog() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen bg-[#0B1120] text-white py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-center">Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug.current}`}
            className="block bg-[#121a2b] border border-gray-700/30 rounded-2xl overflow-hidden hover:scale-105 transition-transform duration-300"
          >
            {post.mainImage && (
              <img
                src={urlFor(post.mainImage).width(400).height(300).url()}
                alt={post.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">{post.title}</h2>
              <p className="text-gray-400 text-sm">
                {new Date(post.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

