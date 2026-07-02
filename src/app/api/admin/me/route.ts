import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";

// Checks if the current session has a valid admin cookie (server-side).
export async function GET() {
  return NextResponse.json({ authed: await isAdmin() });
}
