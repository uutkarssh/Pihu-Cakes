import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (key) {
    const c = await db.content.findUnique({ where: { key } });
    return NextResponse.json({ value: c?.value ?? null });
  }
  const all = await db.content.findMany();
  const map: Record<string, string> = {};
  all.forEach((c) => (map[c.key] = c.value));
  return NextResponse.json({ content: map });
}

export async function PUT(req: NextRequest) {
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { key, value } = await req.json();
  const c = await db.content.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
  return NextResponse.json({ content: c });
}
