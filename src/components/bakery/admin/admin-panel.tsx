"use client";

import { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { BakeryButton, BakeryCard, Pill } from "../ui";
import { Shield, Lock, User, ArrowLeft, Loader2, LayoutDashboard, ShoppingBag, Cake, CalendarDays, Ticket, Star, Layers, Chrome } from "lucide-react";
import { toast } from "sonner";
import { AdminDashboard } from "./admin-dashboard";
import { AdminProducts } from "./admin-products";
import { AdminOrders } from "./admin-orders";
import { AdminCalendar } from "./admin-calendar";
import { AdminCoupons } from "./admin-coupons";
import { AdminReviews } from "./admin-reviews";
import { AdminCategories } from "./admin-categories";
import { cn } from "@/lib/utils";
import { getFirebaseIdToken, loginWithGoogle } from "@/lib/firebase-auth";

type Section = "dashboard" | "orders" | "products" | "categories" | "calendar" | "coupons" | "reviews";

const nav: { id: Section; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "products", label: "Products", icon: Cake },
  { id: "categories", label: "Categories", icon: Layers },
  { id: "calendar", label: "Calendar", icon: CalendarDays },
  { id: "coupons", label: "Coupons", icon: Ticket },
  { id: "reviews", label: "Reviews", icon: Star },
];

export function AdminPanel() {
  const setAuthed = useApp((s) => s.setAdminAuthed);
  const navigate = useApp((s) => s.navigate);
  const [section, setSection] = useState<Section>("dashboard");
  // Server-side verification state: "checking" | "authed" | "denied"
  const [verified, setVerified] = useState<"checking" | "authed" | "denied">("checking");

  // Verify admin session server-side on mount (prevents client-side store tampering)
  useEffect(() => {
    let cancelled = false;
    api.adminMe()
      .then((res) => {
        if (cancelled) return;
        if (res.authed) {
          setVerified("authed");
          setAuthed(true);
        } else {
          setVerified("denied");
          setAuthed(false);
        }
      })
      .catch(() => {
        if (!cancelled) setVerified("denied");
      });
    return () => {
      cancelled = true;
    };
  }, [setAuthed]);

  if (verified === "checking") {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <span className="w-5 h-5 rounded-full border-2 border-terracotta border-t-transparent animate-spin" />
          Verifying admin session…
        </div>
      </div>
    );
  }

  if (verified === "denied") return <AdminLogin onSuccess={() => setVerified("authed")} />;

  return (
    <div className="min-h-[calc(100vh-120px)] bg-cream overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-5">
        {/* Header — stacks on mobile */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 rounded-full bg-ink text-mustard flex items-center justify-center border-2 border-ink nb-shadow-sm shrink-0">
              <Shield size={20} />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-black text-xl sm:text-2xl leading-none truncate">Admin Panel</h1>
              <div className="text-[11px] sm:text-xs text-muted-foreground truncate">Pihu Cakes &amp; Bakes · Store Management</div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <BakeryButton variant="ghost" className="text-sm !px-3" onClick={() => navigate({ name: "home" })}>
              <ArrowLeft size={15} className="mr-1" /> Store
            </BakeryButton>
            <BakeryButton
              variant="outline"
              className="text-sm !px-3"
              onClick={async () => {
                await api.adminLogout();
                setAuthed(false);
                setVerified("denied");
                toast.success("Logged out");
              }}
            >
              Logout
            </BakeryButton>
          </div>
        </div>

        <div className="grid lg:grid-cols-[200px_1fr] gap-4 lg:gap-5">
          {/* Sidebar — horizontal scroll on mobile, vertical on desktop */}
          <BakeryCard className="nb-shadow-soft p-1.5 h-fit lg:sticky lg:top-28 overflow-hidden">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto nb-scroll min-w-0">
              {nav.map((n) => (
                <button
                  key={n.id}
                  onClick={() => setSection(n.id)}
                  className={cn(
                    "px-3 py-2.5 rounded-xl text-sm font-semibold text-left whitespace-nowrap transition flex items-center gap-2 shrink-0",
                    section === n.id ? "bg-terracotta text-white nb-shadow-sm" : "hover:bg-cream text-ink"
                  )}
                >
                  <n.icon size={15} /> {n.label}
                </button>
              ))}
            </nav>
          </BakeryCard>

          {/* Content */}
          <div className="min-w-0 overflow-x-hidden">
            {section === "dashboard" && <AdminDashboard />}
            {section === "orders" && <AdminOrders />}
            {section === "products" && <AdminProducts />}
            {section === "categories" && <AdminCategories />}
            {section === "calendar" && <AdminCalendar />}
            {section === "coupons" && <AdminCoupons />}
            {section === "reviews" && <AdminReviews />}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const navigate = useApp((s) => s.navigate);
  const setAuthed = useApp((s) => s.setAdminAuthed);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const finishLogin = () => {
    setAuthed(true);
    toast.success("Welcome back, admin!");
    onSuccess();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.adminLogin(email, password);
      finishLogin();
    } catch (e: any) {
      toast.error(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogleAdmin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle();
      const idToken = await getFirebaseIdToken();
      await api.adminGoogleLogin(idToken);
      finishLogin();
    } catch (e: any) {
      toast.error(e.message || "Google admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center px-4 py-10">
      <BakeryCard className="nb-shadow-soft p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-ink text-mustard flex items-center justify-center border-2 border-ink nb-shadow">
            <Shield size={28} />
          </div>
          <h1 className="font-display font-black text-2xl mt-3">Admin Login</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Authorized personnel only.
          </p>
        </div>
        <div className="space-y-3 mb-4">
          <BakeryButton
            variant="outline"
            className="w-full"
            onClick={loginWithGoogleAdmin}
            disabled={loading}
          >
            {loading ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <Chrome size={16} className="mr-1.5" />}
            Continue with Google / Gmail
          </BakeryButton>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-ink/15" />
            <span className="text-xs text-muted-foreground font-semibold">OR PASSWORD</span>
            <div className="flex-1 h-px bg-ink/15" />
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Admin Email</label>
            <div className="flex items-center gap-2 bg-cream border-2 border-ink rounded-xl px-3 py-2.5 mt-1">
              <User size={16} className="text-terracotta" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@email.com"
                className="bg-transparent outline-none w-full text-sm"
                autoComplete="email"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Password</label>
            <div className="flex items-center gap-2 bg-cream border-2 border-ink rounded-xl px-3 py-2.5 mt-1">
              <Lock size={16} className="text-terracotta" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent outline-none w-full text-sm"
                autoComplete="current-password"
              />
            </div>
          </div>
          <BakeryButton variant="primary" type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 size={16} className="mr-1.5 animate-spin" /> Logging in…</> : "Login"}
          </BakeryButton>
        </form>
        <button
          onClick={() => navigate({ name: "home" })}
          className="mt-4 text-sm text-muted-foreground hover:text-ink flex items-center gap-1 mx-auto"
        >
          <ArrowLeft size={14} /> Back to store
        </button>
      </BakeryCard>
    </div>
  );
}
