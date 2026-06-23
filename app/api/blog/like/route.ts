import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export async function POST(request: Request) {
  try {
    const { postId, slug } = await request.json();
    const writeToken = process.env.SANITY_API_WRITE_TOKEN;

    if (!writeToken) {
      return NextResponse.json(
        { error: "SANITY_API_WRITE_TOKEN is not configured." },
        { status: 500 },
      );
    }

    if ((!postId || typeof postId !== "string") && (!slug || typeof slug !== "string")) {
      return NextResponse.json(
        { error: "A postId or slug is required." },
        { status: 400 },
      );
    }

    let targetPostId = postId;

    if (!targetPostId && slug) {
      const post = await client.fetch<{ _id: string } | null>(
        `*[_type == "post" && slug.current == $slug][0]{ _id }`,
        { slug },
      );

      if (!post?._id) {
        return NextResponse.json({ error: "Post not found." }, { status: 404 });
      }

      targetPostId = post._id;
    }

    const writeClient = client.withConfig({
      useCdn: false,
      token: writeToken,
    });

    await writeClient.patch(targetPostId).setIfMissing({ likes: 0 }).inc({ likes: 1 }).commit();

    const updatedPost = await client.fetch<{ likes?: number } | null>(
      `*[_type == "post" && _id == $postId][0]{ likes }`,
      { postId: targetPostId },
    );

    return NextResponse.json({
      success: true,
      likes: updatedPost?.likes ?? 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to like post.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
