import type { ProviderModule, EmailMessage, SendResult, WebhookPayload } from "./types";
import nodemailer from "nodemailer";

/**
 * Generic SMTP provider (also used by Gmail/Workspace/Outlook/Zoho/custom business email).
 * Limits are enforced by the sending engine based on the configured identity, not this module.
 */
export const smtp: ProviderModule = {
  kind: "smtp",
  displayName: "SMTP",

  async validateConnection(config) {
    if (!config.smtp) return { ok: false, error: "Missing SMTP config" };
    try {
      const t = buildTransport(config.smtp);
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
      const t = buildTransport(config.smtp);
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

function buildTransport(s: NonNullable<import("./types").ProviderConfig["smtp"]>) {
  return nodemailer.createTransport({
    host: s.host,
    port: s.port,
    secure: s.useTls && s.port === 465,
    requireTLS: s.useTls,
    auth: { user: s.user, pass: s.pass },
  });
}
