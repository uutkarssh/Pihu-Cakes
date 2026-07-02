import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { ADMIN_EMAILS, ADMIN_PASSWORD } from "./brand";

export const ADMIN_COOKIE = "pihu_admin";

// HMAC secret from env (fallback for dev only)
function getHmacSecret(): Buffer {
  const secret = process.env.ADMIN_COOKIE_SECRET || "pihu-cakes-dev-secret-change-in-prod";
  return Buffer.from(secret);
}

// Generate signed cookie value: timestamp.hmac_signature
export async function setAdminCookie() {
  const c = await cookies();
  const timestamp = Date.now().toString(36);
  const payload = `${timestamp}`;
  const signature = createHmac("sha256", getHmacSecret())
    .update(payload)
    .digest("hex")
    .slice(0, 32);
  c.set(ADMIN_COOKIE, `${payload}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminCookie() {
  const c = await cookies();
  c.delete(ADMIN_COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const c = await cookies();
  const val = c.get(ADMIN_COOKIE)?.value;
  if (!val) return false;

  const parts = val.split(".");
  if (parts.length !== 2) return false;

  const [payload, signature] = parts;

  // Verify HMAC signature
  const expected = createHmac("sha256", getHmacSecret())
    .update(payload)
    .digest("hex")
    .slice(0, 32);

  try {
    const isValid = timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
    if (!isValid) return false;

    // Check expiry (7 days max)
    const timestamp = parseInt(payload, 36);
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - timestamp > maxAge) return false;

    return true;
  } catch {
    return false;
  }
}

/**
 * Check admin credentials.
 * Only emails in ADMIN_EMAILS are allowed, and the shared password must match.
 */
export function isAdminEmail(email: string) {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

export function checkAdminCreds(email: string, password: string) {
  return isAdminEmail(email) && password === ADMIN_PASSWORD;
}