import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapProduct, productInclude } from "@/lib/product";
import { isAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await db.product.findFirst({
    where: { OR: [{ slug: slug }, { id: slug }] },
    include: productInclude,
  });
  if (!product)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product: mapProduct(product) });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const body = await req.json();
  const existing = await db.product.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (body.weights) {
    await db.weightPrice.deleteMany({ where: { productId: existing.id } });
    await db.weightPrice.createMany({
      data: body.weights.map((w: any) => ({
        productId: existing.id,
        weight: w.weight,
        label: w.label,
        price: Number(w.price),
        mrp: w.mrp ? Number(w.mrp) : null,
      })),
    });
  }
  if (body.images) {
    await db.productImage.deleteMany({ where: { productId: existing.id } });
    await db.productImage.createMany({
      data: body.images.map((url: string, i: number) => ({
        productId: existing.id,
        url,
        alt: body.name ?? existing.name,
        order: i,
      })),
    });
  }

  const updated = await db.product.update({
    where: { id: existing.id },
    data: {
      name: body.name,
      slug: body.slug,
      categoryId: body.categoryId,
      description: body.description,
      ingredients: body.ingredients,
      prepHours: body.prepHours != null ? Number(body.prepHours) : undefined,
      isFeatured: body.isFeatured,
      isBestSeller: body.isBestSeller,
      isFreshToday: body.isFreshToday,
      isSeasonal: body.isSeasonal,
      eggless: body.eggless,
      tags: Array.isArray(body.tags) ? body.tags.join(",") : body.tags,
      status: body.status,
    },
    include: productInclude,
  });
  return NextResponse.json({ product: mapProduct(updated) });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const existing = await db.product.findFirst({
    where: { OR: [{ slug }, { id: slug }] },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.product.delete({ where: { id: existing.id } });
  return NextResponse.json({ ok: true });
}
