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

const KCB_DESCRIPTION =
  "KCB KiNGS Cakes Bakes is a bakery and cafe in Khamaria, Uttar Pradesh, offering fresh cakes, pastries, tasty snacks, and hot & cold beverages. Visit us at Sabji Mandi Main Market.";

export const metadata: Metadata = {
  title: "KCB KiNGS Cakes Bakes | Bakery & Cafe in Khamaria, Uttar Pradesh",
  description: KCB_DESCRIPTION,
  keywords: [
    "KCB KiNGS Cakes Bakes",
    "KCB Bakery and Cafe",
    "bakery in Khamaria",
    "cake shop in Khamaria",
    "bakery near Khamaria",
    "cakes in Khamaria",
    "birthday cake Khamaria",
    "eggless cake Khamaria",
    "custom cake Khamaria",
    "pastry shop Khamaria",
    "cafe in Khamaria",
    "bakery near Sabji Mandi Khamaria",
    "cake shop near Sabji Mandi",
    "cakes near Bhawanath Patti",
    "bakery in Bhawanath Patti",
  ],
  authors: [{ name: "KCB KiNGS Cakes Bakes" }],
  creator: "KCB KiNGS Cakes Bakes",
  publisher: "KCB KiNGS Cakes Bakes",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "KCB KiNGS Cakes Bakes | Bakery & Cafe in Khamaria",
    description: KCB_DESCRIPTION,
    siteName: "KCB KiNGS Cakes Bakes",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "KCB KiNGS Cakes Bakes | Bakery & Cafe in Khamaria",
    description: KCB_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-IN" suppressHydrationWarning>
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
