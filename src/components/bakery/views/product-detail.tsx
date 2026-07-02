"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { useToggleWishlist } from "@/lib/use-firebase";
import { inr, formatDate } from "@/lib/format";
import {
  BakeryButton,
  BakeryCard,
  Pill,
  SectionTitle,
  StarRating,
} from "../ui";
import { ProductCard } from "../product-card";
import {
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingBag,
  Clock,
  Leaf,
  Sparkles,
  Check,
  ChevronLeft,
  MessageSquarePlus,
  Croissant,
  Award,
  Flame,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ProductView({ slug }: { slug: string }) {
  const navigate = useApp((s) => s.navigate);
  const back = useApp((s) => s.back);
  const addToCart = useApp((s) => s.addToCart);
  const wishlist = useApp((s) => s.wishlist);
  const toggleWishlist = useToggleWishlist();
  const fbUser = useApp((s) => s.fbUser);
  const fbReady = useApp((s) => s.fbReady);

  const q = useQuery({ queryKey: ["product", slug], queryFn: () => api.product(slug) });
  const product = q.data?.product;
  const [activeImg, setActiveImg] = useState(0);
  const [weightIdx, setWeightIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "ingredients" | "reviews">("desc");

  const reviewsQ = useQuery({
    queryKey: ["reviews", product?.id],
    queryFn: () => api.reviews(product!.id),
    enabled: !!product,
  });
  const reviews = reviewsQ.data?.reviews ?? [];

  // AI suggestions: "Customers also loved" — other products in same category
  const relatedQ = useQuery({
    queryKey: ["products", "related", product?.categoryId],
    queryFn: () => api.products({
      category: product?.categoryName?.toLowerCase().replace(/\s+/g, "-") || product!.categoryId,
    }),
    enabled: !!product,
  });
  const related = (relatedQ.data?.products ?? [])
    .filter((p) => p.id !== product?.id)
    .slice(0, 4);

  if (q.isLoading)
    return (
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-card border-2.5 border-ink rounded-3xl nb-shadow" />
          <div className="space-y-4">
            <div className="h-10 bg-card rounded nb-shadow-sm" />
            <div className="h-6 bg-card rounded w-1/2 nb-shadow-sm" />
            <div className="h-32 bg-card rounded nb-shadow-sm" />
          </div>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-mustard border-2.5 border-ink nb-shadow flex items-center justify-center mb-4">
          <Croissant size={36} className="text-terracotta" />
        </div>
        <h1 className="font-display font-black text-2xl">Cake not found</h1>
        <BakeryButton className="mt-5" onClick={() => navigate({ name: "search" })}>
          Browse all cakes
        </BakeryButton>
      </div>
    );

  const weight = product.weights[weightIdx] || product.weights[0];
  const inWish = wishlist.includes(product.id);
  const savings = weight.mrp ? weight.mrp - weight.price : 0;

  const handleAdd = () => {
    if (!weight) return;
    // Login required to add to cart
    if (!fbReady) return;
    if (!fbUser) {
      toast.info("Please login to add cakes to your cart");
      navigate({ name: "account" });
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url || "",
      weight: weight.weight,
      weightLabel: weight.label,
      qty,
      price: weight.price,
    });
    toast.success(`Added ${qty} × ${product.name} (${weight.label}) to cart!`);
  };

  const handleBuyNow = () => {
    handleAdd();
    navigate({ name: "cart" });
  };

  const share = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <button
        onClick={back}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-ink mb-5 font-semibold"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="flex flex-col gap-3">
          <div className="relative aspect-square rounded-3xl border-2.5 border-ink nb-shadow-lg overflow-hidden bg-cream">
            <img
              src={product.images[activeImg]?.url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {product.isBestSeller && <Pill color="terracotta"><Award size={11} /> Bestseller</Pill>}
              {product.eggless && <Pill color="cream"><Leaf size={11} /> Eggless</Pill>}
              {savings > 0 && <Pill color="mustard">Save {inr(savings)}</Pill>}
            </div>
          </div>
          <div className="flex gap-2">
            {product.images.slice(0, 3).map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImg(i)}
                className={cn(
                  "w-20 h-20 rounded-xl border-2.5 overflow-hidden nb-shadow-sm nb-press",
                  activeImg === i ? "border-terracotta" : "border-ink"
                )}
              >
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Pill color="cream">{product.categoryName}</Pill>
            {product.isFreshToday && <Pill color="mustard"><Flame size={11} /> Fresh today</Pill>}
          </div>
          <h1 className="font-display font-black text-3xl md:text-4xl text-ink leading-tight">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <StarRating rating={product.rating} size={18} showValue />
            <span className="text-sm text-muted-foreground">
              {product.reviewCount} reviews
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="font-display font-black text-4xl text-terracotta">
              {inr(weight.price)}
            </span>
            {weight.mrp && (
              <span className="text-lg text-muted-foreground line-through">
                {inr(weight.mrp)}
              </span>
            )}
          </div>

          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Weight selector */}
          <div className="mt-6">
            <div className="text-sm font-semibold mb-2">Choose weight</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {product.weights.map((w, i) => (
                <button
                  key={w.id}
                  onClick={() => setWeightIdx(i)}
                  className={cn(
                    "px-3 py-2.5 rounded-xl border-2.5 border-ink text-left nb-shadow-sm nb-press transition",
                    weightIdx === i ? "bg-terracotta text-white" : "bg-card text-ink hover:bg-cream"
                  )}
                >
                  <div className="text-xs font-bold leading-tight">{w.label}</div>
                  <div className={cn("text-sm font-display font-black", weightIdx === i ? "text-white" : "text-terracotta")}>
                    {inr(w.price)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 bg-card border-2.5 border-ink rounded-full nb-shadow-sm">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-cream rounded-l-full"
                aria-label="Decrease"
              >
                <Minus size={16} />
              </button>
              <span className="w-8 text-center font-bold">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-cream rounded-r-full"
                aria-label="Increase"
              >
                <Plus size={16} />
              </button>
            </div>
            <BakeryButton variant="primary" className="flex-1 min-w-[160px]" onClick={handleAdd}>
              <ShoppingBag size={16} className="mr-1.5" /> Add to Cart
            </BakeryButton>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={cn(
                "w-11 h-11 rounded-full border-2.5 border-ink flex items-center justify-center nb-shadow-sm nb-press",
                inWish ? "bg-burgundy text-white" : "bg-card"
              )}
              aria-label="Wishlist"
            >
              <Heart size={18} className={cn(inWish && "fill-white")} />
            </button>
            <button
              onClick={share}
              className="w-11 h-11 rounded-full border-2.5 border-ink bg-card flex items-center justify-center nb-shadow-sm nb-press"
              aria-label="Share"
            >
              <Share2 size={18} />
            </button>
          </div>
          <BakeryButton variant="mustard" className="mt-3 w-full" onClick={handleBuyNow}>
            Reserve &amp; Pickup — Buy Now
          </BakeryButton>

          {/* Quick facts */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <BakeryCard className="p-3 flex items-center gap-2.5">
              <Clock size={18} className="text-terracotta" />
              <div>
                <div className="text-[11px] text-muted-foreground">Prep time</div>
                <div className="font-semibold">
                  {product.prepHours < 24
                    ? `${product.prepHours} hours`
                    : `${Math.ceil(product.prepHours / 24)} days`}
                </div>
              </div>
            </BakeryCard>
            <BakeryCard className="p-3 flex items-center gap-2.5">
              {product.eggless ? <Leaf size={18} className="text-terracotta" /> : <Sparkles size={18} className="text-terracotta" />}
              <div>
                <div className="text-[11px] text-muted-foreground">Type</div>
                <div className="font-semibold">{product.eggless ? "100% Eggless" : "Contains egg"}</div>
              </div>
            </BakeryCard>
          </div>

          <div className="mt-3 text-xs text-muted-foreground bg-mustard/20 border-2 border-ink/20 rounded-xl p-3 flex gap-2">
            <Check size={16} className="text-terracotta shrink-0 mt-0.5" />
            <span>
              Available for pickup. Pre-book at least{" "}
              <b>{product.prepHours < 24 ? `${product.prepHours} hours` : `${Math.ceil(product.prepHours / 24)} days`}</b>{" "}
              in advance. Pay at pickup or online.
            </span>
          </div>
        </div>
      </div>

      {/* AI suggestion: Customers also loved */}
      {related.length > 0 && (
        <section className="mt-16">
          <SectionTitle subtitle="Customers who viewed this cake also loved these.">
            <span className="inline-flex items-center gap-2">
              <Sparkles size={22} className="text-terracotta" /> Perfect With This
            </span>
          </SectionTitle>
          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Tabs: description / ingredients / reviews */}
      <section className="mt-14">
        <div className="flex gap-2 border-b-2 border-ink overflow-x-auto nb-scroll">
          {[
            { v: "desc", l: "Description" },
            { v: "ingredients", l: "Ingredients & Allergens" },
            { v: "reviews", l: `Reviews (${reviews.length})` },
          ].map((t) => (
            <button
              key={t.v}
              onClick={() => setTab(t.v as any)}
              className={cn(
                "px-4 py-3 font-display font-bold text-sm whitespace-nowrap border-b-[3px] -mb-[2px] transition",
                tab === t.v
                  ? "border-terracotta text-terracotta"
                  : "border-transparent text-muted-foreground hover:text-ink"
              )}
            >
              {t.l}
            </button>
          ))}
        </div>

        <div className="py-6">
          {tab === "desc" && (
            <p className="text-muted-foreground leading-relaxed max-w-3xl">
              {product.description}
            </p>
          )}
          {tab === "ingredients" && (
            <BakeryCard className="p-5 max-w-3xl">
              <p className="text-sm leading-relaxed text-ink">{product.ingredients}</p>
              <div className="mt-3 text-xs text-burgundy font-semibold flex items-center gap-1.5">
                <Leaf size={14} /> Allergen info: contains dairy &amp; gluten. Please inform us of any allergies in Special Requirements at checkout.
              </div>
            </BakeryCard>
          )}
          {tab === "reviews" && <ReviewsSection productId={product.id} reviews={reviews} rating={product.rating} />}
        </div>
      </section>
    </div>
  );
}

function ReviewsSection({
  productId,
  reviews,
  rating,
}: {
  productId: string;
  reviews: any[];
  rating: number;
}) {
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center gap-6 mb-6">
        <BakeryCard className="p-5 text-center min-w-[140px]">
          <div className="font-display font-black text-4xl text-terracotta">
            {rating.toFixed(1)}
          </div>
          <StarRating rating={rating} size={16} />
          <div className="text-xs text-muted-foreground mt-1">
            {reviews.length} reviews
          </div>
        </BakeryCard>
        <BakeryButton variant="outline" onClick={() => setShowForm((s) => !s)}>
          <MessageSquarePlus size={16} className="mr-1.5" /> Write a review
        </BakeryButton>
      </div>

      {showForm && (
        <ReviewForm
          productId={productId}
          onDone={() => {
            setShowForm(false);
            qc.invalidateQueries({ queryKey: ["reviews", productId] });
          }}
        />
      )}

      <div className="space-y-3">
        {reviews.length === 0 && (
          <BakeryCard className="p-6 text-center text-muted-foreground">
            No reviews yet. Be the first to share your experience!
          </BakeryCard>
        )}
        {reviews.map((r) => (
          <BakeryCard key={r.id} className="p-5">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-mustard border-2 border-ink flex items-center justify-center font-bold">
                  {r.customerName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-sm">{r.customerName}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {formatDate(r.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {r.verified && <Pill color="cream" className="text-[10px]"><Check size={10} /> Verified</Pill>}
                <StarRating rating={r.rating} size={14} />
              </div>
            </div>
            {r.title && (
              <div className="font-display font-bold text-base mb-1">{r.title}</div>
            )}
            <p className="text-sm text-muted-foreground">{r.body}</p>
          </BakeryCard>
        ))}
      </div>
    </div>
  );
}

function ReviewForm({ productId, onDone }: { productId: string; onDone: () => void }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createReview({ productId, customerName: name, rating, title, body });
      toast.success("Thank you! Your review will appear after moderation.");
      onDone();
    } catch {
      toast.error("Could not submit review.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <BakeryCard className="p-5 mb-6 border-terracotta">
      <form onSubmit={submit} className="space-y-3">
        <div className="grid sm:grid-cols-2 gap-3">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="bg-cream border-2 border-ink rounded-xl px-3 py-2 text-sm outline-none"
          />
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Rating:</span>
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setRating(i)}
                className="p-0.5"
              >
                <Star size={22} className={i <= rating ? "fill-mustard text-mustard" : "fill-muted text-muted-foreground/30"} />
              </button>
            ))}
          </div>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Review title (optional)"
          className="w-full bg-cream border-2 border-ink rounded-xl px-3 py-2 text-sm outline-none"
        />
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell us about your experience…"
          rows={3}
          className="w-full bg-cream border-2 border-ink rounded-xl px-3 py-2 text-sm outline-none resize-none"
        />
        <div className="flex justify-end gap-2">
          <BakeryButton variant="ghost" type="button" onClick={onDone}>
            Cancel
          </BakeryButton>
          <BakeryButton variant="primary" type="submit" disabled={saving}>
            {saving ? "Submitting…" : "Submit review"}
          </BakeryButton>
        </div>
      </form>
    </BakeryCard>
  );
}
