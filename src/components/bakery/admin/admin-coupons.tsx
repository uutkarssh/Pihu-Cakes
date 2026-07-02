"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { inr, formatDate } from "@/lib/format";
import { BakeryButton, BakeryCard, Pill } from "../ui";
import { Plus, Pencil, Trash2, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AdminCoupons() {
  const qc = useQueryClient();
  const couponsQ = useQuery({ queryKey: ["admin-coupons"], queryFn: api.adminCoupons });
  const coupons = couponsQ.data?.coupons ?? [];
  const [editing, setEditing] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const blank = { code: "", type: "FLAT", value: 100, minOrder: 500, active: true, expiresAt: "", usageLimit: "" };

  const save = async (form: any) => {
    setBusy(true);
    try {
      await api.adminSaveCoupon({
        ...form,
        id: editing?.id,
        value: Number(form.value),
        minOrder: Number(form.minOrder),
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        expiresAt: form.expiresAt || null,
      });
      toast.success(editing ? "Coupon updated" : "Coupon created");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["admin-coupons"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <BakeryCard className="nb-shadow-soft p-4 flex items-center justify-between">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <Tag size={18} className="text-terracotta" /> Coupons
        </h3>
        <BakeryButton variant="primary" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus size={15} className="mr-1" /> Add Coupon
        </BakeryButton>
      </BakeryCard>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c: any) => (
          <BakeryCard key={c.id} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="font-display font-black text-xl text-terracotta">{c.code}</div>
                <div className="text-xs text-muted-foreground">
                  {c.type === "FLAT" ? `${inr(c.value)} off` : `${c.value}% off`} · min {inr(c.minOrder)}
                </div>
              </div>
              <Pill color={c.active ? "mustard" : "burgundy"} className="text-[10px]">
                {c.active ? "Active" : "Inactive"}
              </Pill>
            </div>
            <div className="mt-3 text-xs text-muted-foreground space-y-0.5">
              <div>Used: {c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ""}</div>
              {c.expiresAt && <div>Expires: {formatDate(c.expiresAt)}</div>}
            </div>
            <div className="flex gap-2 mt-3">
              <BakeryButton variant="outline" className="!py-1.5 text-xs flex-1" onClick={() => { setEditing(c); setOpen(true); }}>
                <Pencil size={12} className="mr-1" /> Edit
              </BakeryButton>
            </div>
          </BakeryCard>
        ))}
        {coupons.length === 0 && (
          <BakeryCard className="nb-shadow-soft p-8 text-center text-muted-foreground sm:col-span-2 lg:col-span-3">
            No coupons yet. Create one to delight your customers!
          </BakeryCard>
        )}
      </div>

      {open && (
        <CouponForm
          initial={editing || blank}
          isEdit={!!editing}
          busy={busy}
          onSave={save}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function CouponForm({ initial, isEdit, busy, onSave, onClose }: any) {
  const [form, setForm] = useState(initial);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/50">
      <BakeryCard className="nb-shadow-soft p-5 w-full max-w-md bg-cream">
        <h3 className="font-display font-black text-xl mb-4">{isEdit ? "Edit Coupon" : "Add Coupon"}</h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Code</label>
            <input value={form.code} onChange={(e) => set("code", e.target.value.toUpperCase())} className={inp} placeholder="FRESH10" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Type</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className={inp}>
                <option value="FLAT">Flat (₹)</option>
                <option value="PERCENT">Percent (%)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">{form.type === "FLAT" ? "Amount (₹)" : "Percent (%)"}</label>
              <input type="number" value={form.value} onChange={(e) => set("value", e.target.value)} className={inp} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Min order (₹)</label>
              <input type="number" value={form.minOrder} onChange={(e) => set("minOrder", e.target.value)} className={inp} />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Usage limit</label>
              <input type="number" value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} className={inp} placeholder="blank = unlimited" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Expiry date</label>
            <input type="date" value={form.expiresAt?.slice(0, 10) || ""} onChange={(e) => set("expiresAt", e.target.value)} className={inp} />
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} className="w-4 h-4 accent-terracotta" />
            Active
          </label>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <BakeryButton variant="ghost" onClick={onClose}>Cancel</BakeryButton>
          <BakeryButton variant="primary" onClick={() => onSave(form)} disabled={busy}>
            {busy && <Loader2 size={15} className="mr-1.5 animate-spin" />}
            {isEdit ? "Save" : "Create"}
          </BakeryButton>
        </div>
      </BakeryCard>
    </div>
  );
}

const inp = "w-full bg-cream border-2 border-ink rounded-xl px-3 py-2 text-sm outline-none focus:border-terracotta";
