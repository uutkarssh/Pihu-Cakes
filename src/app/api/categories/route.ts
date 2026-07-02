import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const categories = await db.category.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const slug = body.slug || body.name.toLowerCase().replace(/\s+/g, "-");
  const cat = await db.category.create({
    data: {
      name: body.name,
      slug,
      description: body.description || null,
      icon: body.icon || null,
      order: body.order || 0,
    },
  });
  return NextResponse.json({ category: cat });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const id = body.id;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const cat = await db.category.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description !== undefined ? body.description : undefined,
      icon: body.icon !== undefined ? body.icon : undefined,
      order: body.order !== undefined ? body.order : undefined,
    },
  });
  return NextResponse.json({ category: cat });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Check for products referencing this category before deleting
  const productCount = await db.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: `Cannot delete category: ${productCount} product(s) are linked to it. Move or delete them first.` },
      { status: 409 }
    );
  }

  await db.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}