import { NextRequest, NextResponse } from "next/server";
import { aiJSON } from "@/lib/ai";
import { isAdmin } from "@/lib/auth";

// AI festival banner text suggestions (Diwali, Raksha Bandhan, Christmas, New Year, etc.)
export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { festival } = await req.json();
  const system = `You are a marketing copywriter for "Pihu Cakes & Bakes", a warm neighbourhood bakery. Generate festival banner copy. Respond JSON: { "headline": "<≤8 words punchy headline>", "subtext": "<≤18 words warm subtext>", "cta": "<3-4 word call to action>", "whatsappMessage": "<short prefilled-style message a customer could send>" }. Warm, festive, mentions cake/bakery and pickup. Do NOT use any emojis. No quotes inside values.`;
  const user = `Festival: ${festival || "Diwali"}\nBrand: Pihu Cakes & Bakes (pickup-only bakery in Manga Patti, Sudhwai (UP 221310)).`;
  try {
    const r = await aiJSON<{
      headline: string;
      subtext: string;
      cta: string;
      whatsappMessage: string;
    }>(user, system);
    return NextResponse.json(r);
  } catch {
    return NextResponse.json({
      headline: `Sweeten Your ${festival || "Festival"}`,
      subtext: `Freshly baked cakes to make your ${festival || "celebration"} unforgettable. Reserve online, pick up fresh.`,
      cta: "Order Fresh Now",
      whatsappMessage: `Hi! I'd like to pre-book a ${festival || "festival"} cake.`,
    });
  }
}
