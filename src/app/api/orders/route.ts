import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { genOrderId, todayISO } from "@/lib/format";
import { isAdmin } from "@/lib/auth";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const q = searchParams.get("q")?.toLowerCase();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    parseInt(searchParams.get("pageSize") || String(DEFAULT_PAGE_SIZE))
  );

  let where: any = {};
  if (status && status !== "all") where.status = status;
  if (q) {
    where.OR = [
      { orderId: { contains: q } },
      { customerName: { contains: q } },
      { mobile: { contains: q } },
    ];
  }

  // Get total count
  const total = await db.order.count({ where });

  // Fetch paginated orders
  const orders = await db.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: pageSize,
    skip: (page - 1) * pageSize,
  });

  return NextResponse.json({
    orders,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { customerName, mobile, email, firebaseUid, pickupDate, pickupSlot, specialRequirements, paymentMethod, items, couponCode } = body;

  if (!customerName || !mobile || !pickupDate || !pickupSlot || !items?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!/^\d{10}$/.test(String(mobile).replace(/\D/g, "").slice(-10)) && String(mobile).length < 10) {
    return NextResponse.json({ error: "Invalid mobile number" }, { status: 400 });
  }

  // Validate pickup date is in the future and not disabled
  const today = todayISO();
  if (pickupDate < today) {
    return NextResponse.json({ error: "Pickup date cannot be in the past" }, { status: 400 });
  }
  const disabled = await db.disabledDate.findUnique({ where: { date: pickupDate } });
  if (disabled) {
    return NextResponse.json({ error: `Sorry, we are closed on this date (${disabled.reason || "holiday"})` }, { status: 400 });
  }

  // Check slot availability with single combined query (parallel execution)
  const [slot, closed, existingInSlot] = await Promise.all([
    db.pickupSlot.findFirst({ where: { label: pickupSlot } }),
    db.slotClosure.findFirst({ where: { date: pickupDate, slotLabel: pickupSlot } }),
    db.order.count({
      where: { pickupDate, pickupSlot, status: { notIn: ["CANCELLED"] } },
    }),
  ]);

  if (slot && !slot.enabled) {
    return NextResponse.json({ error: "This time slot is not available" }, { status: 400 });
  }
  if (closed) {
    return NextResponse.json({ error: "This time slot is fully booked, please pick another" }, { status: 400 });
  }
  const maxOrders = slot?.maxOrders ?? 5;
  if (existingInSlot >= maxOrders) {
    return NextResponse.json({ error: "This time slot is fully booked, please pick another" }, { status: 400 });
  }

  // Verify prices from database to prevent price manipulation
  const productIds = items.map((it: any) => it.productId).filter(Boolean);
  let dbPrices: Map<string, Map<string, number>> = new Map();
  if (productIds.length > 0) {
    const dbProducts = await db.product.findMany({
      where: { id: { in: productIds } },
      include: { weights: true },
    });
    for (const p of dbProducts) {
      const weightMap = new Map(p.weights.map((w: any) => [w.weight, w.price]));
      dbPrices.set(p.id, weightMap);
    }
  }

  let subtotal = 0;
  const orderItems = items.map((it: any) => {
    // Use DB price if available, otherwise fall back to client price (for custom items)
    let verifiedPrice = it.price;
    if (it.productId && dbPrices.has(it.productId)) {
      const weightPrices = dbPrices.get(it.productId)!;
      if (weightPrices.has(it.weight)) {
        verifiedPrice = weightPrices.get(it.weight)!;
      }
    }
    subtotal += it.qty * verifiedPrice;
    return {
      productId: it.productId || null,
      name: it.name,
      weight: it.weight,
      qty: it.qty,
      price: verifiedPrice,
      image: it.image || null,
    };
  });

  // Coupon
  let discount = 0;
  let appliedCoupon: string | null = null;
  if (couponCode) {
    const coupon = await db.coupon.findUnique({ where: { code: couponCode.toUpperCase() } });
    if (coupon && coupon.active && (!coupon.expiresAt || new Date(coupon.expiresAt) > new Date())) {
      if (subtotal >= coupon.minOrder && (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit)) {
        appliedCoupon = coupon.code;
        discount = coupon.type === "FLAT" ? coupon.value : Math.round((subtotal * coupon.value) / 100);
        if (discount > subtotal) discount = subtotal;
        await db.coupon.update({ where: { id: coupon.id }, data: { usedCount: { increment: 1 } } });
      }
    }
  }

  const total = subtotal - discount;
  const orderId = genOrderId();

  const order = await db.order.create({
    data: {
      orderId,
      customerName,
      mobile: String(mobile).replace(/\D/g, "").slice(-10),
      email: email || null,
      firebaseUid: firebaseUid || null,
      pickupDate,
      pickupSlot,
      specialRequirements: specialRequirements || null,
      paymentMethod: paymentMethod || "PAY_AT_PICKUP",
      paymentStatus: paymentMethod === "ONLINE" ? "PAID" : "PENDING",
      status: "RECEIVED",
      subtotal,
      discount,
      total,
      couponCode: appliedCoupon,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  return NextResponse.json({ order });
}
