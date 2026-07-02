import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { BRAND } from "@/lib/brand";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const byMobile = searchParams.get("mobile");

  if (byMobile) {
    // Single query for mobile lookup (no wasted first query)
    const orders = await db.order.findMany({
      where: { mobile: byMobile },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ orders });
  }

  const order = await db.order.findFirst({
    where: { OR: [{ orderId: id }, { id }] },
    include: { items: true },
  });
  if (!order)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ order });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const order = await db.order.findFirst({
    where: { OR: [{ orderId: id }, { id }] },
    include: { items: true },
  });
  if (!order)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: any = {};
  if (body.status) data.status = body.status;
  if (body.adminNote !== undefined) data.adminNote = body.adminNote;
  if (body.paymentStatus) data.paymentStatus = body.paymentStatus;

  const updated = await db.order.update({
    where: { id: order.id },
    data,
    include: { items: true },
  });

  // Generate WhatsApp confirmation link when accepting
  let whatsappLink: string | null = null;
  if (body.status === "ACCEPTED") {
    whatsappLink = buildWhatsAppLink(updated);
  }
  // When marking ready, no whatsapp; just return
  return NextResponse.json({ order: updated, whatsappLink });
}

export function buildWhatsAppLink(order: any): string {
  const items = order.items
    .map((it: any) => `• ${it.name} (${it.weight} lb) x${it.qty}`)
    .join("\n");
  const msg = `Hello ${order.customerName},

Thank you for ordering from ${BRAND.name}!

Your order has been CONFIRMED.

Order ID: ${order.orderId}
Cake(s):
${items}

Pickup Date: ${order.pickupDate}
Pickup Time: ${order.pickupSlot}

Special Instructions: ${order.specialRequirements || "—"}
Payment: ${order.paymentMethod === "ONLINE" ? "Paid Online" : "Pay at Pickup"}
Total: Rs.${order.total}

Please reply to confirm your booking. Orders that remain unconfirmed may be cancelled.

We look forward to serving you.
— ${BRAND.name} (by ${BRAND.parentStore})`;
  return `https://wa.me/91${order.mobile}?text=${encodeURIComponent(msg)}`;
}