"use client";

import { useEffect } from "react";
import { useApp } from "./store";
import { subscribeAuth } from "./firebase-auth";
import { subscribeWishlist, setWishlistItem } from "./firestore";

/**
 * Boots Firebase Auth on the client:
 *  - subscribes to auth state and pushes the user into the zustand store
 *  - when a user logs in, subscribes to their Firestore wishlist and merges into the store
 *  - when a user logs out, detaches the wishlist subscription
 */
export function useFirebaseBootstrap() {
  const setFbUser = useApp((s) => s.setFbUser);
  const setFbReady = useApp((s) => s.setFbReady);
  const setCustomer = useApp((s) => s.setCustomer);

  useEffect(() => {
    let wishUnsub: (() => void) | null = null;

    const unsub = subscribeAuth((user) => {
      setFbReady(true);
      setFbUser(user);

      // detach previous wishlist subscription
      if (wishUnsub) {
        wishUnsub();
        wishUnsub = null;
      }

      if (user) {
        // sync customer profile for checkout convenience
        setCustomer({
          name: user.name || user.email || "Customer",
          mobile: user.mobile || "",
          email: user.email || undefined,
        });

        // subscribe to cloud wishlist (best-effort — falls back to local if Firestore locked)
        let cloudSubscribed = false;
        try {
          wishUnsub = subscribeWishlist(user.uid, (cloudIds) => {
            cloudSubscribed = true;
            useApp.setState((s) => {
              // merge: union of local + cloud (cloud wins on conflicts)
              const merged = Array.from(new Set([...s.wishlist, ...cloudIds]));
              return { wishlist: merged };
            });
          });
        } catch (e) {
          console.warn("Wishlist cloud sync disabled:", e);
        }
      } else {
        setCustomer(null);
      }
    });

    return () => {
      unsub();
      if (wishUnsub) wishUnsub();
    };
  }, []);
}

/**
 * Wrap toggleWishlist so changes are also pushed to Firestore when logged in.
 * Call this once near the top of the app tree.
 */
export function useWishlistSync() {
  const fbUser = useApp((s) => s.fbUser);
  const wishlist = useApp((s) => s.wishlist);

  useEffect(() => {
    if (!fbUser) return;
    // No-op effect; the actual sync happens via toggleWishlistSync below.
    // This effect exists to expose `fbUser` to consumers that import the hook.
  }, [fbUser, wishlist]);
}

// Patched toggle that also writes to firestore when logged in.
// If not logged in, redirects to the account/login page instead of toggling.
export function useToggleWishlist() {
  const fbUser = useApp((s) => s.fbUser);
  const fbReady = useApp((s) => s.fbReady);
  const wishlist = useApp((s) => s.wishlist);
  const toggle = useApp((s) => s.toggleWishlist);
  const navigate = useApp((s) => s.navigate);

  return (id: string) => {
    // If Firebase auth is still resolving, ignore the click (prevents race)
    if (!fbReady) return;
    // Login required to wishlist
    if (!fbUser) {
      navigate({ name: "account" });
      return;
    }
    const willBePresent = !wishlist.includes(id);
    toggle(id);
    setWishlistItem(fbUser.uid, id, willBePresent).catch(() => {
      // best-effort; if it fails the local toggle already happened
    });
  };
}
