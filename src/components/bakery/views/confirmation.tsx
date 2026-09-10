"use client";

import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { BRAND, ORDER_STATUS_META } from "@/lib/brand";
import { inr } from "@/lib/format";
import { BakeryButton, BakeryCard, Pill } from "../ui";
import { CheckCircle2, Calendar, Clock, Phone, MessageCircle, Home, ShoppingBag, MapPin, Truck, Store } from "lucide-react";

export function ConfirmationView({ orderId }: { orderId: string }) {
  const navigate = useApp((s) => s.navigate);
  const q = useQuery({ queryKey: ["order", orderId], queryFn: () => api.order(orderId), enabled: !!orderId });
  const order = q.data?.order;

  const waLink = order ? `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(`Hi! I just placed order ${order.orderId}. I'd like to confirm my order.`)}` : "#";
  const isDelivery = order?.fulfillmentType === "DELIVERY";

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-14">
      <div className="text-center mb-8">
        <div className="w-24 h-24 mx-auto rounded-full bg-mustard border-2.5 border-ink nb-shadow-lg flex items-center justify-center animate-float-y"><CheckCircle2 size={48} className="text-terracotta" /></div>
        <h1 className="font-display font-black text-3xl md:text-4xl text-ink mt-5">Thank You!</h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">Your order has been received successfully. Please check your WhatsApp for your confirmation message. {isDelivery ? "Your order will be delivered to the address you provided during your selected delivery time." : "Please visit our bakery during your selected pickup time to collect your order."}</p>
      </div>

      {q.isLoading ? <BakeryCard className="p-8 text-center text-muted-foreground">Loading your order…</BakeryCard> : order ? (
        <>
          <BakeryCard className="p-6 mb-5">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-dashed border-ink/20"><div><div className="text-xs text-muted-foreground">Order ID</div><div className="font-display font-black text-xl text-terracotta">{order.orderId}</div></div><Pill color="mustard">{ORDER_STATUS_META[order.status]?.label || order.status}</Pill></div>
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <Info icon={isDelivery ? <Truck size={16} /> : <Store size={16} />} label="Fulfilment" value={isDelivery ? "Home Delivery" : "Store Pickup"} />
              <Info icon={<Calendar size={16} />} label={isDelivery ? "Delivery date" : "Pickup date"} value={order.pickupDate} />
              <Info icon={<Clock size={16} />} label={isDelivery ? "Delivery time" : "Pickup time"} value={order.pickupSlot} />
              <Info icon={<Phone size={16} />} label="Registered mobile" value={`+91 ${order.mobile}`} />
              <Info icon={<ShoppingBag size={16} />} label="Payment" value={order.paymentMethod === "ONLINE" ? "Paid Online" : isDelivery ? "Pay on Delivery" : "Pay at Pickup"} />
              {isDelivery && order.deliveryAddress && <Info icon={<MapPin size={16} />} label="Delivery address" value={order.deliveryAddress} />}
            </div>

            <div className="mt-4 pt-4 border-t-2 border-dashed border-ink/20"><div className="text-xs font-semibold text-muted-foreground mb-2">Order items</div><div className="space-y-2">{order.items.map((it) => <div key={it.id} className="flex items-center gap-3">{it.image && <img src={it.image} alt={it.name} className="w-10 h-10 rounded-lg border-2 border-ink object-cover" />}<div className="flex-1 text-sm"><span className="font-semibold">{it.name}</span><span className="text-muted-foreground"> · {it.weight} lb × {it.qty}</span></div><div className="font-bold text-terracotta">{inr(it.price * it.qty)}</div></div>)}</div>
              {order.deliveryFee > 0 && <div className="flex justify-between mt-3 text-sm"><span className="text-muted-foreground">Delivery fee</span><span>{inr(order.deliveryFee)}</span></div>}
              <div className="flex justify-between items-baseline mt-3 pt-3 border-t-2 border-ink"><span className="font-display font-bold">Total</span><span className="font-display font-black text-xl text-terracotta">{inr(order.total)}</span></div>
            </div>
            {order.specialRequirements && <div className="mt-3 bg-cream border-2 border-ink/20 rounded-xl p-3 text-sm"><span className="font-semibold">Special instructions: </span>{order.specialRequirements}</div>}
          </BakeryCard>

          <BakeryCard className="p-5 bg-[#25D366]/15 border-[#25D366] mb-5"><div className="flex items-center gap-3"><div className="w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center border-2 border-ink nb-shadow-sm"><MessageCircle size={22} /></div><div className="flex-1"><h3 className="font-display font-bold text-base">Confirm on WhatsApp</h3><p className="text-xs text-muted-foreground">Send a quick message to confirm your order so the KCB team can start preparing it.</p></div><a href={waLink} target="_blank" rel="noreferrer"><BakeryButton variant="primary" className="!py-2 text-sm">Confirm now</BakeryButton></a></div></BakeryCard>
          <div className="flex flex-wrap gap-3 justify-center"><BakeryButton variant="cream" onClick={() => navigate({ name: "home" })}><Home size={16} className="mr-1.5" /> Back to home</BakeryButton><BakeryButton variant="mustard" onClick={() => navigate({ name: "search" })}><ShoppingBag size={16} className="mr-1.5" /> Order more</BakeryButton></div>
        </>
      ) : <BakeryCard className="p-8 text-center"><p className="text-muted-foreground">Could not load order details.</p><BakeryButton className="mt-4" onClick={() => navigate({ name: "home" })}>Back to home</BakeryButton></BakeryCard>}
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-start gap-2.5"><div className="w-8 h-8 rounded-full bg-cream border-2 border-ink flex items-center justify-center text-terracotta shrink-0">{icon}</div><div><div className="text-xs text-muted-foreground">{label}</div><div className="font-semibold text-sm break-words">{value}</div></div></div>;
}
