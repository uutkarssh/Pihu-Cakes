import { NextRequest, NextResponse } from "next/server";
import { aiJSON } from "@/lib/ai";
import { cache } from "@/lib/cache";
import { db } from "@/lib/db";
import { mapProduct, productInclude } from "@/lib/product";

const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes for search results

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "query required" }, { status: 400 });
  }

  const cacheKey = `ai-search:${query.toLowerCase().trim()}`;

  // Check cache first
  const cached = cache.get<{ products: any[]; explanation: string }>(cacheKey);
  if (cached) {
    return NextResponse.json(cached);
  }

  try {
    // Fetch all active products with images and weights
    const allProducts = await db.product.findMany({
      where: { status: "active" },
      include: {
        images: true,
        weights: true,
        category: true,
        reviews: {
          where: { status: "approved" },
          take: 3,
        },
      },
    });

    // Format product list for AI context
    const productContext = allProducts
      .map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        category: p.category?.name,
        eggless: p.eggless,
        tags: p.tags.split(",").filter(Boolean),
        minPrice: Math.min(...(p.weights.map((w) => w.price) || [1000])),
        maxPrice: Math.max(...(p.weights.map((w) => w.price) || [1000])),
        rating: p.rating,
      }))
      .slice(0, 50); // Limit context to most relevant products

    const system = `You are a bakery assistant helping customers find perfect cakes.
Given a customer's natural language query, recommend the best matching cakes from our catalog.

Available products:
${JSON.stringify(productContext, null, 2)}

Respond with valid JSON: { "productIds": ["id1", "id2", ...], "explanation": "brief explanation" }`;

    const result = await aiJSON(query, system);

    // Map product IDs back to full product objects
    const recommendedIds = (result as any).productIds || [];
    const recommendedProducts = recommendedIds
      .map((id: string) => allProducts.find((p) => p.id === id))
      .filter(Boolean)
      .map(mapProduct)
      .slice(0, 6); // Limit to 6 recommendations

    const response = {
      products: recommendedProducts,
      explanation: (result as any).explanation || "Here are the best matches for you!",
    };

    // Cache the result
    cache.set(cacheKey, response, CACHE_TTL_MS);

    return NextResponse.json(response);
  } catch (e: any) {
    console.error("AI search error:", e.message);
    return NextResponse.json(
      { error: "AI search failed", explanation: "Please try a different search" },
      { status: 500 }
    );
  }
}
