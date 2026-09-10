// KCB KiNGS Cakes Bakes — Brand identity & store config

export const BRAND = {
  name: "KCB KiNGS Cakes Bakes",
  parentStore: "KCB Bakery & Cafe",
  tagline: "Good Food Brings People Together.",
  mission:
    "Fresh cakes, tasty bakery treats, snacks, and hot & cold beverages from KCB KiNGS Cakes Bakes in Khamaria.",
  phone: "+91 63940 36040",
  phones: [
    "+91 63940 36040",
    "+91 73071 51218",
    "+91 90442 50919",
  ],
  whatsapp: "916394036040", // wa.me number, no +
  email: "",
  address:
    "Chaurasiya Ji, Sabji Mandi Main Market, Khamaria, Bhawanath Patti, Uttar Pradesh 221306",
  addressShort: "Sabji Mandi Main Market, Khamaria, UP 221306",
  lat: 25.242558,
  lng: 82.509355,
  hours: [
    { day: "Daily", time: "12:00 PM – 11:30 PM" },
  ],
  mapsQuery: "KCB+KiNGS+Cakes+Bakes+Khamaria+Uttar+Pradesh+221306",
  instagram: "",
  facebook: "",
  mapEmbed:
    "https://www.google.com/maps?q=25.242558,82.509355&hl=en&z=16&output=embed",
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
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
