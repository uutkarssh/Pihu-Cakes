"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { inr } from "@/lib/format";
import { BakeryButton, BakeryCard } from "../ui";
import { Minus, Plus, Trash2, ShoppingBag, Tag, ChevronLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function CartView() {
  const navigate = useApp((s) => s.navigate);
  const cart = useApp((s) => s.cart);
  const updateQty = useApp((s) => s.updateCartQty);
  const removeFromCart = useApp((s) => s.removeFromCart);
  const couponCode = useApp((s) => s.couponCode);
  const setCoupon = useApp((s) => s.setCoupon);

  const [code, setCode] = useState(couponCode || "");
  const [applied, setApplied] = useState<{ code: string; discount: number } | null>(null);
  const [checking, setChecking] = useState(false);
  const subtotal = cart.reduce((n, c) => n + c.qty * c.price, 0);
  const discount = applied?.discount || 0;
  const total = Math.max(0, subtotal - discount);

  const applyCoupon = async () => {
    if (!code.trim()) return;
    setChecking(true);
    try {
      const res = await api.validateCoupon(code.trim(), subtotal);
      if (res.valid) {
        setApplied({ code: res.code, discount: res.discount });
        setCoupon(res.code);
        toast.success(res.message);
      } else {
        setApplied(null);
        setCoupon(null);
        toast.error(res.message);
      }
    } catch {
      toast.error("Could not validate coupon");
    } finally {
      setChecking(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 md:py-24 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-mustard border-2.5 border-ink nb-shadow flex items-center justify-center mb-5"><ShoppingBag size={36} className="text-terracotta" /></div>
        <h1 className="font-display font-black text-3xl">Your cart is empty</h1>
        <p className="text-muted-foreground mt-2">Looks like you haven't added any cakes yet. Let's fix that!</p>
        <BakeryButton className="mt-6" onClick={() => navigate({ name: "search" })}>Browse all cakes</BakeryButton>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
      <button onClick={() => navigate({ name: "search" })} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-ink mb-4 font-semibold"><ChevronLeft size={16} /> Continue shopping</button>
      <h1 className="font-display font-black text-3xl md:text-4xl text-ink mb-6">Your Cart</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <BakeryCard key={`${item.productId}-${item.weight}`} className="p-4 flex gap-4">
              <button onClick={() => navigate({ name: "product", slug: item.slug })} className="w-24 h-24 rounded-xl border-2 border-ink overflow-hidden shrink-0 nb-shadow-sm"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></button>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2"><div><h3 className="font-display font-bold text-base leading-tight">{item.name}</h3><div className="text-xs text-muted-foreground mt-0.5">{item.weightLabel}</div></div><button onClick={() => removeFromCart(item.productId, item.weight)} className="text-muted-foreground hover:text-burgundy p-1" aria-label="Remove"><Trash2 size={16} /></button></div>
                <div className="flex items-end justify-between mt-3 gap-3"><div className="flex items-center gap-2"><div className="flex items-center bg-cream border-2 border-ink rounded-full nb-shadow-sm"><button onClick={() => updateQty(item.productId, item.weight, item.qty - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-mustard/30 rounded-l-full"><Minus size={14} /></button><span className="w-7 text-center font-bold text-sm">{item.qty}</span><button onClick={() => updateQty(item.productId, item.weight, item.qty + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-mustard/30 rounded-r-full"><Plus size={14} /></button></div></div><div className="text-right"><div className="font-display font-black text-lg text-terracotta">{inr(item.price * item.qty)}</div><div className="text-[11px] text-muted-foreground">{inr(item.price)} each</div></div></div>
              </div>
            </BakeryCard>
          ))}
        </div>

        <div className="lg:col-span-1">
          <BakeryCard className="p-5 sticky top-28">
            <h2 className="font-display font-black text-xl mb-4">Order Summary</h2>
            <div className="mb-4">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1.5"><Tag size={13} /> Coupon code</label>
              {applied ? (
                <div className="flex items-center justify-between bg-mustard/30 border-2 border-ink rounded-xl px-3 py-2"><span className="flex items-center gap-1.5 font-bold text-sm"><CheckCircle2 size={15} className="text-terracotta" /> {applied.code}</span><button onClick={() => { setApplied(null); setCoupon(null); setCode(""); }} className="text-xs text-muted-foreground hover:text-burgundy">Remove</button></div>
              ) : (
                <div className="flex gap-2"><input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="e.g. FRESH10" className="flex-1 bg-cream border-2 border-ink rounded-xl px-3 py-2 text-sm outline-none uppercase" /><BakeryButton variant="cream" className="!px-4 !py-2 text-sm" onClick={applyCoupon} disabled={checking}>{checking ? "…" : "Apply"}</BakeryButton></div>
              )}
              <div className="text-[11px] text-muted-foreground mt-1.5">Try: FRESH10 · WELCOME150</div>
            </div>

            <div className="space-y-2 text-sm border-t-2 border-dashed border-ink/20 pt-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">{inr(subtotal)}</span></div>
              {discount > 0 && <div className="flex justify-between text-terracotta"><span>Discount</span><span className="font-semibold">−{inr(discount)}</span></div>}
              <div className="flex justify-between"><span className="text-muted-foreground">Fulfilment</span><span className="font-semibold text-terracotta">Pickup or Delivery</span></div>
            </div>
            <div className="flex justify-between items-baseline mt-4 pt-4 border-t-2 border-ink"><span className="font-display font-bold text-lg">Total</span><span className="font-display font-black text-2xl text-terracotta">{inr(total)}</span></div>
            <BakeryButton variant="primary" className="w-full mt-5" onClick={() => navigate({ name: "checkout" })}>Proceed to Checkout <ArrowRight size={16} className="ml-1.5" /></BakeryButton>
            <div className="text-[11px] text-muted-foreground text-center mt-3 flex items-center justify-center gap-1"><ShoppingBag size={12} /> Choose pickup or home delivery at checkout</div>
          </BakeryCard>
        </div>
      </div>
    </div>
  );
}
