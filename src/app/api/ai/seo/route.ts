import { NextRequest, NextResponse } from "next/server";
import { aiJSON } from "@/lib/ai";
import { isAdmin } from "@/lib/auth";

// AI SEO title + meta description for a product (admin)
export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, category, eggless, description } = await req.json();
  const system = `You are an SEO specialist for a bakery. Generate an SEO title (≤60 chars) and meta description (≤155 chars) for a product. Respond JSON: { "title": "...", "metaDescription": "..." }. Include keywords like cake, bakery, ${category}, Manga Patti, Sudhwai, pickup. No quotes inside values.`;
  const user = `Product: ${name}\nCategory: ${category}\nEggless: ${eggless ? "yes" : "no"}\nDescription: ${description?.slice(0, 200)}`;
  try {
    const r = await aiJSON<{ title: string; metaDescription: string }>(
      user,
      system
    );
    return NextResponse.json(r);
  } catch {
    return NextResponse.json({
      title: `${name} | ${category} | Pihu Cakes & Bakes`,
      metaDescription: `Order freshly baked ${name.toLowerCase()} online. ${eggless ? "Eggless " : ""}${category} for pickup in Manga Patti, Sudhwai. Handmade with premium ingredients at Pihu Cakes & Bakes.`,
    });
  }
}
