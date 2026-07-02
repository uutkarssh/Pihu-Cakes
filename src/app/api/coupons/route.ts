import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  // Admin: return all coupons; public: return only active ones
  const { searchParams } = new URL(req.url);
  const admin = searchParams.get("admin") === "1";

  if (admin) {
    if (!(await isAdmin()))
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ coupons });
  }

  // Public: only return active, non-expired coupons (without sensitive fields)
  const coupons = await db.coupon.findMany({
    where: { active: true, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
    select: { code: true, type: true, value: true, minOrder: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ coupons });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (body.id) {
    const c = await db.coupon.update({
      where: { id: body.id },
      data: {
        code: body.code?.toUpperCase(),
        type: body.type,
        value: Number(body.value),
        minOrder: Number(body.minOrder) || 0,
        active: body.active,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
      },
    });
    return NextResponse.json({ coupon: c });
  }
  const c = await db.coupon.create({
    data: {
      code: body.code.toUpperCase(),
      type: body.type,
      value: Number(body.value),
      minOrder: Number(body.minOrder) || 0,
      active: body.active ?? true,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      usageLimit: body.usageLimit ? Number(body.usageLimit) : null,
    },
  });
  return NextResponse.json({ coupon: c });
}
