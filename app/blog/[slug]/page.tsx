import Link from "next/link";
import { redirect } from "next/navigation";
import { client, urlFor } from "@/lib/sanity";
import { PortableText } from "@portabletext/react";
import BlogLikeButton from "./BlogLikeButton";
import CodeBlock from "./CodeBlock";

function isPortableTextBlock(block: any) {
  return !!block && block._type === "block" && Array.isArray(block.children);
}

function isCodeOnlyPortableTextBlock(block: any) {
  if (!isPortableTextBlock(block)) {
    return false;
  }

  const spans = block.children.filter((child: any) => child?._type === "span");

  if (!spans.length) {
    return false;
  }

  return spans.every((span: any) => {
    const text = typeof span.text === "string" ? span.text : "";
    if (!text.trim()) {
      return true;
    }

    const marks = Array.isArray(span.marks) ? span.marks : [];
    return marks.length === 1 && marks[0] === "code";
  });
}

function isEmptyPortableTextBlock(block: any) {
  if (!isPortableTextBlock(block)) {
    return false;
  }

  const spans = block.children.filter((child: any) => child?._type === "span");
  if (!spans.length) return true;

  return spans.every((span: any) => {
    const text = typeof span.text === "string" ? span.text : "";
    return !text.trim();
  });
}

function extractPortableText(block: any) {
  const spans = Array.isArray(block?.children) ? block.children : [];
  return spans
    .filter((child: any) => child?._type === "span")
    .map((span: any) => (typeof span.text === "string" ? span.text : ""))
    .join("");
}

function normalizePortableTextForCode(value: any[]) {
  if (!Array.isArray(value)) {
    return value;
  }

  const normalized: any[] = [];
  let autoKeyIndex = 0;

  for (const block of value) {
    if (!isPortableTextBlock(block)) {
      normalized.push(block);
      continue;
    }

    if (isCodeOnlyPortableTextBlock(block)) {
      const code = extractPortableText(block).trimEnd();
      if (!code.trim()) {
        normalized.push(block);
        continue;
      }

      normalized.push({
        _type: "aurocyCodeBlock",
        _key: typeof block._key === "string" ? `${block._key}-as-code` : `code-${autoKeyIndex++}`,
        code,
      });
      continue;
    }

    const spans = block.children.filter((child: any) => child?._type === "span");
    const blockLevelCodeSpans = spans.filter((span: any, index: number) => {
      const marks = Array.isArray(span.marks) ? span.marks : [];
      const isCodeMarked = marks.includes("code");
      if (!isCodeMarked) return false;

      const beforeText = spans
        .slice(0, index)
        .map((s: any) => (typeof s.text === "string" ? s.text : ""))
        .join("");

      return beforeText.includes("\n");
    });

    if (!blockLevelCodeSpans.length) {
      normalized.push(block);
      continue;
    }

    const cleanedChildren = block.children
      .map((child: any) => {
        if (child?._type !== "span") return child;

        const marks = Array.isArray(child.marks) ? child.marks : [];
        const isBlockCodeSpan = blockLevelCodeSpans.includes(child);
        if (marks.includes("code") && isBlockCodeSpan) {
          return null;
        }

        const text = typeof child.text === "string" ? child.text : "";
        if (!marks.includes("code") && text.includes("\n")) {
          return { ...child, text: text.replace(/\n+/g, " ") };
        }

        return child;
      })
      .filter(Boolean);

    const cleanedTextPreview = cleanedChildren
      .filter((child: any) => child?._type === "span")
      .map((child: any) => (typeof child.text === "string" ? child.text : ""))
      .join("")
      .trim();

    if (cleanedTextPreview) {
      normalized.push({
        ...block,
        _key: typeof block._key === "string" ? `${block._key}-text` : `text-${autoKeyIndex++}`,
        children: cleanedChildren,
      });
    }

    for (let i = 0; i < blockLevelCodeSpans.length; i += 1) {
      const span = blockLevelCodeSpans[i];
      const code = typeof span.text === "string" ? span.text : "";
      if (!code.trim()) continue;

      normalized.push({
        _type: "aurocyCodeBlock",
        _key:
          typeof block._key === "string"
            ? `${block._key}-code-${i}`
            : `code-${autoKeyIndex++}`,
        code,
      });
    }
  }

  const merged: any[] = [];
  let index = 0;

  while (index < normalized.length) {
    const block = normalized[index];

    if (block?._type !== "aurocyCodeBlock") {
      merged.push(block);
      index += 1;
      continue;
    }

    const startKey = typeof block?._key === "string" ? block._key : `code-${index}`;
    const lines: string[] = [];

    while (index < normalized.length) {
      const current = normalized[index];

      if (current?._type === "aurocyCodeBlock") {
        lines.push(String(current.code || "").replace(/\s+$/g, ""));
        index += 1;
        continue;
      }

      if (isEmptyPortableTextBlock(current)) {
        lines.push("");
        index += 1;
        continue;
      }

      break;
    }

    merged.push({ _type: "aurocyCodeBlock", _key: `${startKey}-merged`, code: lines.join("\n").trimEnd() });
  }

  return merged;
}

const components = {
  list: {
    bullet: ({ children }: any) => (
      <ul className="mt-4 list-disc pl-5 space-y-2 text-white marker:text-white">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="mt-4 list-decimal pl-5 space-y-2 text-white marker:text-white">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li className="text-sm leading-6 text-white">{children}</li>,
    number: ({ children }: any) => <li className="text-sm leading-6 text-white">{children}</li>,
  },
  marks: {
    code: ({ children }: any) => (
      <code className="bg-slate-800/80 text-blue-300 font-mono text-sm px-1.5 py-0.5 rounded-md border border-slate-700">
        {children}
      </code>
    ),
  },
  types: {
    code: ({ value }: any) => (
      <CodeBlock
        code={String(value?.code || value?.text || "")}
        language={typeof value?.language === "string" ? value.language : undefined}
      />
    ),
    aurocyCodeBlock: ({ value }: any) => <CodeBlock code={String(value?.code || "")} />,
  },
};

interface Post {
  _id: string;
  title: string;
  slug: { current: string };
  mainImage: any;
  publishedAt: string;
  body: any;
  likes: number;
}

function normalizeSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

async function getPost(slug: string) {
  const query = `
    *[_type == "post" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      mainImage,
      publishedAt,
      body,
      "likes": coalesce(likes, 0)
    }
  `;
  return client.withConfig({ useCdn: false }).fetch<Post>(query, { slug });
}

async function getCanonicalPostSlug(requestedSlug: string) {
  const query = `
    *[_type == "post" && defined(slug.current)]{
      "slug": slug.current
    }
  `;

  const slugs = await client.withConfig({ useCdn: false }).fetch<Array<{ slug: string }>>(query);
  const target = normalizeSlug(requestedSlug);

  const match = slugs.find((entry) => normalizeSlug(entry.slug) === target);
  return match?.slug ?? null;
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    const canonicalSlug = await getCanonicalPostSlug(slug);

    if (canonicalSlug && canonicalSlug !== slug) {
      redirect(`/blog/${canonicalSlug}`);
    }

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
      <div className="mb-8">
        <BlogLikeButton
          postId={post._id}
          slug={post.slug.current}
          initialLikes={post.likes}
        />
      </div>
      <div className="prose prose-invert max-w-none">
        <PortableText components={components} value={normalizePortableTextForCode(post.body)} />
      </div>
    </article>
  );
}
