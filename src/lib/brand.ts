// Pihu Cakes & Bakes — Brand identity & store config

export const BRAND = {
  name: "Pihu Cakes & Bakes",
  parentStore: "Pihu General Store",
  tagline: "Freshly Baked. Made With Love.",
  mission:
    "To bring handcrafted, freshly baked joy to every celebration in our neighbourhood — using premium ingredients, baked fresh daily, and made to order with care.",
  phone: "+91 99351 13011",
  whatsapp: "919935113011", // wa.me number, no +
  email: "hello@pihucakesandbakes.in",
  address:
    "Wahida to Suriyawan Road, Sudhwai, Manga Patti, Uttar Pradesh 221310",
  addressShort: "Manga Patti, Sudhwai, UP 221310",
  lat: 25.33312,
  lng: 82.350368,
  hours: [
    { day: "Mon – Fri", time: "9:00 AM – 9:00 PM" },
    { day: "Saturday", time: "9:00 AM – 10:00 PM" },
    { day: "Sunday", time: "10:00 AM – 8:00 PM" },
  ],
  mapsQuery: "Sudhwai+Manga+Patti+Suriyawan+Uttar+Pradesh+221310",
  instagram: "https://instagram.com/pihucakesandbakes",
  facebook: "https://facebook.com/pihucakesandbakes",
  mapEmbed:
    "https://www.google.com/maps?q=25.33312,82.350368&hl=en&z=15&output=embed",
};

export const COLORS = {
  cream: "#FAF3E8",
  terracotta: "#C6613D",
  mustard: "#E8B84B",
  burgundy: "#8B3A3A",
  ink: "#231C14",
};

export const ORDER_STATUS = [
  "RECEIVED",
  "ACCEPTED",
  "PREPARING",
  "READY",
  "PICKED_UP",
  "CANCELLED",
] as const;

export const ORDER_STATUS_META: Record<
  string,
  { label: string; color: string; step: number }
> = {
  RECEIVED: { label: "Order Received", color: "#E8B84B", step: 0 },
  ACCEPTED: { label: "Accepted", color: "#C6613D", step: 1 },
  PREPARING: { label: "Preparing", color: "#D98E5F", step: 2 },
  READY: { label: "Ready for Pickup", color: "#8B3A3A", step: 3 },
  PICKED_UP: { label: "Picked Up", color: "#6B8E23", step: 4 },
  CANCELLED: { label: "Cancelled", color: "#B23A3A", step: -1 },
};

export const WEIGHTS = [
  { weight: "1", label: "1 Pound (~0.45kg)" },
  { weight: "1.5", label: "1.5 Pound (~0.68kg)" },
  { weight: "2", label: "2 Pound (~0.91kg)" },
  { weight: "3", label: "3 Pound (~1.36kg)" },
  { weight: "5", label: "5 Pound (~2.27kg)" },
];

// Admin access: only these emails can log into the admin panel.
export const ADMIN_EMAILS = [
  "ravimaurya335@gmail.com",
  "utkarshmaurya917027@gmail.com",
];
export const ADMIN_PASSWORD = "pihu2024"; // shared admin password
