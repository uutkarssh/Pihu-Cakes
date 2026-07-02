"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { BakeryButton, BakeryCard, Pill, StarRating } from "../ui";
import { Check, X, Sparkles, Loader2, Wand2, Shield } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AdminReviews() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("pending");
  const reviewsQ = useQuery({
    queryKey: ["admin-reviews", status],
    queryFn: () => api.adminAllReviews(status),
  });
  const reviews = reviewsQ.data?.reviews ?? [];

  const [summary, setSummary] = useState<any>(null);
  const [sumLoading, setSumLoading] = useState(false);

  const act = async (id: string, s: string) => {
    try {
      await api.adminUpdateReview(id, s);
      toast.success(s === "approved" ? "Review approved" : "Review rejected");
      qc.invalidateQueries({ queryKey: ["admin-reviews"] });
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const genSummary = async () => {
    setSumLoading(true);
    try {
      const r = await api.adminAiReviewSummary(undefined);
      setSummary(r);
    } catch {
      toast.error("Could not summarize");
    } finally {
      setSumLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI summary */}
      <BakeryCard className="nb-shadow-soft p-5 bg-cream border-terracotta">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-bold text-lg flex items-center gap-2">
            <Wand2 size={18} className="text-terracotta" /> AI Review Summarization
          </h3>
          <BakeryButton variant="outline" className="text-sm" onClick={genSummary} disabled={sumLoading}>
            {sumLoading ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : <Sparkles size={15} className="mr-1.5" />}
            Summarize all reviews
          </BakeryButton>
        </div>
        {summary && (
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Pill color="mustard">{summary.count} reviews</Pill>
              <Pill color="terracotta">Avg {summary.avg} stars</Pill>
            </div>
            <pre className="text-sm text-ink whitespace-pre-wrap font-sans leading-relaxed bg-card border-2 border-ink/20 rounded-xl p-3">
              {summary.summary}
            </pre>
          </div>
        )}
      </BakeryCard>

      {/* Filter */}
      <BakeryCard className="nb-shadow-soft p-4">
        <div className="flex gap-2 flex-wrap">
          {[
            { v: "pending", l: "Pending" },
            { v: "approved", l: "Approved" },
            { v: "rejected", l: "Rejected" },
            { v: "all", l: "All" },
          ].map((t) => (
            <button
              key={t.v}
              onClick={() => setStatus(t.v)}
              className={cn(
                "px-3 py-1.5 rounded-full border-2 border-ink text-xs font-bold nb-shadow-sm nb-press",
                status === t.v ? "bg-terracotta text-white" : "bg-card text-ink"
              )}
            >
              {t.l}
            </button>
          ))}
        </div>
      </BakeryCard>

      {/* List */}
      <div className="space-y-3">
        {reviewsQ.isLoading && (
          <BakeryCard className="nb-shadow-soft p-8 text-center text-muted-foreground">Loading reviews…</BakeryCard>
        )}
        {reviews.length === 0 && !reviewsQ.isLoading && (
          <BakeryCard className="nb-shadow-soft p-8 text-center text-muted-foreground">
            No {status} reviews.
          </BakeryCard>
        )}
        {reviews.map((r: any) => (
          <BakeryCard key={r.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="w-9 h-9 rounded-full bg-mustard border-2 border-ink flex items-center justify-center font-bold text-sm shrink-0">
                    {r.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{r.customerName}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {r.product?.name} · {formatDate(r.createdAt)}
                    </div>
                  </div>
                  <StarRating rating={r.rating} size={13} />
                  {r.verified && <Pill color="cream" className="text-[10px]">Verified</Pill>}
                </div>
                {r.title && <div className="font-display font-bold text-sm mt-2">{r.title}</div>}
                <p className="text-sm text-muted-foreground mt-1">{r.body}</p>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button
                  onClick={() => act(r.id, "approved")}
                  className="px-3 py-1.5 rounded-full border-2 border-ink bg-[#6B8E23] text-white text-xs font-bold nb-shadow-sm nb-press flex items-center gap-1"
                >
                  <Check size={12} /> Approve
                </button>
                <button
                  onClick={() => act(r.id, "rejected")}
                  className="px-3 py-1.5 rounded-full border-2 border-ink bg-burgundy text-white text-xs font-bold nb-shadow-sm nb-press flex items-center gap-1"
                >
                  <X size={12} /> Reject
                </button>
              </div>
            </div>
          </BakeryCard>
        ))}
      </div>
    </div>
  );
}
