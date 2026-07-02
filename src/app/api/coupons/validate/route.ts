import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json();
  if (!code) return NextResponse.json({ valid: false, message: "Enter a code" });
  const coupon = await db.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!coupon || !coupon.active)
    return NextResponse.json({ valid: false, message: "Invalid coupon code" });
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
    return NextResponse.json({ valid: false, message: "Coupon expired" });
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
    return NextResponse.json({ valid: false, message: "Coupon usage limit reached" });
  if (subtotal < coupon.minOrder)
    return NextResponse.json({
      valid: false,
      message: `Minimum order ₹${coupon.minOrder} required`,
    });

  const discount =
    coupon.type === "FLAT"
      ? coupon.value
      : Math.round((subtotal * coupon.value) / 100);
  return NextResponse.json({
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount: Math.min(discount, subtotal),
    message: `Coupon applied — you saved ₹${Math.min(discount, subtotal)}!`,
  });
}
