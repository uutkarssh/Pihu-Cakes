import { NextRequest, NextResponse } from "next/server";
import { aiJSON } from "@/lib/ai";
import { db } from "@/lib/db";
import { mapProduct } from "@/lib/product";

// Occasion-based AI recommendations
export async function POST(req: NextRequest) {
  const { occasion, budget, preferences } = await req.json();
  const products = (await db.product.findMany({
    where: { status: "active" },
    include: { images: true, weights: true, category: true },
  })).map(mapProduct);

  const system = `You are a bakery recommendation engine for "Pihu Cakes & Bakes". Given an occasion and the full menu, pick the 3-4 best cakes to recommend. Respond as JSON: { "recommendations": [ { "productId": "<id>", "reason": "<short warm reason>" } ], "intro": "<one warm sentence>" }. Only use productIds from the provided menu. Keep reasons under 18 words.`;

  const menu = products
    .map((p) => {
      const min = Math.min(...p.weights.map((w) => w.price));
      return `${p.id} | ${p.name} | ${p.categoryName} | from ₹${min} | ${p.eggless ? "eggless" : "contains egg"} | tags: ${p.tags.join(",")}`;
    })
    .join("\n");

  const user = `Occasion: ${occasion}\nBudget: ${budget || "any"}\nPreferences: ${preferences || "none"}\n\nMENU:\n${menu}`;

  try {
    const result = await aiJSON<{
      recommendations: { productId: string; reason: string }[];
      intro: string;
    }>(user, system);

    const recs = (result.recommendations || [])
      .map((r) => {
        const p = products.find((x) => x.id === r.productId);
        return p ? { product: p, reason: r.reason } : null;
      })
      .filter(Boolean);

    return NextResponse.json({
      intro: result.intro,
      recommendations: recs,
    });
  } catch (e: any) {
    return NextResponse.json({
      intro: "Here are some cakes we think you'll love:",
      recommendations: products
        .filter((p) => p.isFeatured || p.isBestSeller)
        .slice(0, 4)
        .map((p) => ({ product: p, reason: "A bakery favourite." })),
    });
  }
}
