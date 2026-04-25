import type { ProviderModule, EmailMessage, SendResult, WebhookPayload } from "./types";
import nodemailer from "nodemailer";

/**
 * Generic SMTP provider (also used by Gmail/Workspace/Outlook/Zoho/custom business email).
 * Limits are enforced by the sending engine based on the configured identity, not this module.
 *
 * Connection caching: reuse a single pooled transport per SMTP config string within a process.
 * This is critical for free tiers (Mailtrap sandbox) that rate-limit connection establishment
 * separately from message rate. Without caching every sendEmail() call opens a new connection
 * and trips per-second connection limits.
 */
const transportCache = new Map<string, ReturnType<typeof nodemailer.createTransport>>();

export const smtp: ProviderModule = {
  kind: "smtp",
  displayName: "SMTP",

  async validateConnection(config) {
    if (!config.smtp) return { ok: false, error: "Missing SMTP config" };
    try {
      const t = getOrBuildTransport(config.smtp);
      await t.verify();
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message };
    }
  },

  async getQuota() {
    // SMTP limits depend on the provider behind it. The sending engine reads
    // SendingIdentity.dailyLimit / hourlyLimit instead.
    return { perDay: null, perHour: null };
  },

  async sendEmail(config, msg: EmailMessage): Promise<SendResult> {
    if (!config.smtp) return { ok: false, status: "FAILED", errorMessage: "Missing SMTP config" };
    try {
      const t = getOrBuildTransport(config.smtp);
      const info = await t.sendMail({
        from: msg.fromName ? `${msg.fromName} <${msg.from}>` : msg.from,
        to: msg.toName ? `${msg.toName} <${msg.to}>` : msg.to,
        replyTo: msg.replyTo,
        subject: msg.subject,
        html: msg.html,
        text: msg.text,
        headers: msg.headers,
      });
      return { ok: true, status: "SENT", providerMessageId: info.messageId };
    } catch (e: any) {
      const transient = /ETIMEDOUT|ECONNRESET|ECONNREFUSED|4\d\d/.test(e?.message ?? "");
      return {
        ok: false,
        status: transient ? "DEFERRED" : "FAILED",
        errorMessage: e?.message,
      };
    }
  },

  async handleWebhook(_c, body): Promise<WebhookPayload> {
    // SMTP has no webhooks — bounces come as NDR emails at the return-path mailbox.
    return { raw: body, events: [] };
  },

  supportsMarketing() { return true; },
  supportsTransactional() { return true; },
  supportsBulk() { return true; },
  requiresVerifiedDomain() { return true; },
};

function getOrBuildTransport(s: NonNullable<import("./types").ProviderConfig["smtp"]>) {
  const key = `${s.host}|${s.port}|${s.user}`;
  const cached = transportCache.get(key);
  if (cached) return cached;
  const t = nodemailer.createTransport({
    host: s.host,
    port: s.port,
    secure: s.useTls && s.port === 465,
    requireTLS: s.useTls,
    auth: { user: s.user, pass: s.pass },
    // Connection pooling: reuse one SMTP session across multiple sendMail() calls.
    // Mailtrap sandbox free tier rate-limits per-connection events; serializing through
    // a single pool prevents the 550 "Too many emails per second" error.
    pool: true,
    maxConnections: 1,
    maxMessages: 100,
    rateLimit: 1, // max 1 send per rateDelta
    rateDelta: 1500, // 1.5s spacing keeps us well below Mailtrap free tier limits
  });
  transportCache.set(key, t);
  return t;
}
