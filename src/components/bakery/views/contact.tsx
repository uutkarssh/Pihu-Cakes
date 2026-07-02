"use client";

import { BRAND } from "@/lib/brand";
import { BakeryButton, BakeryCard, Pill, SectionTitle } from "../ui";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Send,
} from "lucide-react";
import { WhatsAppIcon } from "../whatsapp-icon";
import { toast } from "sonner";

export function ContactView() {
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Thank you! We'll get back to you on WhatsApp soon.");
    (e.target as HTMLFormElement).reset();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 md:py-10">
      <SectionTitle align="center" subtitle="We'd love to hear from you. Visit us, call us, or drop a message.">
        Get in Touch
      </SectionTitle>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        {/* Left: Map + info cards + WhatsApp */}
        <div className="space-y-5">
          <BakeryCard className="overflow-hidden p-0">
            <iframe
              title="Map"
              src={BRAND.mapEmbed}
              className="w-full h-64 border-0"
              loading="lazy"
            />
          </BakeryCard>

          <div className="grid sm:grid-cols-2 gap-4">
            <ContactCard icon={<MapPin size={18} />} title="Visit our bakery">
              {BRAND.address}
            </ContactCard>
            <ContactCard icon={<Clock size={18} />} title="Opening hours">
              {BRAND.hours.map((h) => (
                <div key={h.day} className="text-xs">
                  <span className="font-semibold">{h.day}:</span> {h.time}
                </div>
              ))}
            </ContactCard>
            <ContactCard icon={<Phone size={18} />} title="Call us">
              <a href={`tel:${BRAND.phone}`} className="hover:text-terracotta">
                {BRAND.phone}
              </a>
            </ContactCard>
            <ContactCard icon={<Mail size={18} />} title="Email">
              <a href={`mailto:${BRAND.email}`} className="hover:text-terracotta break-all">
                {BRAND.email}
              </a>
            </ContactCard>
          </div>

          {/* WhatsApp — the only social channel */}
          <a
            href={`https://wa.me/${BRAND.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            <BakeryCard hover className="p-5 bg-[#25D366]/10 border-[#25D366]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center border-2 border-ink nb-shadow-sm shrink-0">
                  <WhatsAppIcon size={28} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-base">Chat on WhatsApp</div>
                  <div className="text-xs text-muted-foreground">
                    Fastest way to reach us — custom orders, queries &amp; confirmations.
                  </div>
                </div>
                <BakeryButton variant="primary" className="text-sm shrink-0">
                  Open
                </BakeryButton>
              </div>
            </BakeryCard>
          </a>
        </div>

        {/* Right: Form */}
        <BakeryCard className="p-5 sm:p-6">
          <Pill color="mustard" className="mb-3">Send a message</Pill>
          <h2 className="font-display font-black text-2xl mb-1">We reply fast</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Questions about a custom cake, bulk order, or anything else? Write to us.
          </p>
          <form onSubmit={submit} className="space-y-3">
            <input
              required
              placeholder="Your name"
              className="w-full bg-cream border-2 border-ink rounded-xl px-3 py-2.5 text-sm outline-none focus:border-terracotta"
            />
            <input
              required
              placeholder="Mobile number"
              inputMode="numeric"
              className="w-full bg-cream border-2 border-ink rounded-xl px-3 py-2.5 text-sm outline-none focus:border-terracotta"
            />
            <input
              placeholder="Email (optional)"
              className="w-full bg-cream border-2 border-ink rounded-xl px-3 py-2.5 text-sm outline-none focus:border-terracotta"
            />
            <textarea
              required
              rows={5}
              placeholder="Your message…"
              className="w-full bg-cream border-2 border-ink rounded-xl px-3 py-2.5 text-sm outline-none focus:border-terracotta resize-none"
            />
            <BakeryButton variant="primary" type="submit" className="w-full">
              <Send size={16} className="mr-1.5" /> Send message
            </BakeryButton>
          </form>
        </BakeryCard>
      </div>
    </div>
  );
}

function ContactCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <BakeryCard className="p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-8 h-8 rounded-full bg-terracotta text-white flex items-center justify-center border-2 border-ink nb-shadow-sm">
          {icon}
        </div>
        <div className="font-display font-bold text-sm">{title}</div>
      </div>
      <div className="text-xs text-muted-foreground">{children}</div>
    </BakeryCard>
  );
}
