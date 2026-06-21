import Link from "next/link";
import { client, urlFor } from "@/lib/sanity";
import { PortableText } from "@portabletext/react";

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage: any;
  publishedAt: string;
  body: any;
}

async function getPost(slug: string) {
  const query = `
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      mainImage,
      publishedAt,
      body
    }
  `;
  return client.fetch<Post>(query, { slug });
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-[#0B1120] text-white flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-4xl font-bold mb-4">Post not found</h1>
        <Link href="/blog" className="text-blue-400 hover:underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <article className="min-h-screen bg-[#0B1120] text-white py-12 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <Link href="/blog" className="text-blue-400 hover:underline mb-8 inline-block">
        ← Back to Blog
      </Link>
      {post.mainImage && (
        <img
          src={urlFor(post.mainImage).width(1200).height(600).url()}
          alt={post.title}
          className="w-full h-96 object-cover rounded-2xl mb-8"
        />
      )}
      <h1 className="text-4xl sm:text-5xl font-bold mb-4">{post.title}</h1>
      <p className="text-gray-400 mb-8">
        {new Date(post.publishedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
      <div className="prose prose-invert max-w-none">
        <PortableText value={post.body} />
      </div>
    </article>
  );
}
