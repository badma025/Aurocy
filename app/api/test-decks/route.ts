import { NextResponse } from "next/server";
import { client } from "@/lib/sanity";

export async function GET() {
  try {
    const query = `*[_type == "deck"] { _id, title, slug, _createdAt }`;
    const decks = await client.fetch(query);
    return NextResponse.json({ decks });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
