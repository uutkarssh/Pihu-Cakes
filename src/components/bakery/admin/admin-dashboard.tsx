"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { inr, formatDate } from "@/lib/format";
import { ORDER_STATUS_META } from "@/lib/brand";
import { BakeryButton, BakeryCard, Pill, SectionTitle } from "../ui";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  PackageCheck,
  Sparkles,
  Loader2,
  Wand2,
  IndianRupee,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PIE = ["#C6613D", "#E8B84B", "#8B3A3A", "#D98E5F", "#B58A3C"];

export function AdminDashboard() {
  const statsQ = useQuery({ queryKey: ["admin-stats"], queryFn: api.adminStats });
  const insightsQ = useQuery({ queryKey: ["ai-insights"], queryFn: api.adminAiInsights, staleTime: 120000 });
  const s = statsQ.data;

  return (
    <div className="space-y-6">
      {/* KPI cards — redesigned with icon + colored top accent */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Kpi icon={<ShoppingBag size={20} />} label="Today's Orders" value={String(s?.todaysOrders ?? "—")} color="terracotta" />
        <Kpi icon={<IndianRupee size={20} />} label="Total Revenue" value={s ? inr(s.revenue) : "—"} color="mustard" />
        <Kpi icon={<Clock size={20} />} label="Pending Orders" value={String(s?.pending ?? "—")} color="burgundy" />
        <Kpi icon={<PackageCheck size={20} />} label="Ready for Pickup" value={String(s?.ready ?? "—")} color="terracotta" />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-5">
        <BakeryCard className="nb-shadow-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-terracotta/15 border-2 border-ink flex items-center justify-center">
              <TrendingUp size={15} className="text-terracotta" />
            </div>
            <h3 className="font-display font-bold text-lg">Monthly Revenue</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={s?.months ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00000020" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => inr(v)} contentStyle={{ borderRadius: 12, border: "2px solid #231C14" }} />
              <Bar dataKey="revenue" fill="#C6613D" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </BakeryCard>

        <BakeryCard className="nb-shadow-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-burgundy/15 border-2 border-ink flex items-center justify-center">
              <Sparkles size={15} className="text-burgundy" />
            </div>
            <h3 className="font-display font-bold text-lg">Customer Growth</h3>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={s?.customerGrowth ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00000020" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "2px solid #231C14" }} />
              <Line type="monotone" dataKey="customers" stroke="#8B3A3A" strokeWidth={3} dot={{ r: 4, fill: "#E8B84B", stroke: "#231C14" }} />
            </LineChart>
          </ResponsiveContainer>
        </BakeryCard>
      </div>

      {/* Popular products + busy slots */}
      <div className="grid lg:grid-cols-2 gap-5">
        <BakeryCard className="nb-shadow-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-mustard/30 border-2 border-ink flex items-center justify-center">
              <Sparkles size={15} className="text-terracotta" />
            </div>
            <h3 className="font-display font-bold text-lg">Best Selling Cakes</h3>
          </div>
          <div className="space-y-3">
            {(s?.popular ?? []).map((p: any, i: number) => (
              <div key={p.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-mustard border-2 border-ink flex items-center justify-center font-display font-black text-sm shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{p.name}</div>
                  <div className="h-2.5 bg-cream rounded-full overflow-hidden border border-ink/20 mt-1">
                    <div
                      className="h-full bg-terracotta rounded-full"
                      style={{ width: `${Math.min(100, (p.qty / (s?.popular[0]?.qty || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs font-bold text-terracotta shrink-0">{p.qty} sold</div>
              </div>
            ))}
            {(!s?.popular || s.popular.length === 0) && (
              <div className="text-sm text-muted-foreground text-center py-6">No sales yet.</div>
            )}
          </div>
        </BakeryCard>

        <BakeryCard className="nb-shadow-soft p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-terracotta/15 border-2 border-ink flex items-center justify-center">
              <Clock size={15} className="text-terracotta" />
            </div>
            <h3 className="font-display font-bold text-lg">Busy Pickup Slots</h3>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={s?.busySlots ?? []}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={(e: any) => e.label}
              >
                {(s?.busySlots ?? []).map((_: any, i: number) => (
                  <Cell key={i} fill={PIE[i % PIE.length]} stroke="#231C14" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "2px solid #231C14" }} />
            </PieChart>
          </ResponsiveContainer>
        </BakeryCard>
      </div>

      {/* AI order insights */}
      <BakeryCard className="nb-shadow-soft p-5 bg-cream border-terracotta">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-terracotta border-2 border-ink flex items-center justify-center nb-shadow-sm">
              <Wand2 size={15} className="text-white" />
            </div>
            <h3 className="font-display font-bold text-lg">AI Order Insights</h3>
          </div>
          <Pill color="terracotta"><Sparkles size={11} /> AI-Powered</Pill>
        </div>
        {insightsQ.isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground text-sm py-3">
            <Loader2 size={15} className="animate-spin" /> Pihu is analysing your orders…
          </div>
        ) : (
          <pre className="text-sm text-ink whitespace-pre-wrap font-sans leading-relaxed bg-card border-2 border-ink/15 rounded-xl p-4">
            {insightsQ.data?.insights}
          </pre>
        )}
      </BakeryCard>

      {/* Recent orders */}
      <BakeryCard className="nb-shadow-soft p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-mustard/30 border-2 border-ink flex items-center justify-center">
            <ShoppingBag size={15} className="text-terracotta" />
          </div>
          <h3 className="font-display font-bold text-lg">Recent Orders</h3>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto nb-scroll">
          {(s?.recent ?? []).map((o: any) => (
            <div key={o.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-cream border-2 border-ink/10">
              <div className="min-w-0">
                <div className="font-display font-black text-sm text-terracotta">{o.orderId}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {o.customerName} · {o.mobile}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-sm">{inr(o.total)}</div>
                <Pill color="mustard" className="text-[10px]">{ORDER_STATUS_META[o.status]?.label}</Pill>
              </div>
            </div>
          ))}
          {(!s?.recent || s.recent.length === 0) && (
            <div className="text-sm text-muted-foreground text-center py-6">No orders yet.</div>
          )}
        </div>
      </BakeryCard>
    </div>
  );
}

function Kpi({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const styles: Record<string, { bg: string; iconBg: string; iconText: string; accent: string }> = {
    terracotta: {
      bg: "bg-card",
      iconBg: "bg-terracotta",
      iconText: "text-white",
      accent: "border-l-terracotta",
    },
    mustard: {
      bg: "bg-card",
      iconBg: "bg-mustard",
      iconText: "text-ink",
      accent: "border-l-mustard",
    },
    burgundy: {
      bg: "bg-card",
      iconBg: "bg-burgundy",
      iconText: "text-white",
      accent: "border-l-burgundy",
    },
  };
  const st = styles[color];
  return (
    <BakeryCard className={cn("nb-shadow-soft p-4 relative overflow-hidden border-l-[6px]", st.accent)}>
      <div className={cn("w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center nb-shadow-sm mb-2.5", st.iconBg, st.iconText)}>
        {icon}
      </div>
      <div className="text-xs text-muted-foreground font-medium">{label}</div>
      <div className="font-display font-black text-xl sm:text-2xl text-ink truncate">{value}</div>
    </BakeryCard>
  );
}
