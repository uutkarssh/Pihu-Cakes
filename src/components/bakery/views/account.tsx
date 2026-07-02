"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { inr, formatDate } from "@/lib/format";
import { ORDER_STATUS_META } from "@/lib/brand";
import { BakeryButton, BakeryCard, Pill, SectionTitle } from "../ui";
import { ProductCard } from "../product-card";
import {
  Phone,
  Heart,
  ShoppingBag,
  RefreshCw,
  Shield,
  User,
  PackageX,
  HeartCrack,
  Mail,
  Lock,
  LogOut,
  Loader2,
  Chrome,
  Smartphone,
  ArrowLeft,
  KeyRound,
} from "lucide-react";
import {
  signupWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logoutUser,
  updateUserProfile,
  sendOTP,
  verifyOTP,
} from "@/lib/firebase-auth";
import type { ConfirmationResult } from "firebase/auth";
import { toast } from "sonner";

export function AccountView() {
  const navigate = useApp((s) => s.navigate);
  const wishlist = useApp((s) => s.wishlist);
  const addToCart = useApp((s) => s.addToCart);
  const fbUser = useApp((s) => s.fbUser);
  const fbReady = useApp((s) => s.fbReady);
  const setFbUser = useApp((s) => s.setFbUser);

  // Logged-in users: fetch orders by firebase uid
  const ordersQ = useQuery({
    queryKey: ["my-orders", fbUser?.uid],
    queryFn: () => api.myOrdersByUid(fbUser!.uid),
    enabled: fbReady && !!fbUser,
  });
  const orders = ordersQ.data?.orders ?? [];

  const productsQ = useQuery({ queryKey: ["products", "all-account"], queryFn: () => api.products() });
  const wished = (productsQ.data?.products ?? []).filter((p) => wishlist.includes(p.id));

  const repeatOrder = (order: any) => {
    order.items.forEach((it: any) => {
      addToCart({
        productId: it.productId || "",
        name: it.name,
        slug: "",
        image: it.image || "",
        weight: it.weight,
        weightLabel: `${it.weight} Pound`,
        qty: it.qty,
        price: it.price,
      });
    });
    navigate({ name: "cart" });
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setFbUser(null);
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 md:py-10">
      <SectionTitle subtitle="Track your orders, manage your wishlist, and reorder your favourites in a tap.">
        My Account
      </SectionTitle>

      {/* ===== NOT LOGGED IN: show auth only ===== */}
      {!fbReady ? (
        <BakeryCard className="p-8 text-center text-muted-foreground flex items-center justify-center gap-2 mt-8">
          <Loader2 size={18} className="animate-spin" /> Loading…
        </BakeryCard>
      ) : !fbUser ? (
        <div className="mt-8 max-w-md mx-auto">
          <AuthCard onAuthed={(u) => setFbUser(u)} />
        </div>
      ) : (
        /* ===== LOGGED IN: profile + orders + wishlist as distinct sections ===== */
        <div className="mt-8 space-y-6">
          {/* PROFILE section — ONLY profile info */}
          <section>
            <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              <User size={18} className="text-terracotta" /> Profile
            </h2>
            <BakeryCard className="p-5">
              <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-dashed border-ink/15">
                <div className="w-14 h-14 rounded-full bg-terracotta text-white border-2 border-ink nb-shadow-sm flex items-center justify-center font-display font-black text-xl shrink-0">
                  {(fbUser.name || fbUser.email || fbUser.mobile || "U").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-bold text-lg truncate">{fbUser.name || "Customer"}</div>
                  {fbUser.mobile && <div className="text-xs text-muted-foreground">+91 {fbUser.mobile}</div>}
                  {fbUser.email && <div className="text-xs text-muted-foreground truncate">{fbUser.email}</div>}
                </div>
                <BakeryButton variant="outline" className="text-sm !px-3 shrink-0" onClick={handleLogout}>
                  <LogOut size={15} className="mr-1" /> Logout
                </BakeryButton>
              </div>
              <ProfileEditor
                user={fbUser}
                onUpdated={() => toast.success("Profile updated")}
              />
            </BakeryCard>
          </section>

          {/* ORDERS section — ONLY orders */}
          <section>
            <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              <ShoppingBag size={18} className="text-terracotta" /> Order History
            </h2>
            <BakeryCard className="p-5">
              {ordersQ.isLoading ? (
                <div className="text-sm text-muted-foreground">Loading your orders…</div>
              ) : orders.length === 0 ? (
                <EmptyOrders />
              ) : (
                <OrderList orders={orders} onReorder={repeatOrder} />
              )}
            </BakeryCard>
          </section>

          {/* WISHLIST section — ONLY wishlist */}
          <section>
            <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
              <Heart size={18} className="text-burgundy" /> Saved Favourites ({wished.length})
            </h2>
            {wished.length === 0 ? (
              <BakeryCard className="p-8 text-center text-muted-foreground">
                <div className="w-16 h-16 mx-auto rounded-full bg-mustard border-2 border-ink flex items-center justify-center mb-3">
                  <HeartCrack size={28} className="text-burgundy" />
                </div>
                No favourites yet. Tap the heart on any cake to save it here.
                <div className="mt-3">
                  <BakeryButton variant="cream" onClick={() => navigate({ name: "search" })}>
                    Browse cakes
                  </BakeryButton>
                </div>
              </BakeryCard>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {wished.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </section>

          {/* Admin link */}
          <BakeryCard className="p-5 bg-ink text-cream">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-mustard" />
                <div>
                  <div className="font-display font-bold text-mustard">Store Owner?</div>
                  <div className="text-xs text-cream/70">Access the admin panel.</div>
                </div>
              </div>
              <BakeryButton variant="mustard" className="text-sm" onClick={() => navigate({ name: "admin" })}>
                Open Admin Panel
              </BakeryButton>
            </div>
          </BakeryCard>
        </div>
      )}
    </div>
  );
}

// ===== AUTH CARD: Email primary (name+phone required on signup), Google + OTP secondary =====
function AuthCard({ onAuthed }: { onAuthed: (u: any) => void }) {
  const [method, setMethod] = useState<"email" | "otp">("email");
  const [mode, setMode] = useState<"login" | "signup">("signup");

  // email form state (PRIMARY)
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // OTP form state (SECONDARY)
  const [otpStep, setOtpStep] = useState<"phone" | "otp">("phone");
  const [otpPhone, setOtpPhone] = useState("");
  const [otpName, setOtpName] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);

  const [loading, setLoading] = useState<"email" | "google" | "otp-send" | "otp-verify" | null>(null);

  // ---- Email (PRIMARY) ----
  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup") {
      if (!name.trim()) return toast.error("Please enter your name");
      if (phone.replace(/\D/g, "").length < 10) return toast.error("Please enter a valid 10-digit mobile number");
    }
    if (password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading("email");
    try {
      const u =
        mode === "signup"
          ? await signupWithEmail(email, password, name, phone)
          : await loginWithEmail(email, password);
      onAuthed(u);
      toast.success(mode === "signup" ? "Account created!" : "Welcome back!");
    } catch (e: any) {
      toast.error(friendlyAuthError(e?.code || e?.message));
    } finally {
      setLoading(null);
    }
  };

  // ---- Google (SECONDARY) ----
  const handleGoogle = async () => {
    setLoading("google");
    try {
      const u = await loginWithGoogle();
      onAuthed(u);
      toast.success("Welcome!");
    } catch (e: any) {
      toast.error(friendlyAuthError(e?.code || e?.message));
    } finally {
      setLoading(null);
    }
  };

  // ---- OTP (SECONDARY) ----
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpPhone.replace(/\D/g, "").length < 10) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }
    setLoading("otp-send");
    try {
      const conf = await sendOTP(otpPhone, otpName || undefined);
      setConfirmation(conf);
      setOtpStep("otp");
      toast.success("OTP sent! Check your mobile for the 6-digit code.");
    } catch (e: any) {
      toast.error(friendlyAuthError(e?.code || e?.message));
    } finally {
      setLoading(null);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmation) return;
    if (otp.length < 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }
    setLoading("otp-verify");
    try {
      const u = await verifyOTP(confirmation, otp);
      onAuthed(u);
      toast.success("Welcome! You're logged in.");
    } catch (e: any) {
      toast.error(friendlyAuthError(e?.code || e?.message));
    } finally {
      setLoading(null);
    }
  };

  return (
    <BakeryCard className="p-5 overflow-hidden">
      {/* reCAPTCHA container (invisible, for OTP) */}
      <div id="recaptcha-container" />

      <div className="text-center mb-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-terracotta text-white border-2 border-ink nb-shadow flex items-center justify-center mb-2">
          <Mail size={26} />
        </div>
        <h2 className="font-display font-black text-xl">Login or Sign Up</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Create an account with your email to track orders &amp; save favourites.
        </p>
      </div>

      {/* PRIMARY: Email form */}
      {method === "email" && (
        <form onSubmit={handleEmail} className="space-y-3">
          <div className="flex gap-2 p-1 bg-cream rounded-full border-2 border-ink nb-shadow-sm">
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition ${mode === "signup" ? "bg-terracotta text-white" : "text-ink"}`}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-1.5 rounded-full text-xs font-bold transition ${mode === "login" ? "bg-terracotta text-white" : "text-ink"}`}
            >
              Login
            </button>
          </div>
          {mode === "signup" && (
            <>
              <Field icon={<User size={15} />}>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name *"
                  className="bg-transparent outline-none w-full text-sm"
                />
              </Field>
              <Field icon={<Phone size={15} />}>
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                  placeholder="10-digit mobile number *"
                  inputMode="numeric"
                  className="bg-transparent outline-none w-full text-sm"
                />
                <span className="text-xs font-bold text-terracotta shrink-0">+91</span>
              </Field>
            </>
          )}
          <Field icon={<Mail size={15} />}>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="bg-transparent outline-none w-full text-sm"
            />
          </Field>
          <Field icon={<Lock size={15} />}>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password (min 6 chars)"
              className="bg-transparent outline-none w-full text-sm"
            />
          </Field>
          <BakeryButton variant="primary" type="submit" className="w-full" disabled={loading !== null}>
            {loading === "email" ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : null}
            {mode === "signup" ? "Create account" : "Login"}
          </BakeryButton>

          {/* Divider + secondary options */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-ink/15" />
            <span className="text-xs text-muted-foreground font-semibold">OR</span>
            <div className="flex-1 h-px bg-ink/15" />
          </div>
          <div className="space-y-2">
            <BakeryButton variant="cream" className="w-full" onClick={handleGoogle} disabled={loading !== null}>
              {loading === "google" ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <Chrome size={16} className="mr-1.5" />}
              Continue with Google
            </BakeryButton>
            <BakeryButton variant="outline" className="w-full" onClick={() => { setMethod("otp"); setOtpStep("phone"); }} disabled={loading !== null}>
              <Smartphone size={16} className="mr-1.5" /> Login with Phone OTP
            </BakeryButton>
          </div>
        </form>
      )}

      {/* SECONDARY: OTP form */}
      {method === "otp" && (
        <div className="space-y-3">
          {otpStep === "phone" ? (
            <form onSubmit={handleSendOTP} className="space-y-3">
              <Field icon={<User size={15} />}>
                <input
                  value={otpName}
                  onChange={(e) => setOtpName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="bg-transparent outline-none w-full text-sm"
                />
              </Field>
              <Field icon={<Phone size={15} />}>
                <input
                  required
                  value={otpPhone}
                  onChange={(e) => setOtpPhone(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                  placeholder="10-digit mobile number"
                  inputMode="numeric"
                  className="bg-transparent outline-none w-full text-sm"
                />
                <span className="text-xs font-bold text-terracotta shrink-0">+91</span>
              </Field>
              <BakeryButton variant="primary" type="submit" className="w-full" disabled={loading !== null}>
                {loading === "otp-send" ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : <KeyRound size={16} className="mr-1.5" />}
                Send OTP
              </BakeryButton>
              <button
                type="button"
                onClick={() => setMethod("email")}
                className="text-xs text-muted-foreground hover:text-ink flex items-center gap-1 mx-auto"
              >
                <ArrowLeft size={12} /> Back to email login
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-3">
              <div className="text-xs text-muted-foreground bg-cream border-2 border-dashed border-ink/20 rounded-xl p-2.5 flex items-center gap-2">
                <Phone size={13} className="text-terracotta shrink-0" />
                OTP sent to +91 {otpPhone}
                <button
                  type="button"
                  onClick={() => { setOtpStep("phone"); setOtp(""); setConfirmation(null); }}
                  className="ml-auto text-terracotta font-bold hover:underline"
                >
                  Change
                </button>
              </div>
              <Field icon={<KeyRound size={15} />}>
                <input
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^\d]/g, "").slice(0, 6))}
                  placeholder="6-digit OTP"
                  inputMode="numeric"
                  className="bg-transparent outline-none w-full text-sm tracking-[0.3em] font-bold"
                />
              </Field>
              <BakeryButton variant="primary" type="submit" className="w-full" disabled={loading !== null}>
                {loading === "otp-verify" ? <Loader2 size={16} className="mr-1.5 animate-spin" /> : null}
                Verify &amp; Login
              </BakeryButton>
              <button
                type="button"
                onClick={() => { setOtpStep("phone"); setOtp(""); setConfirmation(null); }}
                className="text-xs text-muted-foreground hover:text-ink flex items-center gap-1 mx-auto"
              >
                <ArrowLeft size={12} /> Back
              </button>
            </form>
          )}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground text-center mt-4">
        Your account syncs your wishlist and orders across devices securely.
      </p>
    </BakeryCard>
  );
}

function ProfileEditor({ user, onUpdated }: { user: any; onUpdated: () => void }) {
  const [name, setName] = useState(user.name || "");
  const [mobile, setMobile] = useState(user.mobile || "");
  const [saving, setSaving] = useState(false);

  // Sync form fields when the user prop updates (e.g., after auth state resolves)
  useEffect(() => {
    setName(user.name || "");
    setMobile(user.mobile || "");
  }, [user.name, user.mobile]);

  const save = async () => {
    setSaving(true);
    try {
      await updateUserProfile(user.uid, { name, mobile });
      onUpdated();
    } catch (e: any) {
      toast.error(e.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-semibold text-muted-foreground">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-cream border-2 border-ink rounded-xl px-3 py-2 text-sm outline-none focus:border-terracotta"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-muted-foreground">Mobile</label>
        <input
          value={mobile}
          onChange={(e) => setMobile(e.target.value.replace(/[^\d]/g, "").slice(0, 10))}
          inputMode="numeric"
          className="w-full bg-cream border-2 border-ink rounded-xl px-3 py-2 text-sm outline-none focus:border-terracotta"
        />
      </div>
      {user.email && (
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Email</label>
          <div className="w-full bg-cream/60 border-2 border-ink/30 rounded-xl px-3 py-2 text-sm text-muted-foreground">
            {user.email}
          </div>
        </div>
      )}
      <BakeryButton variant="primary" className="w-full" onClick={save} disabled={saving}>
        {saving ? <Loader2 size={15} className="mr-1.5 animate-spin" /> : null}
        Save changes
      </BakeryButton>
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="text-center py-6 text-muted-foreground">
      <div className="w-14 h-14 mx-auto rounded-full bg-mustard border-2 border-ink flex items-center justify-center mb-3">
        <PackageX size={24} className="text-terracotta" />
      </div>
      <div className="font-semibold text-sm">No orders yet</div>
      <div className="text-xs mt-1">Your bookings will appear here once you place an order.</div>
      <BakeryButton variant="cream" className="mt-3 text-sm" onClick={() => useApp.getState().navigate({ name: "search" })}>
        Browse cakes
      </BakeryButton>
    </div>
  );
}

function OrderList({ orders, onReorder }: { orders: any[]; onReorder: (o: any) => void }) {
  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto nb-scroll pr-1">
      {orders.map((o: any) => (
        <BakeryCard key={o.id} className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div>
              <div className="font-display font-black text-terracotta">{o.orderId}</div>
              <div className="text-[11px] text-muted-foreground">{formatDate(o.createdAt)}</div>
            </div>
            <Pill color={o.status === "PICKED_UP" ? "cream" : o.status === "CANCELLED" ? "burgundy" : "mustard"}>
              {ORDER_STATUS_META[o.status]?.label || o.status}
            </Pill>
          </div>
          <div className="text-xs text-muted-foreground mb-2">
            Pickup: {o.pickupDate} · {o.pickupSlot}
          </div>
          <div className="space-y-1 mb-3">
            {o.items.map((it: any) => (
              <div key={it.id} className="flex justify-between text-sm">
                <span>{it.name} · {it.weight}lb ×{it.qty}</span>
                <span className="font-semibold">{inr(it.price * it.qty)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between pt-2 border-t-2 border-dashed border-ink/20">
            <span className="font-display font-bold">Total: {inr(o.total)}</span>
            <BakeryButton variant="outline" className="!py-1.5 text-xs" onClick={() => onReorder(o)}>
              <RefreshCw size={13} className="mr-1" /> Reorder
            </BakeryButton>
          </div>
        </BakeryCard>
      ))}
    </div>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 bg-cream border-2 border-ink rounded-xl px-3 py-2.5">
      <span className="text-terracotta shrink-0">{icon}</span>
      {children}
    </div>
  );
}

function friendlyAuthError(code: string): string {
  const map: Record<string, string> = {
    "auth/email-already-in-use": "An account with this email already exists. Try logging in.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with this email. Try signing up.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/popup-closed-by-user": "Google sign-in was cancelled.",
    "auth/network-request-failed": "Network error. Please check your connection.",
    "auth/invalid-phone-number": "Please enter a valid 10-digit mobile number.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/invalid-verification-code": "Invalid OTP. Please check and try again.",
    "auth/code-expired": "OTP expired. Please request a new one.",
    "auth/missing-phone-number": "Please enter your mobile number.",
    "auth/captcha-check-failed": "Verification failed. Please try again.",
    "auth/operation-not-allowed": "Phone login is not enabled. Contact support.",
  };
  return map[code] || code || "Something went wrong. Please try again.";
}
