import { NextResponse } from "next/server";
import { aiChat } from "@/lib/ai";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

// AI order insights for dashboard
export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const orders = await db.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const active = orders.filter((o) => o.status !== "CANCELLED");
  const productCounts = new Map<string, number>();
  active.forEach((o) =>
    o.items.forEach((it) =>
      productCounts.set(it.name, (productCounts.get(it.name) || 0) + it.qty)
    )
  );
  const top = [...productCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }));

  const slotCounts = new Map<string, number>();
  active.forEach((o) =>
    slotCounts.set(o.pickupSlot, (slotCounts.get(o.pickupSlot) || 0) + 1)
  );
  const slots = [...slotCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));

  const revenue = active.reduce((a, o) => a + o.total, 0);
  const avgOrder = active.length ? Math.round(revenue / active.length) : 0;

  const stats = {
    totalOrders: orders.length,
    activeOrders: active.length,
    revenue,
    avgOrder,
    topProducts: top,
    busySlots: slots,
    statusBreakdown: {
      received: orders.filter((o) => o.status === "RECEIVED").length,
      accepted: orders.filter((o) => o.status === "ACCEPTED").length,
      preparing: orders.filter((o) => o.status === "PREPARING").length,
      ready: orders.filter((o) => o.status === "READY").length,
      picked: orders.filter((o) => o.status === "PICKED_UP").length,
      cancelled: orders.filter((o) => o.status === "CANCELLED").length,
    },
  };

  const system = `You are a business analyst for a bakery. Given order stats, give 4-6 short actionable bullet-point insights (popular products, busy slots, customer trends, suggestions). Use "- " bullets. Be specific and warm. Plain text, no markdown headings.`;
  const user = `Stats:\n${JSON.stringify(stats, null, 2)}`;

  let insights: string;
  try {
    insights = await aiChat([{ role: "user", content: user }], system);
  } catch {
    insights =
      `- You have ${stats.activeOrders} active orders totalling ₹${stats.revenue}.\n` +
      `- Your top product is ${top[0]?.name || "—"}.\n` +
      `- Busiest pickup slot is ${slots[0]?.label || "—"}.\n` +
      `- Average order value is ₹${stats.avgOrder}.`;
  }

  return NextResponse.json({ insights, stats });
}
