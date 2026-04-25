import { cookies } from "next/headers";
import crypto from "crypto";

/**
 * Lightweight admin auth for the hidden admin panel at /__admin.
 *
 * - Validates the user-provided token against process.env.ADMIN_TOKEN
 * - Sets/reads a signed HttpOnly cookie ("gm_admin") so the user doesn't have
 *   to re-paste the token on every page
 * - Cookie is signed with HMAC-SHA256 against ADMIN_TOKEN itself, so forgery
 *   requires knowing the token
 *
 * Not a full identity system — single shared admin secret.
 */

const COOKIE_NAME = "gm_admin";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 24h

function getSecret(): string | null {
  return process.env.ADMIN_TOKEN || null;
}

function sign(value: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

/** Return true if the supplied plain-text token matches ADMIN_TOKEN. */
export function verifyToken(token: string): boolean {
  const secret = getSecret();
  if (!secret) return false;
  if (token.length !== secret.length) return false;
  // Constant-time comparison to avoid timing attacks
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(secret));
}

/** Build the signed cookie value for the current ADMIN_TOKEN. */
export function buildCookieValue(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  // Body = expiry timestamp; signature proves the holder knew the secret.
  const expiresAt = Date.now() + COOKIE_MAX_AGE * 1000;
  const body = String(expiresAt);
  const sig = sign(body, secret);
  return `${body}.${sig}`;
}

/** Parse + verify the cookie value. Returns true iff cookie is valid + unexpired. */
export function verifyCookieValue(cookieValue: string | null | undefined): boolean {
  const secret = getSecret();
  if (!secret || !cookieValue) return false;
  const [body, sig] = cookieValue.split(".");
  if (!body || !sig) return false;
  const expected = sign(body, secret);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  const expiresAt = Number(body);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  return true;
}

/** Server-component-safe check: is the current request authenticated? */
export async function isAdminAuthed(): Promise<boolean> {
  const c = await cookies();
  return verifyCookieValue(c.get(COOKIE_NAME)?.value);
}

/** Used by the auth route handler to log in. */
export function adminCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  };
}

export { COOKIE_NAME };
