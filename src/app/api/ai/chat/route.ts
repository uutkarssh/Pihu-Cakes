import { NextRequest, NextResponse } from "next/server";
import { aiChat } from "@/lib/ai";
import { bakeryContext } from "@/lib/bakery-context";
import { db } from "@/lib/db";
import type { ChatMessage } from "@/lib/types";

// Chat session expiry: 30 minutes
const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_HISTORY = 10; // Keep only last 10 messages

async function getSessionHistory(sessionId: string): Promise<ChatMessage[]> {
  try {
    const session = await db.chatSession.findUnique({ where: { sessionId } });
    if (!session) return [];
    if (new Date(session.expiresAt) < new Date()) {
      await db.chatSession.delete({ where: { id: session.id } });
      return [];
    }
    return JSON.parse(session.messages) as ChatMessage[];
  } catch {
    return [];
  }
}

async function saveSessionHistory(sessionId: string, messages: ChatMessage[]): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.chatSession.upsert({
    where: { sessionId },
    update: { messages: JSON.stringify(messages), expiresAt, updatedAt: new Date() },
    create: { sessionId, messages: JSON.stringify(messages), expiresAt },
  });
}

export async function POST(req: NextRequest) {
  const { sessionId, message } = await req.json();
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

  const sid = sessionId || `session-${Date.now()}-${Math.random()}`;
  const history = await getSessionHistory(sid);
  history.push({ role: "user", content: message });
  const trimmed = history.slice(-MAX_HISTORY * 2);

  const system = await bakeryContext();
  let reply: string;
  try {
    reply = await aiChat(trimmed, system);
  } catch (e: any) {
    console.error("Chat error:", e.message);
    reply =
      "I'm having a little trouble right now. Please WhatsApp KCB KiNGS Cakes Bakes at " +
      "+91 63940 36040 and our team will help you!";
  }

  trimmed.push({ role: "assistant", content: reply });
  await saveSessionHistory(sid, trimmed);
  return NextResponse.json({ reply, sessionId: sid });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sid = searchParams.get("sessionId") || "default";
  try {
    await db.chatSession.deleteMany({ where: { sessionId: sid } });
  } catch {
    // Session might not exist, that's OK
  }
  return NextResponse.json({ ok: true });
}

export async function cleanupExpiredSessions() {
  try {
    await db.chatSession.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  } catch (e) {
    console.error("Cleanup failed:", e);
  }
}
