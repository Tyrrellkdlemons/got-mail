import type { ProviderModule, EmailMessage, SendResult, WebhookPayload } from "./types";

/**
 * Postmark — https://postmarkapp.com/developer
 * Developer plan: 100/month. Transactional only.
 */
export const postmark: ProviderModule = {
  kind: "postmark",
  displayName: "Postmark",

  async validateConnection(config) {
    if (!config.apiKey) return { ok: false, error: "Missing POSTMARK_SERVER_TOKEN" };
    try {
      const res = await fetch("https://api.postmarkapp.com/server", {
        headers: { "X-Postmark-Server-Token": config.apiKey, accept: "application/json" },
      });
      if (!res.ok) return { ok: false, error: `Postmark /server → ${res.status}` };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message };
    }
  },

  async getQuota() {
    return { perMonth: 100 };
  },

  async sendEmail(config, msg: EmailMessage): Promise<SendResult> {
    if (!config.apiKey) return { ok: false, status: "FAILED", errorMessage: "Missing token" };
    try {
      const res = await fetch("https://api.postmarkapp.com/email", {
        method: "POST",
        headers: {
          "X-Postmark-Server-Token": config.apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          From: msg.fromName ? `${msg.fromName} <${msg.from}>` : msg.from,
          To: msg.to,
          ReplyTo: msg.replyTo,
          Subject: msg.subject,
          HtmlBody: msg.html,
          TextBody: msg.text,
          Headers: Object.entries(msg.headers ?? {}).map(([Name, Value]) => ({ Name, Value })),
          MessageStream: "outbound",
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
      const data = await res.json().catch(() => ({} as any));
      return { ok: true, status: "SENT", providerMessageId: (data as any)?.MessageID };
    } catch (e: any) {
      return { ok: false, status: "DEFERRED", errorMessage: e?.message };
    }
  },

  async handleWebhook(_c, body): Promise<WebhookPayload> {
    const event: any = body;
    const map: Record<string, WebhookPayload["events"][number]["type"]> = {
      Delivery: "delivered",
      Bounce: "bounce",
      SpamComplaint: "complaint",
      Open: "open",
      Click: "click",
      SubscriptionChange: "unsubscribe",
    };
    return {
      raw: body,
      events: [{
        type: map[event?.RecordType] ?? "delivered",
        email: event?.Recipient ?? event?.Email,
        messageId: event?.MessageID,
      }],
    };
  },

  supportsMarketing() { return false; },
  supportsTransactional() { return true; },
  supportsBulk() { return false; },
  requiresVerifiedDomain() { return true; },
};
