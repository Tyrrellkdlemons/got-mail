import type { ProviderModule, EmailMessage, SendResult, WebhookPayload } from "./types";

/**
 * Elastic Email — https://elasticemail.com/developers/api-documentation/rest-api
 * Free: 100/day forever. Cheap pay-as-go after.
 */
export const elasticemail: ProviderModule = {
  kind: "elasticemail",
  displayName: "Elastic Email",

  async validateConnection(config) {
    if (!config.apiKey) return { ok: false, error: "Missing ELASTICEMAIL_API_KEY" };
    try {
      const res = await fetch("https://api.elasticemail.com/v4/account/load", {
        headers: { "X-ElasticEmail-ApiKey": config.apiKey },
      });
      if (!res.ok) return { ok: false, error: `Elastic Email /account → ${res.status}` };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Network error" };
    }
  },

  async getQuota() {
    return { perDay: 100, burstCapacity: 100 };
  },

  async sendEmail(config, msg: EmailMessage): Promise<SendResult> {
    if (!config.apiKey) return { ok: false, status: "FAILED", errorMessage: "Missing API key" };
    try {
      const res = await fetch("https://api.elasticemail.com/v4/emails", {
        method: "POST",
        headers: {
          "X-ElasticEmail-ApiKey": config.apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          Recipients: [{ Email: msg.to, Fields: msg.toName ? { name: msg.toName } : undefined }],
          Content: {
            From: msg.fromName ? `${msg.fromName} <${msg.from}>` : msg.from,
            ReplyTo: msg.replyTo,
            Subject: msg.subject,
            Body: [
              { ContentType: "HTML", Content: msg.html, Charset: "utf-8" },
              { ContentType: "PlainText", Content: msg.text, Charset: "utf-8" },
            ],
            Headers: msg.headers,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.text().catch(() => "");
        return {
          ok: false,
          status: res.status >= 500 || res.status === 429 ? "DEFERRED" : "FAILED",
          errorCode: String(res.status),
          errorMessage: err || `HTTP ${res.status}`,
        };
      }
      const data = await res.json().catch(() => ({} as any));
      return { ok: true, status: "SENT", providerMessageId: (data as any)?.MessageID };
    } catch (e: any) {
      return { ok: false, status: "DEFERRED", errorMessage: e?.message };
    }
  },

  async handleWebhook(_c, body): Promise<WebhookPayload> {
    const event: any = body;
    const typeMap: Record<string, WebhookPayload["events"][number]["type"]> = {
      Sent: "delivered",
      Delivered: "delivered",
      Bounced: "bounce",
      AbuseReport: "complaint",
      Unsubscribed: "unsubscribe",
      Opened: "open",
      Clicked: "click",
    };
    return {
      raw: body,
      events: [{
        type: typeMap[event?.event] ?? "delivered",
        email: event?.to,
        messageId: event?.msgid,
        occurredAt: event?.date ? new Date(event.date) : undefined,
      }],
    };
  },

  supportsMarketing() { return true; },
  supportsTransactional() { return true; },
  supportsBulk() { return true; },
  requiresVerifiedDomain() { return false; },
};
