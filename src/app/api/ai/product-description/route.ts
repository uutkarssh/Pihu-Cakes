import { NextRequest, NextResponse } from "next/server";
import { aiChat } from "@/lib/ai";
import { isAdmin } from "@/lib/auth";

// AI product description generator (admin)
export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, category, ingredients, eggless, weight } = await req.json();
  const system = `You are a copywriter for a premium artisan bakery ("Pihu Cakes & Bakes"). Write an appetising, warm product description (60-90 words) that makes customers hungry. Mention freshness and handmade quality. No markdown, no headings, just the prose paragraph.`;
  const user = `Cake: ${name}\nCategory: ${category}\nEggless: ${eggless ? "yes" : "no"}\nKey ingredients: ${ingredients}\nAvailable weights: ${weight || "1-5 pound"}\nWrite the description.`;
  try {
    const desc = await aiChat([{ role: "user", content: user }], system);
    return NextResponse.json({ description: desc.trim() });
  } catch {
    return NextResponse.json({
      description: `${name} is a freshly baked, handmade ${category.toLowerCase()} made with premium ingredients. ${eggless ? "100% eggless and " : ""}soft, moist and full of flavour — perfect for your celebration. Reserve online and pick it up fresh from our bakery.`,
    });
  }
}
