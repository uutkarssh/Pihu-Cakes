"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { BRAND } from "@/lib/brand";
import { BakeryButton, BakeryCard, Pill, SectionTitle, StarRating, CategoryIcon } from "../ui";
import { ProductCard } from "../product-card";
import { useState } from "react";
import {
  Sparkles,
  Flame,
  Award,
  Leaf,
  Store,
  Clock,
  Cake,
  MessageSquareText,
  ChevronDown,
  MapPin,
  PartyPopper,
  Check,
  Citrus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const trustBadges = [
  { icon: Flame, title: "Freshly Baked", text: "Every single day" },
  { icon: Award, title: "Premium Ingredients", text: "No compromises" },
  { icon: Cake, title: "Made to Order", text: "Handcrafted for you" },
  { icon: Store, title: "Store Pickup", text: "Reserve & collect" },
];

const occasions = ["Birthday", "Anniversary", "Wedding", "Baby Shower", "Farewell", "Festival"];

export function HomeView() {
  const navigate = useApp((s) => s.navigate);
  const productsQ = useQuery({ queryKey: ["products", "home"], queryFn: () => api.products() });
  const catsQ = useQuery({ queryKey: ["categories"], queryFn: api.categories });
  const reviewsQ = useQuery({ queryKey: ["featured-reviews"], queryFn: api.featuredReviews });
  const contentQ = useQuery({ queryKey: ["content"], queryFn: api.content });

  const products = productsQ.data?.products ?? [];
  const categories = catsQ.data?.categories ?? [];
  const reviews = reviewsQ.data?.reviews ?? [];
  const content = contentQ.data?.content ?? {};
  const faqs = content.faqs ? safeParse(content.faqs) : [];

  const fresh = products.filter((p) => p.isFreshToday);
  const best = products.filter((p) => p.isBestSeller);
  const featured = products.filter((p) => p.isFeatured);
  const pastries = products.filter((p) => p.categoryName === "Pastries");

  const openChat = () =>
    window.dispatchEvent(new CustomEvent("toggle-bakery-chat", { detail: true }));

  return (
    <div className="pb-10">
      {/* HERO */}
      <section className="relative overflow-hidden border-b-2.5 border-ink">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-16 grid md:grid-cols-2 gap-8 items-center">
          <div className="relative z-10">
            <Pill color="mustard" className="mb-4">
              <Sparkles size={12} /> Freshly baked every morning
            </Pill>
            <h1 className="font-display font-black text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-ink">
              Freshly Baked.
              <br />
              <span className="italic text-terracotta">Made With Love.</span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-muted-foreground max-w-md">
              Reserve your celebration cake online and pick it up fresh from our
              neighbourhood bakery. Birthday, anniversary, wedding, designer &amp;
              eggless — handmade with care.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <BakeryButton variant="primary" onClick={() => navigate({ name: "search" })}>
                Order Fresh Today
              </BakeryButton>
              <BakeryButton variant="cream" onClick={openChat}>
                <Sparkles size={16} className="mr-1.5" /> Ask Pihu AI
              </BakeryButton>
            </div>
            <div className="mt-6 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <StarRating rating={4.9} size={16} />
                <span className="font-semibold">4.9</span>
                <span className="text-muted-foreground">· 600+ happy orders</span>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-3 -left-3 w-full h-full rounded-3xl bg-mustard border-2.5 border-ink" />
            <img
              src="/products/hero-bakery.png"
              alt="Fresh cakes and pastries at Pihu Cakes & Bakes"
              className="relative rounded-3xl border-2.5 border-ink nb-shadow-lg w-full object-cover aspect-[4/3]"
            />
            <div className="absolute -bottom-5 -right-3 bg-card border-2.5 border-ink rounded-2xl nb-shadow px-4 py-3 flex items-center gap-2 animate-float-y">
              <div className="w-9 h-9 rounded-full bg-terracotta flex items-center justify-center">
                <Store size={18} className="text-white" />
              </div>
              <div className="leading-tight">
                <div className="font-display font-bold text-sm">Pickup only</div>
                <div className="text-[11px] text-muted-foreground">Reserve · Collect · Enjoy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b-2.5 border-ink bg-mustard/30">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {trustBadges.map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-card border-2 border-ink flex items-center justify-center nb-shadow-sm shrink-0">
                <b.icon size={20} className="text-terracotta" />
              </div>
              <div className="leading-tight">
                <div className="font-display font-bold text-sm">{b.title}</div>
                <div className="text-xs text-muted-foreground">{b.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 space-y-16 mt-12">
        {/* Seasonal promo */}
        {content.seasonal_promo && (
          <SeasonalPromo data={safeParse(content.seasonal_promo)} onShop={() => navigate({ name: "search", category: "eggless-cakes" })} />
        )}

        {/* Categories */}
        <section>
          <SectionTitle
            align="center"
            subtitle="From everyday treats to once-in-a-lifetime celebrations — find the perfect cake for every moment."
          >
            Shop by Category
          </SectionTitle>
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            {categories.map((c) => (
              <BakeryCard
                key={c.id}
                hover
                className="p-4 flex flex-col items-center text-center gap-2"
                onClick={() => navigate({ name: "search", category: c.slug })}
              >
                <CategoryIcon slug={c.slug} size={32} className="text-terracotta" />
                <div className="font-display font-bold text-sm leading-tight">
                  {c.name}
                </div>
              </BakeryCard>
            ))}
          </div>
        </section>

        {/* Fresh Today */}
        {fresh.length > 0 && (
          <ProductRow
            title="Fresh Today"
            icon={<Flame className="text-terracotta" size={22} />}
            subtitle="Baked fresh this morning — pick them up today!"
            products={fresh.slice(0, 4)}
          />
        )}

        {/* Best sellers */}
        {best.length > 0 && (
          <ProductRow
            title="Best Sellers"
            icon={<Award className="text-mustard" size={22} />}
            subtitle="Our customers' all-time favourites."
            products={best.slice(0, 4)}
          />
        )}

        {/* AI occasion recommendations */}
        <AIRecommend />

        {/* Featured cakes */}
        {featured.length > 0 && (
          <ProductRow
            title="Featured Cakes"
            icon={<Cake className="text-burgundy" size={22} />}
            subtitle="Handpicked showstoppers for your celebration."
            products={featured.slice(0, 4)}
          />
        )}

        {/* Featured pastries */}
        {pastries.length > 0 && (
          <ProductRow
            title="Featured Pastries"
            icon={<Sparkles className="text-terracotta" size={22} />}
            subtitle="Little treats, big joy."
            products={pastries.slice(0, 4)}
          />
        )}

        {/* Reviews */}
        <section>
          <SectionTitle align="center" subtitle="Real words from our neighbourhood customers.">
            Loved by Our Neighbourhood
          </SectionTitle>
          <div className="mt-8 grid md:grid-cols-3 gap-5">
            {reviews.slice(0, 6).map((r) => (
              <BakeryCard key={r.id} className="p-5 flex flex-col gap-3">
                <StarRating rating={r.rating} size={16} />
                {r.title && (
                  <div className="font-display font-bold text-base text-ink">
                    {r.title}
                  </div>
                )}
                <p className="text-sm text-muted-foreground flex-1">"{r.body}"</p>
                <div className="flex items-center gap-2 pt-2 border-t-2 border-dashed border-ink/20">
                  <div className="w-8 h-8 rounded-full bg-mustard border-2 border-ink flex items-center justify-center font-bold text-sm">
                    {r.customerName.charAt(0)}
                  </div>
                  <div className="text-xs">
                    <div className="font-semibold">{r.customerName}</div>
                    {r.product?.name && (
                      <div className="text-muted-foreground">{r.product.name}</div>
                    )}
                  </div>
                  {r.verified && (
                    <Pill color="cream" className="ml-auto text-[10px]">
                      <Check size={10} /> Verified
                    </Pill>
                  )}
                </div>
              </BakeryCard>
            ))}
          </div>
        </section>

        {/* Map + contact teaser */}
        <section className="grid md:grid-cols-2 gap-5 items-stretch">
          <BakeryCard className="overflow-hidden p-0">
            <iframe
              title="Pihu Cakes & Bakes location"
              src={BRAND.mapEmbed}
              className="w-full h-full min-h-[280px] border-0"
              loading="lazy"
            />
          </BakeryCard>
          <BakeryCard className="p-6 flex flex-col gap-4">
            <div>
              <Pill color="terracotta" className="mb-2">Visit Us</Pill>
              <h3 className="font-display font-black text-2xl">Find our bakery</h3>
            </div>
            <div className="space-y-3 text-sm flex-1">
              <div className="flex gap-2.5">
                <MapPin size={18} className="text-terracotta shrink-0 mt-0.5" />
                <span>{BRAND.address}</span>
              </div>
              <div className="flex gap-2.5">
                <Clock size={18} className="text-terracotta shrink-0 mt-0.5" />
                <div>
                  {BRAND.hours.map((h) => (
                    <div key={h.day}>
                      <span className="font-semibold">{h.day}:</span> {h.time}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <BakeryButton variant="mustard" onClick={() => navigate({ name: "contact" })}>
              Full contact details
            </BakeryButton>
          </BakeryCard>
        </section>

        {/* FAQs */}
        {faqs.length > 0 && (
          <section>
            <SectionTitle align="center" subtitle="Everything you need to know about ordering & pickup.">
              Frequently Asked Questions
            </SectionTitle>
            <div className="mt-8 max-w-3xl mx-auto space-y-3">
              {faqs.map((f: any, i: number) => (
                <FaqItem key={i} q={f.q} a={f.a} />
              ))}
            </div>
          </section>
        )}

        {/* Fresh from our oven — gallery (no Instagram) */}
        <section>
          <SectionTitle align="center" subtitle="A peek at what's coming out of our oven this week.">
            Fresh From Our Oven
          </SectionTitle>
          <div className="mt-8 grid grid-cols-3 md:grid-cols-6 gap-3">
            {products.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="aspect-square rounded-2xl border-2.5 border-ink overflow-hidden nb-shadow-sm nb-hover-lift cursor-pointer"
                onClick={() => navigate({ name: "product", slug: p.slug })}
              >
                <img
                  src={p.images[0]?.url}
                  alt={p.name}
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-110 transition duration-500"
                />
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section>
          <BakeryCard className="bg-ink text-cream p-8 md:p-12 text-center relative overflow-hidden">
            <PartyPopper className="absolute -top-4 -right-4 text-mustard/20" size={120} />
            <h2 className="font-display font-black text-3xl md:text-4xl relative">
              Ready to taste the <span className="text-mustard italic">freshness?</span>
            </h2>
            <p className="mt-3 text-cream/80 max-w-xl mx-auto relative">
              Reserve your cake in under 2 minutes. Pay at pickup or online — your call.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center relative">
              <BakeryButton variant="mustard" onClick={() => navigate({ name: "search" })}>
                Browse all cakes
              </BakeryButton>
              <BakeryButton variant="cream" onClick={openChat}>
                <MessageSquareText size={16} className="mr-1.5" /> Chat with Pihu AI
              </BakeryButton>
            </div>
          </BakeryCard>
        </section>
      </div>
    </div>
  );
}

function ProductRow({
  title,
  subtitle,
  icon,
  products,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  products: any[];
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-ink flex items-center gap-2.5">
            {icon} {title}
          </h2>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

function SeasonalPromo({ data, onShop }: { data: any; onShop: () => void }) {
  return (
    <section>
      <div className="bg-burgundy text-cream border-2.5 border-ink rounded-3xl nb-shadow p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-mustard border-2 border-ink flex items-center justify-center shrink-0">
          <Citrus size={30} className="text-burgundy" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <Pill color="mustard" className="mb-2">Seasonal Special</Pill>
          <h3 className="font-display font-black text-2xl md:text-3xl">
            {data.title}
          </h3>
          <p className="text-cream/85 mt-1">{data.text}</p>
        </div>
        <BakeryButton variant="mustard" onClick={onShop}>
          Try it now
        </BakeryButton>
      </div>
    </section>
  );
}

function AIRecommend() {
  const [occasion, setOccasion] = useState("Birthday");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const navigate = useApp((s) => s.navigate);

  const run = async (occ?: string) => {
    const o = occ || occasion;
    setOccasion(o);
    setLoading(true);
    try {
      const res = await api.aiRecommend({ occasion: o });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section>
      <BakeryCard className="p-6 md:p-8 bg-cream border-terracotta">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
          <div className="flex-1">
            <Pill color="terracotta" className="mb-2">
              <Sparkles size={12} /> AI-Powered
            </Pill>
            <h2 className="font-display font-black text-2xl md:text-3xl text-ink">
              What's the occasion?
            </h2>
            <p className="text-muted-foreground mt-1">
              Let our bakery AI suggest the perfect cake for your celebration.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {occasions.map((o) => (
            <button
              key={o}
              onClick={() => run(o)}
              className={cn(
                "px-4 py-2 rounded-full border-2 border-ink text-sm font-bold nb-shadow-sm nb-press transition",
                occasion === o ? "bg-terracotta text-white" : "bg-card text-ink hover:bg-mustard/40"
              )}
            >
              {o}
            </button>
          ))}
        </div>

        {loading && (
          <div className="mt-6 flex items-center gap-3 text-muted-foreground">
            <Sparkles className="animate-pulse text-terracotta" size={18} /> Pihu is picking the perfect cakes…
          </div>
        )}

        {!loading && result && (
          <div className="mt-6">
            <p className="font-display font-bold text-lg text-ink mb-4">
              {result.intro || "Here are our picks:"}
            </p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(result.recommendations || []).slice(0, 4).map((r: any) => (
                <BakeryCard key={r.product.id} hover className="overflow-hidden flex flex-col" onClick={() => navigate({ name: "product", slug: r.product.slug })}>
                  <div className="aspect-square overflow-hidden border-b-2.5 border-ink">
                    <img src={r.product.images[0]?.url} alt={r.product.name} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3 flex flex-col gap-1.5 flex-1">
                    <div className="font-display font-bold text-sm leading-tight line-clamp-1">{r.product.name}</div>
                    <p className="text-[11px] text-terracotta italic leading-snug">"{r.reason}"</p>
                  </div>
                </BakeryCard>
              ))}
            </div>
          </div>
        )}
      </BakeryCard>
    </section>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <BakeryCard className="overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 p-4 text-left"
      >
        <span className="font-display font-bold text-base text-ink">{q}</span>
        <ChevronDown
          size={20}
          className={cn("text-terracotta shrink-0 transition", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
          {a}
        </div>
      )}
    </BakeryCard>
  );
}

function safeParse(s: string): any {
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}
