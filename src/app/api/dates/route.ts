import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

// Disabled dates + slot closures
export async function GET() {
  const dates = await db.disabledDate.findMany();
  return NextResponse.json({ dates });
}

export async function POST(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();

  if (body.action === "close-slot") {
    await db.slotClosure.create({
      data: { date: body.date, slotLabel: body.slotLabel },
    });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "open-slot") {
    await db.slotClosure.deleteMany({
      where: { date: body.date, slotLabel: body.slotLabel },
    });
    return NextResponse.json({ ok: true });
  }
  if (body.action === "enable") {
    await db.disabledDate.deleteMany({ where: { date: body.date } });
    return NextResponse.json({ ok: true });
  }
  // default: disable date
  const date = await db.disabledDate.create({
    data: { date: body.date, reason: body.reason || "Holiday" },
  });
  return NextResponse.json({ date });
}

export async function DELETE(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });
  await db.disabledDate.deleteMany({ where: { date } });
  return NextResponse.json({ ok: true });
}
