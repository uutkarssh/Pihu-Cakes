"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { BRAND } from "@/lib/brand";
import { BakeryButton } from "./ui";
import { Menu, X, ShoppingBag, Search, Heart, Phone, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", view: { name: "home" } as const },
  { label: "Cakes", view: { name: "search" } as const },
  { label: "Contact", view: { name: "contact" } as const },
  { label: "Account", view: { name: "account" } as const },
];

export function Header() {
  const navigate = useApp((s) => s.navigate);
  const cartCount = useApp((s) => s.cartCount());
  const wishlist = useApp((s) => s.wishlist);
  const view = useApp((s) => s.view);
  const fbUser = useApp((s) => s.fbUser);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const go = (v: any) => { navigate(v); setOpen(false); };
  const submitSearch = (e: React.FormEvent) => { e.preventDefault(); navigate({ name: "search", query: q }); setOpen(false); };

  return (
    <header className="sticky top-0 z-40 w-full min-w-0 overflow-x-clip bg-cream/95 backdrop-blur border-b-2.5 border-ink">
      <div className="bg-ink text-cream text-xs"><div className="max-w-7xl mx-auto w-full min-w-0 px-3 sm:px-4 py-1.5 flex items-center justify-between gap-1.5"><span className="hidden sm:flex items-center gap-1.5 min-w-0"><MapPin size={12} /> {BRAND.addressShort}</span><span className="flex items-center gap-1.5 font-semibold shrink-0"><span className="hidden sm:inline">Freshly baked every day</span><span className="sm:hidden">Fresh daily</span></span><a href={`tel:${BRAND.phone}`} className="flex items-center gap-1.5 hover:text-mustard shrink-0"><Phone size={12} /> {BRAND.phone}</a></div></div>
      <div className="max-w-7xl mx-auto w-full min-w-0 px-3 sm:px-4 py-3 flex items-center gap-1.5 sm:gap-3">
        <button onClick={() => go({ name: "home" })} className="flex items-center gap-1.5 sm:gap-2.5 shrink min-w-0 overflow-hidden"><Logo /><div className="text-left leading-none min-w-0"><div className="font-display font-black text-lg sm:text-xl md:text-2xl text-ink truncate">KCB</div><div className="text-[8px] sm:text-[10px] md:text-xs font-semibold text-terracotta tracking-[0.12em] sm:tracking-widest uppercase truncate">KiNGS Cakes Bakes</div></div></button>
        <form onSubmit={submitSearch} className="hidden md:flex flex-1 max-w-md items-center gap-2 bg-card border-2.5 border-ink rounded-full px-4 py-2 nb-shadow-sm"><Search size={18} className="text-terracotta shrink-0" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cakes, flavours, occasions…" className="bg-transparent outline-none w-full text-sm" /></form>
        <nav className="hidden lg:flex items-center gap-1">{navItems.map((n) => <button key={n.label} onClick={() => go(n.view)} className={cn("px-3 py-2 rounded-full text-sm font-semibold hover:bg-cream transition", view.name === n.view.name && "bg-cream text-terracotta")}>{n.label}</button>)}</nav>
        <div className="flex items-center gap-0.5 sm:gap-2 ml-auto lg:ml-0 shrink-0"><button onClick={() => go({ name: "account" })} className={cn("flex items-center gap-1 sm:gap-1.5 rounded-full border-2.5 border-ink nb-shadow-sm nb-press font-semibold text-xs sm:text-sm transition px-2 sm:px-3 py-1.5 shrink-0", fbUser ? "bg-card text-ink hover:bg-cream" : "bg-terracotta text-white hover:bg-[#B5562F]")} aria-label={fbUser ? "My Account" : "Login / Sign Up"}>{fbUser ? <><span className="w-6 h-6 rounded-full bg-terracotta text-white border border-ink flex items-center justify-center font-bold text-[11px]">{(fbUser.name || fbUser.email || fbUser.mobile || "U").charAt(0).toUpperCase()}</span><span className="hidden md:inline max-w-[80px] truncate">{fbUser.name || "Account"}</span></> : <><User size={14} /><span>Login</span></>}</button><button onClick={() => go({ name: "account" })} className="relative p-1 sm:p-2 rounded-full hover:bg-cream shrink-0" aria-label="Wishlist"><Heart size={18} className="text-burgundy" />{wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-mustard text-ink text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-ink">{wishlist.length}</span>}</button><button onClick={() => go({ name: "cart" })} className="relative p-1 sm:p-2 rounded-full hover:bg-cream shrink-0" aria-label="Cart"><ShoppingBag size={18} className="text-ink" />{cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-terracotta text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-ink">{cartCount}</span>}</button><BakeryButton variant="primary" className="hidden md:inline-flex !px-4 !py-2 text-sm shrink-0" onClick={() => go({ name: "search" })}>Order Now</BakeryButton><button className="lg:hidden p-1 sm:p-2 rounded-full hover:bg-cream shrink-0" onClick={() => setOpen((o) => !o)} aria-label="Menu">{open ? <X size={21} /> : <Menu size={21} />}</button></div>
      </div>
      {open && <div className="lg:hidden border-t-2 border-ink bg-cream px-4 py-3 space-y-3"><form onSubmit={submitSearch} className="flex items-center gap-2 bg-card border-2 border-ink rounded-full px-4 py-2"><Search size={18} className="text-terracotta" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search cakes…" className="bg-transparent outline-none w-full text-sm" /></form><div className="grid grid-cols-2 gap-2">{navItems.map((n) => <button key={n.label} onClick={() => go(n.view)} className="px-3 py-2.5 rounded-xl border-2 border-ink bg-card text-sm font-semibold text-left nb-shadow-sm nb-press">{n.label}</button>)}</div></div>}
    </header>
  );
}

function Logo() { return <img src="/logo.png" alt="KCB KiNGS Cakes Bakes logo" className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full border-2.5 border-ink nb-shadow-sm shrink-0 object-cover" />; }
