"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type User,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "./firebase";
import { ensureUserProfile, getUserProfile } from "./firestore";
import type { CustomerProfile } from "./types";

export interface BakeryUser {
  uid: string;
  email: string | null;
  name: string | null;
  mobile: string | null;
}

function toBakeryUser(u: User, profile?: CustomerProfile | null): BakeryUser {
  return {
    uid: u.uid,
    email: u.email,
    name: profile?.name ?? u.displayName ?? null,
    mobile: profile?.mobile ?? u.phoneNumber ?? null,
  };
}

// ---- Local profile cache (survives page reloads even if Firestore rules block reads) ----

function cacheProfile(uid: string, user: BakeryUser) {
  try {
    localStorage.setItem(
      "pihu_profile_cache",
      JSON.stringify({ uid, name: user.name, email: user.email, mobile: user.mobile })
    );
  } catch {}
}

function getCachedProfile(uid: string): BakeryUser | null {
  try {
    const raw = localStorage.getItem("pihu_profile_cache");
    if (!raw) return null;
    const cached = JSON.parse(raw);
    if (cached.uid !== uid) return null;
    return {
      uid: cached.uid,
      email: cached.email ?? null,
      name: cached.name ?? null,
      mobile: cached.mobile ?? null,
    };
  } catch {
    return null;
  }
}

function clearCachedProfile() {
  try {
    localStorage.removeItem("pihu_profile_cache");
  } catch {}
}

// Merge: prefer Firestore profile, fall back to cache, then auth data
function mergeUser(u: User, profile: CustomerProfile | null): BakeryUser {
  const cached = getCachedProfile(u.uid);
  return {
    uid: u.uid,
    email: u.email,
    name: profile?.name ?? cached?.name ?? u.displayName ?? null,
    mobile: profile?.mobile ?? cached?.mobile ?? u.phoneNumber ?? null,
  };
}

// ---- Phone OTP auth (PRIMARY method) ----

let recaptchaVerifier: RecaptchaVerifier | null = null;

function getRecaptchaVerifier(): RecaptchaVerifier {
  if (!auth) throw new Error("Auth not initialized");
  if (!recaptchaVerifier) {
    // Invisible reCAPTCHA — renders inside #recaptcha-container
    recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
      callback: () => {
        // reCAPTCHA solved — signInWithPhoneNumber will proceed
      },
      "expired-callback": () => {
        // Reset for next attempt
        recaptchaVerifier = null;
      },
    });
  }
  return recaptchaVerifier;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // Indian numbers: strip leading 0 or 91, then prepend +91
  const last10 = digits.slice(-10);
  return `+91${last10}`;
}

export async function sendOTP(
  phoneNumber: string,
  name?: string
): Promise<ConfirmationResult> {
  if (!auth) throw new Error("Auth not initialized");
  const verifier = getRecaptchaVerifier();
  const formatted = formatPhone(phoneNumber);
  const confirmation = await signInWithPhoneNumber(auth, formatted, verifier);
  // Stash name for profile creation on verify
  if (name) {
    try {
      sessionStorage.setItem("pihu_otp_name", name);
    } catch {}
  }
  return confirmation;
}

export async function verifyOTP(
  confirmation: ConfirmationResult,
  code: string
): Promise<BakeryUser> {
  if (!auth) throw new Error("Auth not initialized");
  const cred = await confirmation.confirm(code);
  const name = (typeof sessionStorage !== "undefined" && sessionStorage.getItem("pihu_otp_name")) || undefined;
  // Extract 10-digit mobile from firebase phone (+91XXXXXXXXXX)
  const phoneDigits = (cred.user.phoneNumber || "").replace(/\D/g, "");
  const mobile10 = phoneDigits.slice(-10);
  // Best-effort profile write
  try {
    await ensureUserProfile(cred.user.uid, {
      name: name || "Customer",
      email: cred.user.email || "",
      mobile: mobile10,
    });
  } catch (e) {
    console.warn("Firestore profile write skipped:", e);
  }
  let profile: CustomerProfile | null = null;
  try {
    profile = await getUserProfile(cred.user.uid);
  } catch (e) {
    console.warn("Firestore profile read skipped:", e);
  }
  // Clean up
  try {
    sessionStorage.removeItem("pihu_otp_name");
  } catch {}
  // Reset recaptcha for future use
  if (recaptchaVerifier) {
    try {
      recaptchaVerifier.clear();
    } catch {}
    recaptchaVerifier = null;
  }
  return mergeUser(cred.user, profile);
}

export async function signupWithEmail(
  email: string,
  password: string,
  name: string,
  mobile: string
): Promise<BakeryUser> {
  if (!auth) throw new Error("Auth not initialized");
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  // Best-effort Firestore profile write (rules may block; auth still succeeds)
  try {
    await ensureUserProfile(cred.user.uid, { name, email, mobile });
  } catch (e) {
    console.warn("Firestore profile write skipped:", e);
  }
  const user = mergeUser(cred.user, { name, email, mobile } as CustomerProfile);
  cacheProfile(cred.user.uid, user);
  return user;
}

export async function loginWithEmail(
  email: string,
  password: string
): Promise<BakeryUser> {
  if (!auth) throw new Error("Auth not initialized");
  const cred = await signInWithEmailAndPassword(auth, email, password);
  // Best-effort profile read; fall back to cache + auth data if Firestore is locked
  let profile: CustomerProfile | null = null;
  try {
    profile = await getUserProfile(cred.user.uid);
  } catch (e) {
    console.warn("Firestore profile read skipped:", e);
  }
  const user = mergeUser(cred.user, profile);
  cacheProfile(cred.user.uid, user);
  return user;
}

export async function loginWithGoogle(): Promise<BakeryUser> {
  if (!auth) throw new Error("Auth not initialized");
  const provider = new GoogleAuthProvider();
  provider.addScope("email");
  provider.addScope("profile");
  provider.setCustomParameters({ prompt: "select_account" });
  const cred = await signInWithPopup(auth, provider);
  let profile: CustomerProfile | null = null;
  try {
    profile = await getUserProfile(cred.user.uid);
  } catch (e) {
    console.warn("Firestore profile read skipped:", e);
  }
  if (!profile) {
    profile = {
      name: cred.user.displayName ?? "Customer",
      email: cred.user.email ?? "",
      mobile: cred.user.phoneNumber ?? "",
    };
    try {
      await ensureUserProfile(cred.user.uid, profile);
    } catch (e) {
      console.warn("Firestore profile write skipped:", e);
    }
  }
  const user = mergeUser(cred.user, profile);
  cacheProfile(cred.user.uid, user);
  return user;
}

export async function getFirebaseIdToken(): Promise<string> {
  if (!auth?.currentUser) throw new Error("Please sign in with Google first");
  return auth.currentUser.getIdToken();
}

export async function logoutUser(): Promise<void> {
  if (!auth) return;
  await signOut(auth);
  clearCachedProfile();
}

// Subscribe to auth state changes; returns the bakery user + profile.
// Profile read is best-effort — falls back to localStorage cache, then auth data.
export function subscribeAuth(
  cb: (user: BakeryUser | null) => void
): () => void {
  if (!auth) {
    cb(null);
    return () => {};
  }
  return onAuthStateChanged(auth, async (u) => {
    if (!u) {
      clearCachedProfile();
      cb(null);
      return;
    }
    let profile: CustomerProfile | null = null;
    try {
      profile = await getUserProfile(u.uid);
    } catch (e) {
      console.warn("Firestore profile read skipped:", e);
    }
    // Merge: prefer Firestore, fall back to cache, then auth data
    const user = mergeUser(u, profile);
    cacheProfile(u.uid, user);
    cb(user);
  });
}

export async function updateUserProfile(
  uid: string,
  data: { name?: string; mobile?: string }
): Promise<void> {
  let profile: CustomerProfile | null = null;
  try {
    profile = await getUserProfile(uid);
  } catch (e) {
    console.warn("Firestore profile read skipped:", e);
  }
  const merged = {
    name: data.name ?? profile?.name ?? "Customer",
    email: profile?.email ?? "",
    mobile: data.mobile ?? profile?.mobile ?? "",
  };
  try {
    await ensureUserProfile(uid, merged);
  } catch (e) {
    console.warn("Firestore profile write skipped:", e);
  }
  if (auth?.currentUser && data.name) {
    await updateProfile(auth.currentUser, { displayName: data.name });
  }
  // Update the local cache so the new name/mobile persist across reloads
  cacheProfile(uid, {
    uid,
    email: auth?.currentUser?.email ?? null,
    name: merged.name,
    mobile: merged.mobile,
  });
}
