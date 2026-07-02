"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { inr, formatDateTime } from "@/lib/format";
import { ORDER_STATUS, ORDER_STATUS_META } from "@/lib/brand";
import { BakeryButton, BakeryCard, Pill } from "../ui";
import {
  Search,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Loader2,
  Phone,
  Cake,
  PackageX,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AdminOrders() {
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [waLink, setWaLink] = useState<{ id: string; url: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const qc = useQueryClient();

  const ordersQ = useQuery({
    queryKey: ["admin-orders", status, q],
    queryFn: () => api.adminOrders({ status, q }),
  });
  const orders = ordersQ.data?.orders ?? [];

  const update = async (id: string, newStatus: string) => {
    setBusy(id);
    try {
      const res = await api.adminUpdateOrder(id, { status: newStatus });
      if (res.whatsappLink) {
        setWaLink({ id, url: res.whatsappLink });
      }
      toast.success(`Order moved to ${ORDER_STATUS_META[newStatus]?.label}`);
      qc.invalidateQueries({ queryKey: ["admin-orders"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    } finally {
      setBusy(null);
    }
  };

  const statusFlow = (cur: string) => {
    const i = ORDER_STATUS.indexOf(cur as any);
    if (i < 0 || cur === "PICKED_UP" || cur === "CANCELLED") return [];
    return ORDER_STATUS.slice(i + 1).filter((s) => s !== "CANCELLED");
  };

  return (
    <div className="space-y-4">
      <BakeryCard className="nb-shadow-soft p-4">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-cream border-2 border-ink rounded-full px-4 py-2 nb-shadow-sm">
            <Search size={16} className="text-terracotta" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by order id, name, mobile…"
              className="bg-transparent outline-none w-full text-sm"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-card border-2 border-ink rounded-full px-4 py-2 text-sm font-semibold nb-shadow-sm outline-none"
          >
            <option value="all">All statuses</option>
            {ORDER_STATUS.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
      </BakeryCard>

      {/* WhatsApp modal */}
      {waLink && (
        <BakeryCard className="nb-shadow-soft p-4 sm:p-5 bg-[#25D366]/15 border-[#25D366]">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center border-2 border-ink nb-shadow-sm shrink-0">
              <MessageCircle size={20} />
            </div>
            <div className="flex-1 min-w-[180px]">
              <h3 className="font-display font-bold text-sm sm:text-base">WhatsApp confirmation ready!</h3>
              <p className="text-xs text-muted-foreground">
                Order {waLink.id} accepted. Send the prefilled WhatsApp message to confirm with the customer.
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <BakeryButton variant="ghost" className="text-sm flex-1 sm:flex-none" onClick={() => setWaLink(null)}>
                Close
              </BakeryButton>
              <a href={waLink.url} target="_blank" rel="noreferrer" className="flex-1 sm:flex-none">
                <BakeryButton variant="primary" className="text-sm w-full">Open WhatsApp</BakeryButton>
              </a>
            </div>
          </div>
        </BakeryCard>
      )}

      {ordersQ.isLoading ? (
        <BakeryCard className="nb-shadow-soft p-8 text-center text-muted-foreground">Loading orders…</BakeryCard>
      ) : orders.length === 0 ? (
        <BakeryCard className="nb-shadow-soft p-10 text-center">
          <div className="w-16 h-16 mx-auto rounded-full bg-mustard border-2 border-ink nb-shadow-sm flex items-center justify-center mb-3">
            <PackageX size={28} className="text-terracotta" />
          </div>
          <h3 className="font-display font-bold text-lg">No orders found</h3>
          <p className="text-sm text-muted-foreground">Try a different filter or search.</p>
        </BakeryCard>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <BakeryCard key={o.id} className="overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                className="w-full flex flex-wrap items-center gap-3 p-4 text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-black text-terracotta">{o.orderId}</span>
                    <Pill color={o.status === "CANCELLED" ? "burgundy" : o.status === "PICKED_UP" ? "cream" : "mustard"}>
                      {ORDER_STATUS_META[o.status]?.label}
                    </Pill>
                    {o.couponCode && <Pill color="cream" className="text-[10px]">{o.couponCode}</Pill>}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {o.customerName} · +91 {o.mobile} · {formatDateTime(o.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-black text-lg">{inr(o.total)}</div>
                  <div className="text-[11px] text-muted-foreground">
                    Pickup: {o.pickupDate} · {o.pickupSlot}
                  </div>
                </div>
                {expanded === o.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              {expanded === o.id && (
                <div className="border-t-2 border-ink/15 p-4 bg-cream/50 space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-1">Items</div>
                      <div className="space-y-1">
                        {o.items.map((it: any) => (
                          <div key={it.id} className="flex items-center gap-2 text-sm">
                            {it.image && <img src={it.image} alt="" className="w-8 h-8 rounded border border-ink object-cover shrink-0" />}
                            <span className="flex-1 min-w-0 truncate">{it.name} · {it.weight}lb ×{it.qty}</span>
                            <span className="font-semibold shrink-0">{inr(it.price * it.qty)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-muted-foreground">Payment:</span> <b>{o.paymentMethod === "ONLINE" ? "Paid Online" : "Pay at Pickup"}</b></div>
                      <div><span className="text-muted-foreground">Subtotal:</span> {inr(o.subtotal)}</div>
                      {o.discount > 0 && <div><span className="text-muted-foreground">Discount:</span> −{inr(o.discount)}</div>}
                      <div><span className="text-muted-foreground">Total:</span> <b className="text-terracotta">{inr(o.total)}</b></div>
                      <div className="flex gap-2 pt-1">
                        <a href={`tel:+91${o.mobile}`} className="text-xs flex items-center gap-1 text-terracotta hover:underline">
                          <Phone size={13} /> Call
                        </a>
                        <a href={`https://wa.me/91${o.mobile}`} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-[#25D366] hover:underline">
                          <MessageCircle size={13} /> WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>

                  {o.specialRequirements && (
                    <div className="bg-mustard/20 border-2 border-ink/20 rounded-xl p-3 text-sm">
                      <span className="font-semibold">Special instructions: </span>
                      {o.specialRequirements}
                    </div>
                  )}

                  {/* Status workflow */}
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground mb-2">Update status</div>
                    <div className="flex flex-wrap gap-2">
                      {ORDER_STATUS.map((s) => (
                        <button
                          key={s}
                          disabled={busy === o.id}
                          onClick={() => update(o.id, s)}
                          className={cn(
                            "px-3 py-1.5 rounded-full border-2 border-ink text-xs font-bold nb-shadow-sm nb-press transition flex items-center gap-1",
                            o.status === s
                              ? "bg-terracotta text-white"
                              : s === "ACCEPTED"
                              ? "bg-mustard text-ink"
                              : s === "CANCELLED"
                              ? "bg-burgundy text-white"
                              : "bg-card text-ink hover:bg-cream"
                          )}
                        >
                          {s === "ACCEPTED" && <MessageCircle size={12} />}
                          {busy === o.id && <Loader2 size={12} className="animate-spin" />}
                          {ORDER_STATUS_META[s].label}
                        </button>
                      ))}
                    </div>
                    {o.status === "RECEIVED" && (
                      <div className="mt-2 text-xs text-muted-foreground bg-cream border-2 border-dashed border-ink/20 rounded-xl p-2 flex items-center gap-1.5">
                        <Cake size={13} className="text-terracotta" /> Click <b>Accept</b> to generate the WhatsApp confirmation link for the customer.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </BakeryCard>
          ))}
        </div>
      )}
    </div>
  );
}
