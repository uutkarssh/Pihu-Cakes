import { NextRequest, NextResponse } from "next/server";
import { aiChat } from "@/lib/ai";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

// AI review summarization for a product (admin) or all (admin)
export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { productId } = await req.json();

  const where = productId ? { productId, status: "approved" } : { status: "approved" };
  const reviews = await db.review.findMany({
    where,
    include: { product: true },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  if (!reviews.length)
    return NextResponse.json({ summary: "No reviews yet to summarize." });

  const system = `You summarize customer reviews for a bakery owner. Give: (1) a 2-3 sentence overall summary, (2) top 3 positive themes as bullets, (3) top 2 improvement themes as bullets (or "None identified" if none). Be concise and honest. Do NOT use any emojis. Use plain text with "- " bullets.`;
  const user = `Reviews:\n${reviews
    .map((r) => `(${r.rating} stars) ${r.customerName}: ${r.body}`)
    .join("\n")}`;

  try {
    const summary = await aiChat([{ role: "user", content: user }], system);
    return NextResponse.json({
      summary: summary.trim(),
      count: reviews.length,
      avg:
        Math.round(
          (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10
        ) / 10,
    });
  } catch {
    return NextResponse.json({
      summary: `Based on ${reviews.length} reviews, customers generally rate this around ${(
        reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
      ).toFixed(1)} stars.`,
      count: reviews.length,
      avg:
        Math.round(
          (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length) * 10
        ) / 10,
    });
  }
}
