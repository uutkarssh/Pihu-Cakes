import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pihu Cakes & Bakes | Freshly Baked. Made With Love. Pre-Book & Pickup",
  description:
    "Pihu Cakes & Bakes — a neighborhood bakery by Pihu General Store. Freshly baked birthday, anniversary, wedding, designer & eggless cakes. Reserve online, pick up in store. Handmade with premium ingredients.",
  keywords: [
    "bakery", "cakes", "birthday cake", "anniversary cake", "wedding cake",
    "designer cake", "eggless cake", "pastries", "Pihu Cakes and Bakes",
    "cake pickup", "pre-book cake", "custom cake",
  ],
  authors: [{ name: "Pihu Cakes & Bakes" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Pihu Cakes & Bakes | Freshly Baked. Made With Love.",
    description:
      "Reserve your freshly baked cakes online and pick them up in store. Birthday, anniversary, wedding, designer & eggless cakes handmade with care.",
    siteName: "Pihu Cakes & Bakes",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pihu Cakes & Bakes | Freshly Baked. Made With Love.",
    description: "Reserve freshly baked cakes online. Pickup in store.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${fraunces.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
        <SonnerToaster position="top-center" richColors />
      </body>
    </html>
  );
}
