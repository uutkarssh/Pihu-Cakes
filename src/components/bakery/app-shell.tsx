"use client";

import { useEffect } from "react";
import { useApp } from "@/lib/store";
import { useFirebaseBootstrap } from "@/lib/use-firebase";
import { Header } from "./header";
import { Footer } from "./footer";
import { FloatingButtons } from "./floating-buttons";
import { ChatWidget } from "./chat-widget";
import { HomeView } from "./views/home";
import { SearchView } from "./views/search";
import { ProductView } from "./views/product-detail";
import { CartView } from "./views/cart";
import { CheckoutView } from "./views/checkout";
import { ConfirmationView } from "./views/confirmation";
import { ContactView } from "./views/contact";
import { AccountView } from "./views/account";
import { AdminPanel } from "./admin/admin-panel";
import { AuthGuard } from "./auth-guard";

export function AppShell() {
  const view = useApp((s) => s.view);

  // Rehydrate persisted client state AFTER mount to avoid SSR hydration
  // mismatches (cart/wishlist counts differ between server and client).
  useEffect(() => {
    useApp.persist.rehydrate();
  }, []);

  // Boot Firebase Auth + Firestore wishlist sync
  useFirebaseBootstrap();

  const isAdmin = view.name === "admin";

  return (
    <div className="min-h-screen flex flex-col bg-background doodle-bg">
      <Header />
      <main className="flex-1 w-full">
        {view.name === "home" && <HomeView />}
        {view.name === "search" && (
          <SearchView query={view.query} category={view.category} />
        )}
        {view.name === "product" && <ProductView key={view.slug} slug={view.slug} />}
        {view.name === "cart" && (
          <AuthGuard feature="view your cart">
            <CartView />
          </AuthGuard>
        )}
        {view.name === "checkout" && (
          <AuthGuard feature="checkout and place an order">
            <CheckoutView />
          </AuthGuard>
        )}
        {view.name === "confirmation" && (
          <AuthGuard feature="view your order confirmation">
            <ConfirmationView orderId={view.orderId} />
          </AuthGuard>
        )}
        {view.name === "contact" && <ContactView />}
        {view.name === "account" && <AccountView />}
        {view.name === "admin" && <AdminPanel />}
      </main>
      {!isAdmin && <Footer />}
      <FloatingButtons />
      <ChatWidget />
    </div>
  );
}
