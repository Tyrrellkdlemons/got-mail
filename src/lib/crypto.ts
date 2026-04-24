import crypto from "crypto";

/**
 * Symmetric encryption for API keys + SMTP passwords at rest.
 * Uses AES-256-GCM with a 32-byte key from CREDENTIALS_ENCRYPTION_KEY (base64 or hex).
 * Falls back to a deterministic-but-weak key derived from DATABASE_URL if the env var is missing,
 * so we never crash — but produces a warning.
 */
function getKey(): Buffer {
  const envVal = process.env.CREDENTIALS_ENCRYPTION_KEY;
  if (envVal) {
    // try base64, then hex, then utf8
    const tryB64 = Buffer.from(envVal, "base64");
    if (tryB64.length === 32) return tryB64;
    const tryHex = Buffer.from(envVal, "hex");
    if (tryHex.length === 32) return tryHex;
    // last resort: hash it to 32 bytes
    return crypto.createHash("sha256").update(envVal).digest();
  }
  // Fallback — warn once
  if (typeof globalThis !== "undefined" && !(globalThis as any).__cryptoWarned) {
    console.warn("[got-mail] CREDENTIALS_ENCRYPTION_KEY missing — using derived fallback. Set the env var in production.");
    (globalThis as any).__cryptoWarned = true;
  }
  return crypto
    .createHash("sha256")
    .update(process.env.DATABASE_URL ?? "got-mail-dev-fallback")
    .digest();
}

export function encryptSecret(plain: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${enc.toString("base64")}`;
}

export function decryptSecret(cipherText: string): string {
  const key = getKey();
  const [version, ivB64, tagB64, encB64] = cipherText.split(":");
  if (version !== "v1") throw new Error("Unknown cipher version");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const enc = Buffer.from(encB64, "base64");
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(enc), decipher.final()]).toString("utf8");
}

/** Mask a secret for display: keep first 4 + last 2 chars. */
export function maskSecret(plain: string): string {
  if (!plain) return "";
  if (plain.length <= 6) return "••••";
  return `${plain.slice(0, 4)}…${plain.slice(-2)}`;
}
