import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { mapProduct, productInclude } from "@/lib/product";
import { isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/format";

// Pagination constants
const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 100;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const sort = searchParams.get("sort"); // newest | popular | price | rating
  const eggless = searchParams.get("eggless");
  const featured = searchParams.get("featured");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE))
  );

  // Build where clause for database filtering
  const where: any = { status: "active" };

  if (category && category !== "all") {
    // Support both slug and ID
    where.OR = [
      { category: { slug: category } },
      { categoryId: category },
    ];
  }

  if (eggless === "1") where.eggless = true;
  if (featured === "1") where.isFeatured = true;

  // Handle search query (SQLite does not support mode: 'insensitive', so we match lowercase)
  if (q) {
    const searchConditions = [
      { name: { contains: q } },
      { description: { contains: q } },
      { tags: { contains: q } },
    ];
    if (where.OR) {
      // Both category and search: use AND between them
      where.AND = [
        { OR: where.OR },
        { OR: searchConditions },
      ];
      delete where.OR;
    } else {
      where.OR = searchConditions;
    }
  }

  // Determine sort order
  let orderBy: any = { createdAt: "desc" };
  switch (sort) {
    case "price":
      orderBy = { weights: { _min: { price: "asc" } } };
      break;
    case "price-desc":
      orderBy = { weights: { _max: { price: "desc" } } };
      break;
    case "rating":
      orderBy = { rating: "desc" };
      break;
    case "popular":
      orderBy = { reviewCount: "desc" };
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  // Get total count for pagination metadata
  const total = await db.product.count({ where });

  // Fetch paginated products with database-level filtering and sorting
  const products = await db.product.findMany({
    where,
    include: productInclude,
    orderBy,
    take: pageSize,
    skip: (page - 1) * pageSize,
  });

  const mappedProducts = products.map(mapProduct);

  return NextResponse.json({
    products: mappedProducts,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total,
    },
  });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const slug = body.slug || slugify(body.name);
  const product = await db.product.create({
    data: {
      name: body.name,
      slug,
      categoryId: body.categoryId,
      description: body.description || "",
      ingredients: body.ingredients || "",
      prepHours: Number(body.prepHours) || 24,
      rating: 4.8,
      reviewCount: 0,
      isFeatured: !!body.isFeatured,
      isBestSeller: !!body.isBestSeller,
      isFreshToday: !!body.isFreshToday,
      isSeasonal: !!body.isSeasonal,
      eggless: !!body.eggless,
      tags: Array.isArray(body.tags) ? body.tags.join(",") : body.tags || "",
      status: body.status || "active",
      images: {
        create: (body.images || []).map((url: string, i: number) => ({
          url,
          alt: body.name,
          order: i,
        })),
      },
      weights: {
        create: (body.weights || []).map((w: any) => ({
          weight: w.weight,
          label: w.label,
          price: Number(w.price),
          mrp: w.mrp ? Number(w.mrp) : null,
        })),
      },
    },
    include: productInclude,
  });
  return NextResponse.json({ product: mapProduct(product) });
}
