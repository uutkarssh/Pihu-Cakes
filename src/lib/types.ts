// Shared API types (used by frontend + backend)
export interface WeightPriceT { id: string; weight: string; label: string; price: number; mrp?: number | null; }
export interface ProductImageT { id: string; url: string; alt: string; order: number; }
export interface ProductT { id: string; name: string; slug: string; categoryId: string; categoryName?: string; description: string; ingredients: string; prepHours: number; rating: number; reviewCount: number; isFeatured: boolean; isBestSeller: boolean; isFreshToday: boolean; isSeasonal: boolean; eggless: boolean; tags: string[]; status: string; images: ProductImageT[]; weights: WeightPriceT[]; createdAt: string; }
export interface CategoryT { id: string; name: string; slug: string; description?: string | null; icon?: string | null; order: number; }
export interface CartItemT { productId: string; name: string; slug: string; image: string; weight: string; weightLabel: string; qty: number; price: number; }
export interface OrderT {
  id: string; orderId: string; customerName: string; mobile: string; email?: string | null;
  fulfillmentType: "PICKUP" | "DELIVERY"; pickupDate: string; pickupSlot: string;
  deliveryAddress?: string | null; deliveryFee: number; specialRequirements?: string | null;
  paymentMethod: string; paymentStatus: string; status: string; subtotal: number; discount: number; total: number;
  couponCode?: string | null; adminNote?: string | null; createdAt: string; items: OrderItemT[];
}
export interface OrderItemT { id: string; productId?: string | null; name: string; weight: string; qty: number; price: number; image?: string | null; }
export interface ReviewT { id: string; productId: string; customerName: string; rating: number; title?: string | null; body: string; images: string[]; status: string; verified: boolean; createdAt: string; }
export interface PickupSlotT { id: string; label: string; startTime: string; endTime: string; maxOrders: number; enabled: boolean; order: number; }
export interface CouponT { id: string; code: string; type: string; value: number; minOrder: number; active: boolean; expiresAt?: string | null; usageLimit?: number | null; usedCount: number; }
export interface ChatMessage { role: "user" | "assistant"; content: string; }
export interface CustomerProfile { name: string; email: string; mobile: string; createdAt?: string; }
export interface BakeryUserT { uid: string; email: string | null; name: string | null; mobile: string | null; }
