import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

// GET reviews: by productId (public, approved only) or all (admin)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (productId) {
    const reviews = await db.review.findMany({
      where: { productId, status: "approved" },
      orderBy: { createdAt: "desc" },
    });
    const parsed = reviews.map((r) => ({
      ...r,
      images: safeParse(r.images),
    }));
    return NextResponse.json({ reviews: parsed });
  }
  // public featured reviews (latest approved across all)
  if (searchParams.get("featured") === "1") {
    const reviews = await db.review.findMany({
      where: { status: "approved" },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    });
    return NextResponse.json({
      reviews: reviews.map((r) => ({ ...r, images: safeParse(r.images) })),
    });
  }
  // admin: all reviews
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = searchParams.get("status");
  const reviews = await db.review.findMany({
    where: status && status !== "all" ? { status } : undefined,
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    reviews: reviews.map((r) => ({ ...r, images: safeParse(r.images) })),
  });
}

function safeParse(s: string): string[] {
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const review = await db.review.create({
    data: {
      productId: body.productId,
      orderId: body.orderId || null,
      customerName: body.customerName || "Customer",
      rating: Number(body.rating) || 5,
      title: body.title || null,
      body: body.body || "",
      images: JSON.stringify(body.images || []),
      status: "pending",
      verified: !!body.orderId,
    },
  });
  return NextResponse.json({ review });
}
