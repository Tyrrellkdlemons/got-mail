// RFC 2369 + RFC 8058 List-Unsubscribe + one-click unsubscribe support.
// Adds two headers to every send so Gmail/Yahoo native "Unsubscribe" buttons work.

import crypto from "node:crypto";

const SECRET_ENV = "UNSUBSCRIBE_SECRET";

function hmac(payload: string) {
  const secret = process.env[SECRET_ENV];
  if (!secret) throw new Error(`Set ${SECRET_ENV} (32+ random bytes) in env.`);
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export type UnsubToken = {
  email: string;
  campaignId?: string;
  userId: string;     // owner of the campaign
  exp: number;        // unix seconds
};

export function makeToken(t: UnsubToken): string {
  const body = Buffer.from(JSON.stringify(t)).toString("base64url");
  const sig = hmac(body);
  return `${body}.${sig}`;
}

export function parseToken(tok: string): UnsubToken | null {
  const [body, sig] = tok.split(".");
  if (!body || !sig) return null;
  if (sig !== hmac(body)) return null;
  try {
    const t = JSON.parse(Buffer.from(body, "base64url").toString()) as UnsubToken;
    if (t.exp && t.exp * 1000 < Date.now()) return null;
    return t;
  } catch {
    return null;
  }
}

/**
 * Headers to add to every outgoing message. siteUrl = e.g. "https://gotmail.netlify.app"
 */
export function listUnsubHeaders(opts: {
  siteUrl: string;
  email: string;
  userId: string;
  campaignId?: string;
}): Record<string, string> {
  const tok = makeToken({
    email: opts.email,
    userId: opts.userId,
    campaignId: opts.campaignId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 90, // 90 days
  });
  const url = `${opts.siteUrl.replace(/\/$/, "")}/api/unsubscribe?t=${tok}`;
  return {
    // RFC 2369: clickable link AND mailto
    "List-Unsubscribe": `<${url}>, <mailto:unsubscribe@${new URL(opts.siteUrl).hostname}?subject=unsubscribe&body=${encodeURIComponent(tok)}>`,
    // RFC 8058: declares one-click POST works
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
