"use client";

import { cn } from "@/lib/utils";
import {
  Star,
  Cake,
  Heart,
  Gem,
  Palette,
  Leaf,
  Croissant,
  PartyPopper,
  type LucideIcon,
} from "lucide-react";
import { Button as BaseButton } from "@/components/ui/button";
import type { ComponentProps, ReactNode } from "react";

// Category icon mapping (by slug) — no emojis, uses Lucide icons
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "birthday-cakes": PartyPopper,
  "anniversary-cakes": Heart,
  "wedding-cakes": Gem,
  "designer-cakes": Palette,
  "eggless-cakes": Leaf,
  pastries: Croissant,
};

export function CategoryIcon({
  slug,
  size = 28,
  className,
}: {
  slug: string;
  size?: number;
  className?: string;
}) {
  const Icon = CATEGORY_ICONS[slug] ?? Cake;
  return <Icon size={size} className={className} />;
}

type Variant = "primary" | "mustard" | "burgundy" | "outline" | "ghost" | "cream";

const variantClass: Record<Variant, string> = {
  primary: "bg-terracotta text-white border-ink nb-shadow hover:bg-[#B5562F] nb-press",
  mustard: "bg-mustard text-ink border-ink nb-shadow hover:brightness-95 nb-press",
  burgundy: "bg-burgundy text-white border-ink nb-shadow hover:brightness-110 nb-press",
  outline: "bg-transparent text-ink border-ink nb-shadow-sm hover:bg-cream nb-press",
  ghost: "bg-transparent text-ink border-transparent hover:bg-cream",
  cream: "bg-card text-ink border-ink nb-shadow hover:bg-cream nb-press",
};

export function BakeryButton({
  variant = "primary",
  className,
  children,
  ...props
}: { variant?: Variant } & Omit<ComponentProps<typeof BaseButton>, "variant">) {
  return (
    <BaseButton
      className={cn(
        "rounded-full border-2.5 font-semibold font-sans tracking-wide px-6 py-2.5 h-auto",
        variantClass[variant],
        className
      )}
      {...props}
    >
      {children}
    </BaseButton>
  );
}

export function BakeryCard({
  className,
  children,
  hover = false,
  ...props
}: { hover?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-card border-2.5 border-ink rounded-2xl nb-shadow",
        hover && "nb-hover-lift cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  subtitle,
  className,
  align = "left",
}: {
  children: ReactNode;
  subtitle?: ReactNode;
  className?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={cn(align === "center" && "text-center", className)}>
      <h2 className="font-display font-black text-3xl md:text-4xl text-ink leading-tight">
        {children}
      </h2>
      {subtitle && (
        <p className="mt-2 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function StarRating({
  rating,
  size = 16,
  showValue = false,
  count,
}: {
  rating: number;
  size?: number;
  showValue?: boolean;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={
              i <= Math.round(rating)
                ? "fill-mustard text-mustard"
                : "fill-muted text-muted-foreground/30"
            }
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-ink ml-1">
          {rating.toFixed(1)}
        </span>
      )}
      {count != null && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </div>
  );
}

export function Pill({
  children,
  className,
  color = "mustard",
}: {
  children: ReactNode;
  className?: string;
  color?: "mustard" | "terracotta" | "burgundy" | "cream" | "ink";
}) {
  const colors: Record<string, string> = {
    mustard: "bg-mustard text-ink border-ink",
    terracotta: "bg-terracotta text-white border-ink",
    burgundy: "bg-burgundy text-white border-ink",
    cream: "bg-cream text-ink border-ink",
    ink: "bg-ink text-cream border-ink",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border-2",
        colors[color],
        className
      )}
    >
      {children}
    </span>
  );
}

export function priceOf(p: { weights: { price: number }[] }) {
  if (!p.weights.length) return 0;
  return Math.min(...p.weights.map((w) => w.price));
}
