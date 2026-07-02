import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { todayISO, addDays } from "@/lib/format";

// GET available slots for a given date (considers closures + bookings)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date") || todayISO();

  const slots = await db.pickupSlot.findMany({
    where: { enabled: true },
    orderBy: { order: "asc" },
  });
  const closures = await db.slotClosure.findMany({ where: { date } });
  const closedLabels = new Set(closures.map((c) => c.slotLabel));
  const counts = await db.order.groupBy({
    by: ["pickupSlot"],
    where: { pickupDate: date, status: { notIn: ["CANCELLED"] } },
    _count: { _all: true },
  });
  const countMap = new Map(counts.map((c) => [c.pickupSlot, c._count._all]));

  const availability = slots.map((s) => {
    const booked = countMap.get(s.label) || 0;
    const closed = closedLabels.has(s.label);
    return {
      id: s.id,
      label: s.label,
      startTime: s.startTime,
      endTime: s.endTime,
      maxOrders: s.maxOrders,
      booked,
      available: !closed && booked < s.maxOrders,
    };
  });
  return NextResponse.json({ date, availability });
}
