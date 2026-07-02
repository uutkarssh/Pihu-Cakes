import { db } from "./db";
import type { ProductT } from "./types";

export function mapProduct(p: any): ProductT {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? null,
    description: p.description,
    ingredients: p.ingredients,
    prepHours: p.prepHours,
    rating: p.rating,
    reviewCount: p.reviewCount,
    isFeatured: p.isFeatured,
    isBestSeller: p.isBestSeller,
    isFreshToday: p.isFreshToday,
    isSeasonal: p.isSeasonal,
    eggless: p.eggless,
    tags: p.tags ? p.tags.split(",").filter(Boolean) : [],
    status: p.status,
    images: (p.images ?? [])
      .slice()
      .sort((a: any, b: any) => a.order - b.order)
      .map((i: any) => ({ id: i.id, url: i.url, alt: i.alt, order: i.order })),
    weights: (p.weights ?? []).map((w: any) => ({
      id: w.id,
      weight: w.weight,
      label: w.label,
      price: w.price,
      mrp: w.mrp ?? null,
    })),
    createdAt: p.createdAt,
  };
}

export const productInclude = {
  images: true,
  weights: true,
  category: true,
};

export async function getProducts() {
  const rows = await db.product.findMany({
    include: productInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapProduct);
}
