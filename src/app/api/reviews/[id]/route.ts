import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const review = await db.review.update({
    where: { id },
    data: { status: body.status },
  });

  // recompute product rating + reviewCount from approved reviews
  if (body.status === "approved" || body.status === "rejected") {
    await recomputeProductRating(review.productId);
  }
  return NextResponse.json({ review });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  // Fetch review before deleting to get productId
  const review = await db.review.findUnique({ where: { id } });
  if (!review)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.review.delete({ where: { id } });

  // Recompute product rating after deletion
  await recomputeProductRating(review.productId);

  return NextResponse.json({ ok: true });
}

async function recomputeProductRating(productId: string) {
  const approved = await db.review.findMany({
    where: { productId, status: "approved" },
  });
  const avg =
    approved.reduce((a, r) => a + r.rating, 0) / (approved.length || 1);
  await db.product.update({
    where: { id: productId },
    data: {
      rating: Math.round(avg * 10) / 10,
      reviewCount: approved.length,
    },
  });
}