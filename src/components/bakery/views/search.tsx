"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useApp } from "@/lib/store";
import { ProductCard } from "../product-card";
import { BakeryCard, BakeryButton, Pill } from "../ui";
import { Search, SlidersHorizontal, Sparkles, X, Leaf, Croissant } from "lucide-react";
import { cn } from "@/lib/utils";

const sorts = [
  { v: "newest", l: "Newest" },
  { v: "popular", l: "Popular" },
  { v: "price", l: "Price: Low to High" },
  { v: "price-desc", l: "Price: High to Low" },
  { v: "rating", l: "Top Rated" },
];

export function SearchView({ query, category }: { query?: string; category?: string }) {
  const [q, setQ] = useState(query || "");
  const [cat, setCat] = useState(category || "all");
  const [sort, setSort] = useState("newest");
  const [eggless, setEggless] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<any[] | null>(null);
  const [aiExplanation, setAiExplanation] = useState("");

  const catsQ = useQuery({ queryKey: ["categories"], queryFn: api.categories });
  const categories = catsQ.data?.categories ?? [];

  useEffect(() => {
    if (query !== undefined) setQ(query);
  }, [query]);
  useEffect(() => {
    if (category !== undefined) setCat(category || "all");
  }, [category]);

  const productsQ = useQuery({
    queryKey: ["products", q, cat, sort, eggless ? "1" : "0"],
    queryFn: () =>
      api.products({
        q,
        category: cat,
        sort,
        eggless: eggless ? "1" : "0",
      }),
  });
  const products = productsQ.data?.products ?? [];

  const runAI = async () => {
    if (!aiQuery.trim()) return;
    setAiLoading(true);
    setAiResults(null);
    try {
      const res = await api.aiSmartSearch(aiQuery);
      setAiResults(res.products);
      setAiExplanation(res.explanation);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
      <div className="mb-6">
        <h1 className="font-display font-black text-3xl md:text-4xl text-ink">
          Our Cakes &amp; Bakes
        </h1>
        <p className="text-muted-foreground mt-1">
          Freshly baked, handmade with premium ingredients. Reserve online, pick up in store.
        </p>
      </div>

      {/* AI smart search */}
      <BakeryCard className="p-4 md:p-5 mb-6 bg-cream">
        <div className="flex items-center gap-2 mb-3">
          <Pill color="terracotta"><Sparkles size={12} /> AI Smart Search</Pill>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Try: "eggless chocolate cake under 700" or "birthday cake for 10 people"
          </span>
        </div>
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-card border-2.5 border-ink rounded-full px-4 py-2.5 nb-shadow-sm">
            <Sparkles size={18} className="text-terracotta shrink-0" />
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAI()}
              placeholder="Describe your perfect cake in your own words…"
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>
          <BakeryButton variant="primary" onClick={runAI} disabled={aiLoading}>
            {aiLoading ? "Searching…" : "Ask AI"}
          </BakeryButton>
        </div>
        {aiExplanation && (
          <p className="text-xs text-terracotta mt-2 italic">{aiExplanation}</p>
        )}
      </BakeryCard>

      {/* AI results */}
      {aiResults !== null && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-xl flex items-center gap-2">
              <Sparkles size={18} className="text-terracotta" /> AI matches
              <span className="text-muted-foreground text-sm font-normal">
                ({aiResults.length})
              </span>
            </h2>
            <button
              onClick={() => setAiResults(null)}
              className="text-sm text-muted-foreground hover:text-ink flex items-center gap-1"
            >
              <X size={14} /> Clear
            </button>
          </div>
          {aiResults.length === 0 ? (
            <BakeryCard className="p-6 text-center text-muted-foreground">
              No matches found — try rephrasing, or browse all cakes below.
            </BakeryCard>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {aiResults.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-card border-2.5 border-ink rounded-full px-4 py-2.5 nb-shadow-sm">
          <Search size={18} className="text-terracotta shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, flavour, tag…"
            className="bg-transparent outline-none w-full text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={cat}
            onChange={(e) => setCat(e.target.value)}
            className="bg-card border-2.5 border-ink rounded-full px-4 py-2.5 text-sm font-semibold nb-shadow-sm outline-none cursor-pointer"
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-card border-2.5 border-ink rounded-full px-4 py-2.5 text-sm font-semibold nb-shadow-sm outline-none cursor-pointer"
          >
            {sorts.map((s) => (
              <option key={s.v} value={s.v}>
                {s.l}
              </option>
            ))}
          </select>
          <button
            onClick={() => setEggless((e) => !e)}
            className={cn(
              "px-4 py-2.5 rounded-full border-2.5 border-ink text-sm font-semibold nb-shadow-sm nb-press flex items-center gap-1.5",
              eggless ? "bg-mustard text-ink" : "bg-card text-ink"
            )}
          >
            <Leaf size={15} /> Eggless
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <SlidersHorizontal size={15} />
        {productsQ.isLoading ? "Loading cakes…" : `${products.length} cakes found`}
      </div>

      {productsQ.isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border-2.5 border-ink rounded-2xl nb-shadow animate-pulse h-80" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <BakeryCard className="p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-mustard border-2 border-ink nb-shadow-sm flex items-center justify-center mb-3">
            <Croissant size={28} className="text-terracotta" />
          </div>
          <h3 className="font-display font-bold text-xl">No cakes found</h3>
          <p className="text-muted-foreground mt-1">Try a different search or filter.</p>
        </BakeryCard>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
