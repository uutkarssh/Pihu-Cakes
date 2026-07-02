"use client";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { CustomerProfile } from "./types";

const PROFILE = (uid: string) => doc(db!, "users", uid);
const WISH = (uid: string, productId: string) =>
  doc(db!, "users", uid, "wishlist", productId);
const WISH_COL = (uid: string) => collection(db!, "users", uid, "wishlist");

// ---- User profile ----
export async function ensureUserProfile(
  uid: string,
  data: CustomerProfile
): Promise<void> {
  if (!db) return;
  await setDoc(
    PROFILE(uid),
    {
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function getUserProfile(
  uid: string
): Promise<CustomerProfile | null> {
  if (!db) return null;
  const snap = await getDoc(PROFILE(uid));
  if (!snap.exists()) return null;
  return snap.data() as CustomerProfile;
}

// ---- Wishlist (synced to Firestore) ----
export async function setWishlistItem(
  uid: string,
  productId: string,
  present: boolean
): Promise<void> {
  if (!db) return;
  if (present) {
    await setDoc(WISH(uid, productId), {
      productId,
      addedAt: serverTimestamp(),
    });
  } else {
    await deleteDoc(WISH(uid, productId));
  }
}

export async function fetchWishlist(uid: string): Promise<string[]> {
  if (!db) return [];
  const snap = await getDocs(WISH_COL(uid));
  return snap.docs.map((d) => d.id);
}

// Live subscription to wishlist changes
export function subscribeWishlist(
  uid: string,
  cb: (ids: string[]) => void
): () => void {
  if (!db) {
    cb([]);
    return () => {};
  }
  return onSnapshot(WISH_COL(uid), (snap) => {
    cb(snap.docs.map((d) => d.id));
  });
}
