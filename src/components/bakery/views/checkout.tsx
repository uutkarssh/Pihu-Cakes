"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { inr, todayISO, addDays, formatDate } from "@/lib/format";
import { BakeryButton, BakeryCard, Pill } from "../ui";
import {
  ChevronLeft,
  Calendar,
  Clock,
  Sparkles,
  MessageCircle,
  ShieldCheck,
  CreditCard,
  Wallet,
  AlertTriangle,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function CheckoutView() {
  const navigate = useApp((s) => s.navigate);
  const cart = useApp((s) => s.cart);
  const couponCode = useApp((s) => s.couponCode);
  const clearCart = useApp((s) => s.clearCart);
  const setCoupon = useApp((s) => s.setCoupon);
  const setCustomer = useApp((s) => s.setCustomer);
  const fbUser = useApp((s) => s.fbUser);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [special, setSpecial] = useState("");
  const [payment, setPayment] = useState("PAY_AT_PICKUP");
  const [placing, setPlacing] = useState(false);

  // Pre-fill customer details when a Firebase user is logged in
  useEffect(() => {
    if (fbUser) {
      setName((n) => n || fbUser.name || "");
      setMobile((m) => m || fbUser.mobile || "");
      setEmail((e) => e || fbUser.email || "");
    }
  }, [fbUser]);

  // AI message suggestions
  const [aiSugs, setAiSugs] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const disabledQ = useQuery({ queryKey: ["disabled-dates"], queryFn: api.disabledDates });
  const disabledSet = new Set((disabledQ.data?.dates ?? []).map((d: any) => d.date));

  const availQ = useQuery({
    queryKey: ["slot-availability", date],
    queryFn: () => api.slotAvailability(date),
    enabled: !!date,
  });
  const availability = availQ.data?.availability ?? [];

  const subtotal = cart.reduce((n, c) => n + c.qty * c.price, 0);

  // re-validate coupon on checkout mount
  const [discount, setDiscount] = useState(0);
  useEffect(() => {
    (async () => {
      if (couponCode && subtotal > 0) {
        try {
          const r = await api.validateCoupon(couponCode, subtotal);
          if (r.valid) setDiscount(r.discount);
          else {
            setCoupon(null);
            setDiscount(0);
          }
        } catch {}
      } else {
        setDiscount(0);
      }
    })();
  }, [couponCode, subtotal]);

  const total = Math.max(0, subtotal - discount);

  // next 14 days options
  const dateOptions: { value: string; label: string; disabled: boolean }[] = [];
  for (let i = 0; i < 14; i++) {
    const d = addDays(new Date(), i);
    const iso = d.toISOString().slice(0, 10);
    dateOptions.push({
      value: iso,
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : formatDate(iso),
      disabled: disabledSet.has(iso),
    });
  }

  // generate AI message suggestions
  const genMessages = async () => {
    setAiLoading(true);
    try {
      const firstCake = cart[0]?.name || "cake";
      const r = await api.aiMessages({
        occasion: "birthday",
        name: name || "",
        cakeName: firstCake,
      });
      setAiSugs(r.suggestions);
    } catch {
      toast.error("Could not generate suggestions");
    } finally {
      setAiLoading(false);
    }
  };

  const placeOrder = async () => {
    if (!name.trim()) return toast.error("Please enter your name");
    if (mobile.replace(/\D/g, "").length < 10)
      return toast.error("Please enter a valid 10-digit mobile number");
    if (!date) return toast.error("Please select a pickup date");
    if (!slot) return toast.error("Please select a pickup time slot");

    setPlacing(true);
    try {
      const res = await api.createOrder({
        customerName: name,
        mobile,
        email,
        firebaseUid: fbUser?.uid || undefined,
        pickupDate: date,
        pickupSlot: slot,
        specialRequirements: special,
        paymentMethod: payment,
        couponCode,
        items: cart.map((c) => ({
          productId: c.productId,
          name: c.name,
          weight: c.weight,
          qty: c.qty,
          price: c.price,
          image: c.image,
        })),
      });
      setCustomer({ name, mobile, email });
      clearCart();
      setCoupon(null);
      toast.success("Order placed successfully!");
      navigate({ name: "confirmation", orderId: res.order.orderId });
    } catch (e: any) {
      toast.error(e.message || "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-mustard border-2.5 border-ink nb-shadow flex items-center justify-center mb-4">
          <ShoppingBag size={36} className="text-terracotta" />
        </div>
        <h1 className="font-display font-black text-2xl">Your cart is empty</h1>
        <BakeryButton className="mt-5" onClick={() => navigate({ name: "search" })}>
          Browse cakes
        </BakeryButton>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
      <button
        onClick={() => navigate({ name: "cart" })}
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-ink mb-4 font-semibold"
      >
        <ChevronLeft size={16} /> Back to cart
      </button>
      <h1 className="font-display font-black text-3xl md:text-4xl text-ink mb-6">
        Checkout
      </h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          {/* Customer details */}
          <BakeryCard className="p-5">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-terracotta text-white text-sm font-bold flex items-center justify-center">1</span>
              Your Details
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full bg-cream border-2 border-ink rounded-xl px-3 py-2.5 text-sm outline-none focus:border-terracotta"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Mobile number *</label>
                <input
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                  inputMode="numeric"
                  placeholder="10-digit mobile"
                  className="w-full bg-cream border-2 border-ink rounded-xl px-3 py-2.5 text-sm outline-none focus:border-terracotta"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground">Email (optional)</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="you@email.com"
                  className="w-full bg-cream border-2 border-ink rounded-xl px-3 py-2.5 text-sm outline-none focus:border-terracotta"
                />
              </div>
            </div>
          </BakeryCard>

          {/* Pickup */}
          <BakeryCard className="p-5">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-terracotta text-white text-sm font-bold flex items-center justify-center">2</span>
              Pickup Date &amp; Time
            </h2>
            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
              <Calendar size={13} /> Pickup date *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
              {dateOptions.map((d) => (
                <button
                  key={d.value}
                  disabled={d.disabled}
                  onClick={() => {
                    setDate(d.value);
                    setSlot("");
                  }}
                  className={cn(
                    "px-2 py-2.5 rounded-xl border-2 border-ink text-xs font-bold nb-shadow-sm nb-press transition text-center",
                    d.disabled && "opacity-40 cursor-not-allowed line-through",
                    date === d.value ? "bg-terracotta text-white" : "bg-card hover:bg-cream"
                  )}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
              <Clock size={13} /> Pickup time slot *
            </label>
            {!date ? (
              <div className="text-sm text-muted-foreground bg-cream border-2 border-dashed border-ink/30 rounded-xl p-3">
                Please select a date first.
              </div>
            ) : availQ.isLoading ? (
              <div className="text-sm text-muted-foreground">Loading slots…</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availability.map((s: any) => (
                  <button
                    key={s.id}
                    disabled={!s.available}
                    onClick={() => setSlot(s.label)}
                    className={cn(
                      "px-2 py-2.5 rounded-xl border-2 border-ink text-xs font-bold nb-shadow-sm nb-press transition text-center",
                      !s.available && "opacity-40 cursor-not-allowed",
                      slot === s.label ? "bg-terracotta text-white" : "bg-card hover:bg-cream"
                    )}
                  >
                    {s.label}
                    <div className={cn("text-[10px] font-normal", slot === s.label ? "text-white/80" : "text-muted-foreground")}>
                      {s.available ? `${s.maxOrders - s.booked} left` : "Full"}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </BakeryCard>

          {/* Special requirements */}
          <BakeryCard className="p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-terracotta text-white text-sm font-bold flex items-center justify-center">3</span>
                Special Requirements
              </h2>
              <button
                onClick={genMessages}
                disabled={aiLoading}
                className="text-xs font-bold text-terracotta flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                {aiLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
                {aiLoading ? "Generating…" : "AI suggestions"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              e.g. "No Eggs", "Write Happy Birthday Aarav", "Less Cream", "Extra Chocolate"
            </p>
            <textarea
              value={special}
              onChange={(e) => setSpecial(e.target.value)}
              rows={3}
              placeholder="Add any customisation, message to write on the cake, allergies, etc."
              className="w-full bg-cream border-2 border-ink rounded-xl px-3 py-2.5 text-sm outline-none focus:border-terracotta resize-none"
            />
            {aiSugs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {aiSugs.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setSpecial(s)}
                    className="text-[11px] px-2.5 py-1 rounded-full border-2 border-ink bg-mustard text-ink font-semibold nb-shadow-sm nb-press"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </BakeryCard>

          {/* Payment */}
          <BakeryCard className="p-5">
            <h2 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-terracotta text-white text-sm font-bold flex items-center justify-center">4</span>
              Payment Method
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={() => setPayment("PAY_AT_PICKUP")}
                className={cn(
                  "p-4 rounded-xl border-2 border-ink text-left nb-shadow-sm nb-press transition flex items-start gap-3",
                  payment === "PAY_AT_PICKUP" ? "bg-terracotta text-white" : "bg-card hover:bg-cream"
                )}
              >
                <Wallet size={20} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">Pay at Pickup</div>
                  <div className={cn("text-xs", payment === "PAY_AT_PICKUP" ? "text-white/80" : "text-muted-foreground")}>
                    Pay cash / UPI when you collect
                  </div>
                </div>
              </button>
              <button
                onClick={() => setPayment("ONLINE")}
                className={cn(
                  "p-4 rounded-xl border-2 border-ink text-left nb-shadow-sm nb-press transition flex items-start gap-3",
                  payment === "ONLINE" ? "bg-terracotta text-white" : "bg-card hover:bg-cream"
                )}
              >
                <CreditCard size={20} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm">Online Payment</div>
                  <div className={cn("text-xs", payment === "ONLINE" ? "text-white/80" : "text-muted-foreground")}>
                    Pay securely online now
                  </div>
                </div>
              </button>
            </div>
          </BakeryCard>

          {/* IMPORTANT NOTICE */}
          <BakeryCard className="p-5 bg-mustard/30 border-terracotta">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-terracotta text-white flex items-center justify-center shrink-0 border-2 border-ink">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-display font-black text-base text-ink flex items-center gap-1.5">
                  <AlertTriangle size={16} className="text-terracotta" /> Important — Please read
                </h3>
                <p className="text-sm text-ink/80 mt-1.5 leading-relaxed">
                  You will receive an <b>order confirmation message on WhatsApp</b>. Please{" "}
                  <b>reply or accept it</b> to confirm your booking. Orders that remain
                  unconfirmed may be cancelled.
                </p>
              </div>
            </div>
          </BakeryCard>
        </div>

        {/* Summary */}
        <div>
          <BakeryCard className="p-5 sticky top-28">
            <h2 className="font-display font-black text-xl mb-4">Your Order</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto nb-scroll pr-1 mb-4">
              {cart.map((c) => (
                <div key={`${c.productId}-${c.weight}`} className="flex gap-2.5 items-center">
                  <img src={c.image} alt={c.name} className="w-12 h-12 rounded-lg border-2 border-ink object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{c.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {c.weightLabel} · ×{c.qty}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-terracotta">{inr(c.price * c.qty)}</div>
                </div>
              ))}
            </div>
            <div className="space-y-1.5 text-sm border-t-2 border-dashed border-ink/20 pt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-semibold">{inr(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-terracotta">
                  <span>Discount ({couponCode})</span>
                  <span className="font-semibold">−{inr(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pickup</span>
                <span className="font-semibold text-terracotta">FREE</span>
              </div>
            </div>
            <div className="flex justify-between items-baseline mt-3 pt-3 border-t-2 border-ink">
              <span className="font-display font-bold text-lg">Total</span>
              <span className="font-display font-black text-2xl text-terracotta">{inr(total)}</span>
            </div>

            <BakeryButton variant="primary" className="w-full mt-5" onClick={placeOrder} disabled={placing}>
              {placing ? (
                <><Loader2 size={16} className="mr-1.5 animate-spin" /> Placing order…</>
              ) : (
                <><ShieldCheck size={16} className="mr-1.5" /> Confirm &amp; Place Order</>
              )}
            </BakeryButton>
            <div className="text-[11px] text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
              <ShieldCheck size={12} /> By placing, you agree to our pickup policy
            </div>
          </BakeryCard>
        </div>
      </div>
    </div>
  );
}
