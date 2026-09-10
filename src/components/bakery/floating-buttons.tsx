"use client";

import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import { ArrowUp, Sparkles } from "lucide-react";
import { WhatsAppIcon } from "./whatsapp-icon";
import { cn } from "@/lib/utils";

export function FloatingButtons() {
  const [showTop, setShowTop] = useState(false);
  const [openChat, setOpenChat] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // listen for a custom event to open chat (from header/hero CTAs)
  useEffect(() => {
    const handler = () => setOpenChat(true);
    window.addEventListener("open-bakery-chat", handler);
    return () => window.removeEventListener("open-bakery-chat", handler);
  }, []);

  return (
    <div className="fixed bottom-5 right-4 sm:right-6 z-50 flex flex-col items-end gap-3">
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="w-11 h-11 rounded-full border-2.5 border-ink bg-cream text-ink flex items-center justify-center nb-shadow nb-press animate-in fade-in"
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}
      <a
        href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
          "Hi KCB KiNGS Cakes Bakes! I'd like to know more about your cakes."
        )}`}
        target="_blank"
        rel="noreferrer"
        className="w-14 h-14 rounded-full border-2.5 border-ink bg-[#25D366] text-white flex items-center justify-center nb-shadow-lg hover:scale-105 transition"
        aria-label="WhatsApp us"
      >
        <WhatsAppIcon size={28} className="text-white" />
      </a>
      <button
        onClick={() => {
          setOpenChat((o) => !o);
          window.dispatchEvent(new CustomEvent("toggle-bakery-chat", { detail: !openChat }));
        }}
        className={cn(
          "w-14 h-14 rounded-full border-2.5 border-ink flex items-center justify-center nb-shadow-lg hover:scale-105 transition",
          openChat ? "bg-burgundy text-white" : "bg-terracotta text-white"
        )}
        aria-label="AI Bakery Assistant"
      >
        {openChat ? <Sparkles size={24} /> : <Sparkles size={24} className="animate-wiggle" />}
      </button>
    </div>
  );
}
