import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { todayISO } from "@/lib/format";

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = todayISO();

  // Use aggregated queries instead of loading all orders into memory
  const [todaysOrders, totalOrders, revenueResult, pendingResult, readyResult] = await Promise.all([
    db.order.count({ where: { pickupDate: today, status: { notIn: ["CANCELLED"] } } }),
    db.order.count(),
    db.order.aggregate({ _sum: { total: true }, where: { status: { notIn: ["CANCELLED"] } } }),
    db.order.count({ where: { status: { in: ["RECEIVED", "ACCEPTED", "PREPARING"] } } }),
    db.order.count({ where: { status: "READY" } }),
  ]);

  const revenue = revenueResult._sum.total || 0;

  // Popular products by qty sold (last 200 orders)
  const recentItems = await db.orderItem.findMany({
    where: { order: { status: { notIn: ["CANCELLED"] } } },
    orderBy: { order: { createdAt: "desc" } },
    take: 1000,
    select: { name: true, qty: true, price: true },
  });
  const productCounts = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const it of recentItems) {
    const cur = productCounts.get(it.name) || { name: it.name, qty: 0, revenue: 0 };
    cur.qty += it.qty;
    cur.revenue += it.qty * it.price;
    productCounts.set(it.name, cur);
  }
  const popular = [...productCounts.values()]
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);

  // Monthly revenue (last 6 months)
  const months: { label: string; revenue: number; orders: number }[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
    const label = start.toLocaleString("en-IN", { month: "short" });

    const monthData = await db.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: {
        createdAt: { gte: start, lte: end },
        status: { notIn: ["CANCELLED"] },
      },
    });
    months.push({
      label,
      revenue: monthData._sum.total || 0,
      orders: monthData._count,
    });
  }

  // Busy pickup slots
  const slotCounts = await db.order.groupBy({
    by: ["pickupSlot"],
    where: { status: { notIn: ["CANCELLED"] } },
    _count: true,
  });
  const busySlots = slotCounts
    .map((s) => ({ label: s.pickupSlot, count: s._count }))
    .sort((a, b) => b.count - a.count);

  // Customer growth (unique mobiles per month, cumulative)
  const customerGrowth = await Promise.all(
    months.map(async (m, i) => {
      const cutoff = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0, 23, 59, 59, 999);
      const uniqueCustomers = await db.order.groupBy({
        by: ["mobile"],
        where: { createdAt: { lte: cutoff } },
      });
      return { label: m.label, customers: uniqueCustomers.length };
    })
  );

  // Recent 8 orders for dashboard
  const recent = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  return NextResponse.json({
    todaysOrders,
    revenue,
    pending: pendingResult,
    ready: readyResult,
    totalOrders,
    popular,
    months,
    busySlots,
    customerGrowth,
    recent,
  });
}