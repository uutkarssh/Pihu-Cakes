import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  const slots = await db.pickupSlot.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json({ slots });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (body.id) {
    const slot = await db.pickupSlot.update({
      where: { id: body.id },
      data: {
        label: body.label,
        startTime: body.startTime,
        endTime: body.endTime,
        maxOrders: Number(body.maxOrders),
        enabled: body.enabled,
        order: body.order,
      },
    });
    return NextResponse.json({ slot });
  }
  const slot = await db.pickupSlot.create({
    data: {
      label: body.label,
      startTime: body.startTime,
      endTime: body.endTime,
      maxOrders: Number(body.maxOrders),
      enabled: body.enabled ?? true,
      order: body.order ?? 0,
    },
  });
  return NextResponse.json({ slot });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.pickupSlot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
