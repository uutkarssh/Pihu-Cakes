import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { BRAND } from "@/lib/brand";

const ALLOWED_STATUSES = new Set([
  "RECEIVED", "ACCEPTED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED",
]);

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const byMobile = searchParams.get("mobile");
  if (byMobile) {
    const orders = await db.order.findMany({ where: { mobile: byMobile }, include: { items: true }, orderBy: { createdAt: "desc" } });
    return NextResponse.json({ orders });
  }
  const order = await db.order.findFirst({ where: { OR: [{ orderId: id }, { id }] }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const order = await db.order.findFirst({ where: { OR: [{ orderId: id }, { id }] }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: any = {};
  if (body.status) {
    if (!ALLOWED_STATUSES.has(body.status)) return NextResponse.json({ error: "Invalid order status" }, { status: 400 });
    if (body.status === "OUT_FOR_DELIVERY" && order.fulfillmentType !== "DELIVERY") return NextResponse.json({ error: "Pickup orders cannot be marked out for delivery" }, { status: 400 });
    if (body.status === "DELIVERED" && order.fulfillmentType !== "DELIVERY") return NextResponse.json({ error: "Pickup orders cannot be marked delivered" }, { status: 400 });
    data.status = body.status;
  }
  if (body.adminNote !== undefined) data.adminNote = body.adminNote;
  if (body.paymentStatus) data.paymentStatus = body.paymentStatus;

  const updated = await db.order.update({ where: { id: order.id }, data, include: { items: true } });
  const whatsappLink = body.status === "ACCEPTED" ? buildWhatsAppLink(updated) : null;
  return NextResponse.json({ order: updated, whatsappLink });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const order = await db.order.findFirst({ where: { OR: [{ orderId: id }, { id }] }, select: { id: true, status: true } });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (order.status !== "CANCELLED") return NextResponse.json({ error: "Only cancelled orders can be deleted" }, { status: 400 });

  await db.$transaction(async (tx) => {
    await tx.review.deleteMany({ where: { orderId: order.id } });
    await tx.orderItem.deleteMany({ where: { orderId: order.id } });
    await tx.order.delete({ where: { id: order.id } });
  });

  return NextResponse.json({ success: true });
}

export function buildWhatsAppLink(order: any): string {
  const items = order.items.map((it: any) => `• ${it.name} (${it.weight} lb) x${it.qty}`).join("\n");
  const isDelivery = order.fulfillmentType === "DELIVERY";
  const fulfilmentText = isDelivery
    ? `Delivery Date: ${order.pickupDate}\nDelivery Time: ${order.pickupSlot}\nDelivery Address: ${order.deliveryAddress || "—"}`
    : `Pickup Date: ${order.pickupDate}\nPickup Time: ${order.pickupSlot}`;
  const paymentText = order.paymentMethod === "ONLINE" ? "Paid Online" : isDelivery ? "Pay on Delivery" : "Pay at Pickup";
  const msg = `Hello ${order.customerName},

Thank you for ordering from ${BRAND.name}!

Your order has been CONFIRMED.

Order ID: ${order.orderId}
Cake(s):
${items}

${fulfilmentText}

Special Instructions: ${order.specialRequirements || "—"}
Payment: ${paymentText}
Total: Rs.${order.total}

Please reply to confirm your order. Orders that remain unconfirmed may be cancelled.

We look forward to serving you.
— ${BRAND.name} (by ${BRAND.parentStore})`;
  return `https://wa.me/91${order.mobile}?text=${encodeURIComponent(msg)}`;
}
