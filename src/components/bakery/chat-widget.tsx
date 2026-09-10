"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { BRAND } from "@/lib/brand";
import { Sparkles, X, Send, Cake } from "lucide-react";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Which cake for a 1st birthday?",
  "Eggless options under ₹700?",
  "What are your pickup timings?",
  "Do you write names on cakes?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Hi! I'm KCB, your bakery assistant. Ask me about cakes, prices, pickup timings, eggless options or custom orders — I'm here to help!`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(
    () => `chat-${Math.random().toString(36).slice(2)}`
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: any) => setOpen(!!e.detail);
    window.addEventListener("toggle-bakery-chat", handler);
    return () => window.removeEventListener("toggle-bakery-chat", handler);
  }, []);

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setLoading(true);
    try {
      const res = await api.aiChat(sessionId, msg);
      setMessages((m) => [...m, { role: "assistant", content: res.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "I'm having trouble right now. Please WhatsApp us at " + BRAND.phone,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] h-[520px] max-h-[80vh] bg-card border-2.5 border-ink rounded-3xl nb-shadow-lg flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
      {/* header */}
      <div className="bg-terracotta text-white px-4 py-3 flex items-center gap-3 border-b-2.5 border-ink">
        <div className="w-10 h-10 rounded-full border-2 border-ink bg-cream flex items-center justify-center">
          <Cake size={20} className="text-terracotta" />
        </div>
        <div className="flex-1">
          <div className="font-display font-bold text-base leading-none">
            KCB Assistant
          </div>
          <div className="text-[11px] text-white/85 flex items-center gap-1 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-[#7CFC00] border border-ink" />
            Online · here to help
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="p-1.5 rounded-full hover:bg-white/15"
          aria-label="Close chat"
        >
          <X size={18} />
        </button>
      </div>

      {/* messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto nb-scroll p-3 space-y-3 bg-cream">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[85%] px-3.5 py-2 rounded-2xl border-2 border-ink text-sm whitespace-pre-wrap", m.role === "user" ? "bg-terracotta text-white rounded-br-md nb-shadow-sm" : "bg-card text-ink rounded-bl-md nb-shadow-sm")}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border-2 border-ink rounded-2xl rounded-bl-md px-3.5 py-2.5 nb-shadow-sm flex gap-1">
              <Dot /> <Dot d="0.15s" /> <Dot d="0.3s" />
            </div>
          </div>
        )}
      </div>

      {/* suggestions */}
      {messages.length <= 2 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5 bg-cream">
          {SUGGESTIONS.map((s) => (
            <button key={s} onClick={() => send(s)} className="text-[11px] px-2.5 py-1 rounded-full border-2 border-ink bg-mustard text-ink font-semibold nb-shadow-sm nb-press">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* input */}
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 border-t-2 border-ink bg-card flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask KCB anything…" className="flex-1 bg-cream border-2 border-ink rounded-full px-4 py-2 text-sm outline-none focus:border-terracotta" />
        <button type="submit" disabled={loading} className="w-10 h-10 rounded-full border-2 border-ink bg-terracotta text-white flex items-center justify-center nb-shadow-sm nb-press disabled:opacity-50" aria-label="Send">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}

function Dot({ d = "0s" }: { d?: string }) {
  return <span className="w-2 h-2 rounded-full bg-terracotta animate-bounce" style={{ animationDelay: d }} />;
}
