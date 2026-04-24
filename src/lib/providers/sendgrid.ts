import type { ProviderModule, EmailMessage, SendResult, WebhookPayload } from "./types";

/**
 * SendGrid — https://docs.sendgrid.com
 * Trial: 100/day for 60 days (NOT a permanent free tier).
 */
export const sendgrid: ProviderModule = {
  kind: "sendgrid",
  displayName: "SendGrid",

  async validateConnection(config) {
    if (!config.apiKey) return { ok: false, error: "Missing SENDGRID_API_KEY" };
    try {
      const res = await fetch("https://api.sendgrid.com/v3/user/profile", {
        headers: { authorization: `Bearer ${config.apiKey}` },
      });
      if (!res.ok) return { ok: false, error: `SendGrid /profile → ${res.status}` };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message };
    }
  },

  async getQuota() {
    return { perDay: 100 };
  },

  async sendEmail(config, msg: EmailMessage): Promise<SendResult> {
    if (!config.apiKey) return { ok: false, status: "FAILED", errorMessage: "Missing key" };
    try {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          authorization: `Bearer ${config.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: msg.to, name: msg.toName }],
              headers: msg.headers,
            },
          ],
          from: { email: msg.from, name: msg.fromName },
          reply_to: msg.replyTo ? { email: msg.replyTo } : undefined,
          subject: msg.subject,
          content: [
            { type: "text/plain", value: msg.text },
            { type: "text/html", value: msg.html },
          ],
        }),
      });
      if (!res.ok) {
        return {
          ok: false,
          status: res.status >= 500 || res.status === 429 ? "DEFERRED" : "FAILED",
          errorCode: String(res.status),
          errorMessage: `HTTP ${res.status}`,
        };
      }
      const messageId = res.headers.get("x-message-id") ?? undefined;
      return { ok: true, status: "SENT", providerMessageId: messageId };
    } catch (e: any) {
      return { ok: false, status: "DEFERRED", errorMessage: e?.message };
    }
  },

  async handleWebhook(_c, body): Promise<WebhookPayload> {
    const arr = Array.isArray(body) ? body : [body];
    return {
      raw: body,
      events: arr.map((e: any) => ({
        type: mapEvent(e?.event),
        email: e?.email,
        messageId: e?.sg_message_id,
        occurredAt: e?.timestamp ? new Date(e.timestamp * 1000) : undefined,
      })),
    };
  },

  supportsMarketing() { return true; },
  supportsTransactional() { return true; },
  supportsBulk() { return true; },
  requiresVerifiedDomain() { return true; },
};

function mapEvent(e: string): WebhookPayload["events"][number]["type"] {
  switch (e) {
    case "delivered": return "delivered";
    case "bounce":
    case "blocked": return "bounce";
    case "spamreport": return "complaint";
    case "open": return "open";
    case "click": return "click";
    case "unsubscribe":
    case "group_unsubscribe": return "unsubscribe";
    case "deferred": return "deferred";
    default: return "delivered";
  }
}
