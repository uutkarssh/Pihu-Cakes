"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { todayISO, addDays, formatDate } from "@/lib/format";
import { BakeryButton, BakeryCard, Pill } from "../ui";
import { CalendarDays, Clock, Plus, Trash2, Loader2, Ban } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function AdminCalendar() {
  const qc = useQueryClient();
  const slotsQ = useQuery({ queryKey: ["admin-slots"], queryFn: api.adminSlots });
  const datesQ = useQuery({ queryKey: ["admin-dates"], queryFn: api.adminDates });
  const slots = slotsQ.data?.slots ?? [];
  const disabledDates = datesQ.data?.dates ?? [];

  const [busy, setBusy] = useState(false);
  const [date, setDate] = useState(todayISO());
  const [reason, setReason] = useState("Holiday");

  const saveSlot = async (s: any) => {
    setBusy(true);
    try {
      await api.adminSaveSlot(s);
      toast.success("Slot updated");
      qc.invalidateQueries({ queryKey: ["admin-slots"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const disableDate = async () => {
    setBusy(true);
    try {
      await api.adminToggleDate({ date, reason });
      toast.success(`${date} disabled`);
      qc.invalidateQueries({ queryKey: ["admin-dates"] });
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(false);
    }
  };

  const enableDate = async (d: string) => {
    setBusy(true);
    try {
      await api.adminToggleDate({ action: "enable", date: d });
      toast.success(`${d} enabled`);
      qc.invalidateQueries({ queryKey: ["admin-dates"] });
    } finally {
      setBusy(false);
    }
  };

  const dateOptions: { v: string; l: string }[] = [];
  for (let i = 0; i < 21; i++) {
    const d = addDays(new Date(), i);
    const iso = d.toISOString().slice(0, 10);
    dateOptions.push({ v: iso, l: i === 0 ? "Today" : i === 1 ? "Tomorrow" : formatDate(iso) });
  }

  return (
    <div className="space-y-5">
      {/* Slots */}
      <BakeryCard className="nb-shadow-soft p-5">
        <h3 className="font-display font-bold text-lg mb-1 flex items-center gap-2">
          <Clock size={18} className="text-terracotta" /> Pickup Time Slots
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Set slot timings &amp; max orders per slot. Prevents overbooking automatically.</p>
        <div className="space-y-2">
          {slots.map((s) => (
            <SlotRow key={s.id} slot={s} onSave={saveSlot} busy={busy} />
          ))}
        </div>
      </BakeryCard>

      {/* Disabled dates */}
      <BakeryCard className="nb-shadow-soft p-5">
        <h3 className="font-display font-bold text-lg mb-1 flex items-center gap-2">
          <Ban size={18} className="text-burgundy" /> Holiday / Disabled Dates
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Disable specific dates (holidays). Customers won't be able to book these.</p>
        <div className="flex flex-wrap gap-2 mb-4">
          <select value={date} onChange={(e) => setDate(e.target.value)} className="bg-cream border-2 border-ink rounded-xl px-3 py-2 text-sm outline-none">
            {dateOptions.map((d) => (
              <option key={d.v} value={d.v}>{d.l}</option>
            ))}
          </select>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="flex-1 min-w-[140px] bg-cream border-2 border-ink rounded-xl px-3 py-2 text-sm outline-none" />
          <BakeryButton variant="burgundy" onClick={disableDate} disabled={busy}>
            <Plus size={15} className="mr-1" /> Disable date
          </BakeryButton>
        </div>
        <div className="space-y-2">
          {disabledDates.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-3 bg-cream rounded-xl border-2 border-dashed border-ink/20">
              No disabled dates. All upcoming dates are bookable.
            </div>
          )}
          {disabledDates.map((d: any) => (
            <div key={d.id} className="flex items-center justify-between bg-cream border-2 border-ink/20 rounded-xl px-3 py-2">
              <div className="flex items-center gap-2">
                <CalendarDays size={15} className="text-burgundy" />
                <span className="font-semibold text-sm">{formatDate(d.date)}</span>
                <span className="text-xs text-muted-foreground">· {d.reason}</span>
              </div>
              <button onClick={() => enableDate(d.date)} className="text-burgundy hover:bg-burgundy/10 p-1.5 rounded-lg" aria-label="Enable">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </BakeryCard>
    </div>
  );
}

function SlotRow({ slot, onSave, busy }: { slot: any; onSave: (s: any) => void; busy: boolean }) {
  const [s, setS] = useState({ ...slot });
  const [editing, setEditing] = useState(false);
  return (
    <div className="bg-cream border-2 border-ink/20 rounded-xl p-2.5">
      {editing ? (
        <div className="grid grid-cols-2 sm:grid-cols-[1fr_auto_auto_auto] gap-2">
          <input value={s.label} onChange={(e) => setS({ ...s, label: e.target.value })} className="bg-card border border-ink rounded-lg px-2 py-1 text-sm col-span-2 sm:col-span-1" placeholder="Slot label" />
          <input value={s.startTime} onChange={(e) => setS({ ...s, startTime: e.target.value })} placeholder="10:00" className="bg-card border border-ink rounded-lg px-2 py-1 text-sm" />
          <input value={s.endTime} onChange={(e) => setS({ ...s, endTime: e.target.value })} placeholder="12:00" className="bg-card border border-ink rounded-lg px-2 py-1 text-sm" />
          <input type="number" value={s.maxOrders} onChange={(e) => setS({ ...s, maxOrders: Number(e.target.value) })} className="bg-card border border-ink rounded-lg px-2 py-1 text-sm w-full" placeholder="Max" />
          <div className="col-span-2 sm:col-span-1 flex gap-2">
            <BakeryButton variant="primary" className="!py-1.5 text-xs flex-1" onClick={() => { onSave(s); setEditing(false); }} disabled={busy}>Save</BakeryButton>
            <BakeryButton variant="ghost" className="!py-1.5 text-xs" onClick={() => setEditing(false)}>Cancel</BakeryButton>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <Clock size={14} className="text-terracotta shrink-0" />
          <span className="font-semibold text-sm flex-1 min-w-[120px]">{slot.label}</span>
          <Pill color={slot.enabled ? "mustard" : "burgundy"} className="text-[10px]">
            {slot.enabled ? `Max ${slot.maxOrders}` : "Disabled"}
          </Pill>
          <BakeryButton variant="outline" className="!py-1.5 text-xs" onClick={() => setEditing(true)}>Edit</BakeryButton>
          <button
            onClick={() => onSave({ ...slot, enabled: !slot.enabled })}
            className={cn("text-xs px-2.5 py-1.5 rounded-full border-2 border-ink nb-shadow-sm nb-press", slot.enabled ? "bg-burgundy text-white" : "bg-[#6B8E23] text-white")}
            disabled={busy}
          >
            {slot.enabled ? "Disable" : "Enable"}
          </button>
        </div>
      )}
    </div>
  );
}
