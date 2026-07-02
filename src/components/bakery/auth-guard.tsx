"use client";

import { useApp } from "@/lib/store";
import { BakeryButton } from "./ui";
import { Lock, ArrowRight, Mail } from "lucide-react";

/**
 * Guards a view behind Firebase authentication.
 * - While Firebase is booting (fbReady=false): shows a minimal loader (prevents layout shift).
 * - If no user is logged in: shows a login-required prompt that routes to the account page.
 * - If logged in: renders children.
 */
export function AuthGuard({ children, feature }: { children: React.ReactNode; feature: string }) {
  const fbReady = useApp((s) => s.fbReady);
  const fbUser = useApp((s) => s.fbUser);
  const navigate = useApp((s) => s.navigate);

  // While Firebase auth state is still resolving, show a minimal loader
  // (prevents layout shift / flash of wrong content).
  if (!fbReady) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span className="w-5 h-5 rounded-full border-2 border-terracotta border-t-transparent animate-spin" />
          Loading…
        </div>
      </div>
    );
  }

  if (!fbUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 md:py-24 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-mustard border-2.5 border-ink nb-shadow flex items-center justify-center mb-5">
          <Lock size={36} className="text-terracotta" />
        </div>
        <h1 className="font-display font-black text-2xl md:text-3xl">Login Required</h1>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
          Please login to {feature}. Create an account with your email in just a moment.
        </p>
        <div className="mt-6 flex flex-col gap-2 max-w-xs mx-auto">
          <BakeryButton variant="primary" onClick={() => navigate({ name: "account" })}>
            <Mail size={16} className="mr-1.5" /> Login / Sign Up
            <ArrowRight size={15} className="ml-1.5" />
          </BakeryButton>
          <BakeryButton variant="ghost" className="text-sm" onClick={() => navigate({ name: "home" })}>
            Back to home
          </BakeryButton>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
