"use client";

import { useApp } from "@/lib/store";
import { BRAND } from "@/lib/brand";
import { Phone, MapPin, Clock } from "lucide-react";
import { WhatsAppIcon } from "./whatsapp-icon";

export function Footer() {
  const navigate = useApp((s) => s.navigate);

  return (
    <footer className="mt-auto bg-ink text-cream border-t-2.5 border-ink">
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="KCB KiNGS Cakes Bakes"
              className="w-12 h-12 rounded-full border-2 border-cream object-cover"
            />
            <div className="leading-none">
              <div className="font-display font-black text-xl">KCB</div>
              <div className="text-[10px] font-semibold text-mustard tracking-widest uppercase">
                KiNGS Cakes Bakes
              </div>
            </div>
          </div>
          <p className="mt-4 text-sm text-cream/80 leading-relaxed">
            {BRAND.mission}
          </p>
          <p className="mt-3 text-xs text-cream/60">
            {BRAND.parentStore}
          </p>
        </div>

        <div>
          <h4 className="font-display font-bold text-mustard mb-3">Explore</h4>
          <ul className="space-y-2 text-sm text-cream/85">
            <li><button className="hover:text-mustard" onClick={() => navigate({ name: "home" })}>Home</button></li>
            <li><button className="hover:text-mustard" onClick={() => navigate({ name: "search" })}>All Cakes</button></li>
            <li><button className="hover:text-mustard" onClick={() => navigate({ name: "search", category: "eggless-cakes" })}>Eggless Cakes</button></li>
            <li><button className="hover:text-mustard" onClick={() => navigate({ name: "contact" })}>Contact &amp; Location</button></li>
            <li><button className="hover:text-mustard" onClick={() => navigate({ name: "account" })}>My Account</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-mustard mb-3">Visit Us</h4>
          <ul className="space-y-2.5 text-sm text-cream/85">
            <li className="flex gap-2">
              <MapPin size={16} className="text-mustard shrink-0 mt-0.5" />
              <span>{BRAND.address}</span>
            </li>
            <li className="flex gap-2">
              <Phone size={16} className="text-mustard shrink-0 mt-0.5" />
              <a href={`tel:${BRAND.phone}`} className="hover:text-mustard">{BRAND.phone}</a>
            </li>
            <li className="flex gap-2">
              <Clock size={16} className="text-mustard shrink-0 mt-0.5" />
              <span>{BRAND.hours.map((h) => <span key={h.day} className="block">{h.day}: {h.time}</span>)}</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-display font-bold text-mustard mb-3">Connect With Us</h4>
          <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2.5 w-full bg-[#25D366] text-white border-2 border-cream rounded-2xl px-4 py-3 hover:brightness-110 transition" aria-label="Chat with us on WhatsApp">
            <WhatsAppIcon size={22} className="text-white" />
            <div className="text-left">
              <div className="font-bold text-sm">WhatsApp Us</div>
              <div className="text-[11px] text-white/85">Quick replies &amp; orders</div>
            </div>
          </a>
          <div className="mt-5">
            <h4 className="font-display font-bold text-mustard mb-2 text-sm">Newsletter</h4>
            <p className="text-xs text-cream/70 mb-2">Seasonal specials &amp; offers, fresh from our oven.</p>
            <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for subscribing!"); }} className="flex gap-2">
              <input type="email" required placeholder="your@email.com" className="flex-1 bg-cream/10 border-2 border-cream/40 rounded-full px-3 py-1.5 text-xs text-cream placeholder:text-cream/40 outline-none focus:border-mustard" />
              <button className="bg-mustard text-ink border-2 border-cream rounded-full px-3 py-1.5 text-xs font-bold nb-press">Join</button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/15">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-cream/60">
          <p>© {new Date().getFullYear()} {BRAND.name}. Handcrafted with love in Khamaria, Uttar Pradesh.</p>
          <p>Freshly baked daily · Pickup only · No delivery</p>
        </div>
      </div>
    </footer>
  );
}
