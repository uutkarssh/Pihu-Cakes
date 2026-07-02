"use client";

import { useApp } from "@/lib/store";
import { useToggleWishlist } from "@/lib/use-firebase";
import type { ProductT } from "@/lib/types";
import { inr } from "@/lib/format";
import { BakeryCard, Pill, StarRating, priceOf } from "./ui";
import { Heart, ShoppingBag, Award, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: ProductT }) {
  const navigate = useApp((s) => s.navigate);
  const wishlist = useApp((s) => s.wishlist);
  const toggleWishlist = useToggleWishlist();
  const inWish = wishlist.includes(product.id);

  const min = priceOf(product);
  const img = product.images[0]?.url || "/products/hero-bakery.png";

  return (
    <BakeryCard hover className="overflow-hidden flex flex-col group" onClick={() => navigate({ name: "product", slug: product.slug })}>
      <div className="relative aspect-square overflow-hidden border-b-2.5 border-ink bg-cream">
        <img
          src={img}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute top-2 left-2 flex flex-col gap-1.5">
          {product.isBestSeller && <Pill color="terracotta"><Award size={11} /> Bestseller</Pill>}
          {product.eggless && <Pill color="cream"><Leaf size={11} /> Eggless</Pill>}
          {product.isSeasonal && <Pill color="burgundy">Seasonal</Pill>}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-2 right-2 w-9 h-9 rounded-full bg-card border-2 border-ink flex items-center justify-center nb-shadow-sm nb-press"
          aria-label="Wishlist"
        >
          <Heart
            size={16}
            className={cn(inWish ? "fill-burgundy text-burgundy" : "text-burgundy")}
          />
        </button>
      </div>
      <div className="p-3 sm:p-4 flex flex-col gap-1.5 flex-1">
        <h3 className="font-display font-bold text-base sm:text-lg leading-tight text-ink line-clamp-1">
          {product.name}
        </h3>
        <StarRating rating={product.rating} size={13} showValue count={product.reviewCount} />
        <p className="text-xs text-muted-foreground line-clamp-2 flex-1">
          {product.description.slice(0, 80)}…
        </p>
        <div className="flex items-center justify-between gap-2 mt-1.5 pt-2 border-t-2 border-dashed border-ink/15">
          <div className="min-w-0">
            <div className="text-[10px] text-muted-foreground font-medium leading-none">from</div>
            <div className="font-display font-black text-base sm:text-lg text-terracotta leading-tight">
              {inr(min)}
            </div>
          </div>
          <div className="bg-mustard text-ink border-2 border-ink rounded-full px-3 py-1.5 text-[11px] font-bold nb-shadow-sm nb-press flex items-center gap-1 shrink-0">
            <ShoppingBag size={12} /> View
          </div>
        </div>
      </div>
    </BakeryCard>
  );
}
