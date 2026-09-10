import type {
  ProductT,
  CategoryT,
  OrderT,
  ReviewT,
  PickupSlotT,
  CouponT,
  ChatMessage,
} from "./types";

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error((e as any).error || "Request failed");
  }
  return res.json() as Promise<T>;
}

export const api = {
  products: (params: Record<string, string> = {}) =>
    fetch(`/api/products?${new URLSearchParams(params)}`).then(j<{ products: ProductT[] }>),
  product: (slug: string) =>
    fetch(`/api/products/${slug}`).then(j<{ product: ProductT }>),
  categories: () => fetch(`/api/categories`).then(j<{ categories: CategoryT[] }>),
  content: () => fetch(`/api/content`).then(j<{ content: Record<string, string> }>),

  createOrder: (body: any) =>
    fetch(`/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(j<{ order: OrderT }>),
  order: (id: string) =>
    fetch(`/api/orders/${id}`).then(j<{ order: OrderT }>),
  myOrders: (key: string) => {
    const params = new URLSearchParams();
    if (key.includes("@")) params.set("email", key);
    else if (key.startsWith("firebase_") || key.length > 15) params.set("firebaseUid", key);
    else params.set("mobile", key);
    return fetch(`/api/me/orders?${params}`).then(j<{ orders: OrderT[] }>);
  },
  myOrdersByUid: (uid: string) =>
    fetch(`/api/me/orders?firebaseUid=${encodeURIComponent(uid)}`).then(j<{ orders: OrderT[] }>),

  slots: () => fetch(`/api/slots`).then(j<{ slots: PickupSlotT[] }>),
  slotAvailability: (date: string) =>
    fetch(`/api/slots/availability?date=${date}`).then(j<{ availability: any[] }>),
  disabledDates: () => fetch(`/api/dates`).then(j<{ dates: any[] }>),

  validateCoupon: (code: string, subtotal: number) =>
    fetch(`/api/coupons/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, subtotal }),
    }).then(j<any>),

  reviews: (productId: string) =>
    fetch(`/api/reviews?productId=${productId}`).then(j<{ reviews: ReviewT[] }>),
  featuredReviews: () =>
    fetch(`/api/reviews?featured=1`).then(j<{ reviews: any[] }>),
  createReview: (body: any) =>
    fetch(`/api/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(j<any>),

  // AI
  aiChat: (sessionId: string, message: string) =>
    fetch(`/api/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message }),
    }).then(j<{ reply: string; sessionId: string }>),
  aiRecommend: (body: any) =>
    fetch(`/api/ai/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(j<any>),
  aiSmartSearch: (query: string) =>
    fetch(`/api/ai/smart-search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    }).then(j<any>),
  aiMessages: (body: any) =>
    fetch(`/api/ai/message-suggestions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(j<{ suggestions: string[] }>),

  // Admin
  adminLogin: (email: string, password: string) =>
    fetch(`/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(j<any>),
  adminGoogleLogin: (idToken: string) =>
    fetch(`/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }).then(j<any>),
  adminMe: () => fetch(`/api/admin/me`).then(j<{ authed: boolean }>),
  adminLogout: () =>
    fetch(`/api/admin/logout`, { method: "POST" }).then(j<any>),
  adminOrders: (params: Record<string, string> = {}) =>
    fetch(`/api/orders?${new URLSearchParams(params)}`).then(j<{ orders: OrderT[] }>),
  adminUpdateOrder: (id: string, body: any) =>
    fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(j<{ order: OrderT; whatsappLink?: string | null }>),
  adminDeleteOrder: (id: string) =>
    fetch(`/api/orders/${id}`, { method: "DELETE" }).then(j<{ success: boolean }>),
  adminStats: () => fetch(`/api/admin/stats`).then(j<any>),
  adminAllReviews: (status = "all") =>
    fetch(`/api/reviews?status=${status}`).then(j<{ reviews: any[] }>),
  adminUpdateReview: (id: string, status: string) =>
    fetch(`/api/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }).then(j<any>),
  adminSlots: () => fetch(`/api/slots`).then(j<{ slots: PickupSlotT[] }>),
  adminSaveSlot: (body: any) =>
    fetch(`/api/slots`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(j<any>),
  adminDates: () => fetch(`/api/dates`).then(j<{ dates: any[] }>),
  adminToggleDate: (body: any) =>
    fetch(`/api/dates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(j<any>),
  adminCoupons: () => fetch(`/api/coupons?admin=1`).then(j<{ coupons: CouponT[] }>),
  adminSaveCoupon: (body: any) =>
    fetch(`/api/coupons`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(j<any>),
  adminCreateCategory: (body: any) =>
    fetch(`/api/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(j<{ category: CategoryT }>),
  adminUpdateCategory: (id: string, body: any) =>
    fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(j<{ category: CategoryT }>),
  adminDeleteCategory: (id: string) =>
    fetch(`/api/categories?id=${id}`, { method: "DELETE" }).then(j<any>),
  adminCreateProduct: (body: any) =>
    fetch(`/api/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(j<{ product: ProductT }>),
  adminUpdateProduct: (slug: string, body: any) =>
    fetch(`/api/products/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(j<{ product: ProductT }>),
  adminDeleteProduct: (slug: string) =>
    fetch(`/api/products/${slug}`, { method: "DELETE" }).then(j<any>),
  adminAiDesc: (body: any) =>
    fetch(`/api/ai/product-description`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(j<{ description: string }>),
  adminAiSeo: (body: any) =>
    fetch(`/api/ai/seo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(j<any>),
  adminAiBanner: (festival: string) =>
    fetch(`/api/ai/festival-banner`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ festival }),
    }).then(j<any>),
  adminAiReviewSummary: (productId?: string) =>
    fetch(`/api/ai/review-summary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    }).then(j<any>),
  adminAiInsights: () => fetch(`/api/ai/order-insights`).then(j<any>),
};
