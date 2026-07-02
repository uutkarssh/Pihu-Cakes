import { NextRequest, NextResponse } from "next/server";
import { aiChat } from "@/lib/ai";

// AI celebration message suggestions while filling special requirements
export async function POST(req: NextRequest) {
  const { occasion, name, cakeName } = await req.json();
  const system = `You write short, warm cake-message suggestions for a bakery (max ~25 characters each so they fit on a cake). Reply with 6 options, each on its own line, no numbering, no quotes, no extra commentary. Mix playful, sweet, and elegant. Use the person's name if given.`;
  const user = `Occasion: ${occasion || "birthday"}\nName on cake: ${name || ""}\nCake: ${cakeName || "cake"}\nGive 6 short message suggestions.`;
  try {
    const out = await aiChat(
      [{ role: "user", content: user }],
      system
    );
    const suggestions = out
      .split("\n")
      .map((s) => s.replace(/^["'\d.\s)-]+/, "").replace(/["']$/g, "").trim())
      .filter(Boolean)
      .slice(0, 6);
    return NextResponse.json({ suggestions });
  } catch {
    return NextResponse.json({
      suggestions: [
        `Happy ${occasion || "Birthday"} ${name || ""}`.trim(),
        name ? `${name} Rocks!` : "Sweet Celebrations",
        "Made With Love",
        name ? `Cheers ${name}!` : "Cheers!",
        "Stay Sweet",
        name ? `${name}, You're the Best!` : "You're the Best!",
      ],
    });
  }
}
