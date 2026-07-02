import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Customer lookup of their orders:
//   - by firebaseUid (preferred, when logged in)
//   - by email (logged-in fallback)
//   - by mobile (guest lookup)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const firebaseUid = searchParams.get("firebaseUid");
  const email = searchParams.get("email");
  const mobile = searchParams.get("mobile");

  if (!firebaseUid && !email && !mobile)
    return NextResponse.json({ error: "firebaseUid, email or mobile required" }, { status: 400 });

  let where: any = { OR: [] };
  if (firebaseUid) where.OR.push({ firebaseUid });
  if (email) where.OR.push({ email });
  if (mobile) where.OR.push({ mobile });
  if (where.OR.length === 0) delete where.OR;

  const orders = await db.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}
