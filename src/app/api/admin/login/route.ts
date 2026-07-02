import { NextRequest, NextResponse } from "next/server";
import { checkAdminCreds, isAdminEmail, setAdminCookie } from "@/lib/auth";

async function verifyFirebaseEmail(idToken: string): Promise<string | null> {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    return null;
  }
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  const email = data.users?.[0]?.email;
  return typeof email === "string" ? email : null;
}

export async function POST(req: NextRequest) {
  const { email, password, idToken } = await req.json();

  if (idToken) {
    const firebaseEmail = await verifyFirebaseEmail(idToken);
    if (!firebaseEmail || !isAdminEmail(firebaseEmail)) {
      return NextResponse.json(
        { error: "Access denied. Please sign in with an authorized admin Google account." },
        { status: 401 }
      );
    }
    await setAdminCookie();
    return NextResponse.json({ ok: true });
  }

  if (!checkAdminCreds(email || "", password || "")) {
    return NextResponse.json(
      { error: "Access denied. Only authorized admins can log in." },
      { status: 401 }
    );
  }
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}
