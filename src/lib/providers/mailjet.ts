import type { ProviderModule, EmailMessage, SendResult, WebhookPayload } from "./types";

/**
 * Mailjet — https://dev.mailjet.com/
 * Free: 6,000/month, 200/day. Uses Basic auth (apiKey:apiSecret).
 */
export const mailjet: ProviderModule = {
  kind: "mailjet",
  displayName: "Mailjet",

  async validateConnection(config) {
    if (!config.apiKey || !config.apiSecret) return { ok: false, error: "Missing Mailjet key/secret" };
    try {
      const res = await fetch("https://api.mailjet.com/v3/REST/sender", {
        headers: { authorization: basic(config.apiKey, config.apiSecret) },
      });
      if (!res.ok) return { ok: false, error: `Mailjet /sender → ${res.status}` };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Network error" };
    }
  },

  async getQuota() {
    return { perDay: 200, perMonth: 6000, burstCapacity: 100 };
  },

  async sendEmail(config, msg: EmailMessage): Promise<SendResult> {
    if (!config.apiKey || !config.apiSecret) return { ok: false, status: "FAILED", errorMessage: "Missing credentials" };
    try {
      const res = await fetch("https://api.mailjet.com/v3.1/send", {
        method: "POST",
        headers: {
          authorization: basic(config.apiKey, config.apiSecret),
          "content-type": "application/json",
        },
        body: JSON.stringify({
          Messages: [
            {
              From: { Email: msg.from, Name: msg.fromName },
              To: [{ Email: msg.to, Name: msg.toName }],
              ReplyTo: msg.replyTo ? { Email: msg.replyTo } : undefined,
              Subject: msg.subject,
              HTMLPart: msg.html,
              TextPart: msg.text,
              Headers: msg.headers,
              CustomID: msg.campaignId,
            },
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
      const data = await res.json().catch(() => ({} as any));
      const id = (data as any)?.Messages?.[0]?.To?.[0]?.MessageID;
      return { ok: true, status: "SENT", providerMessageId: id ? String(id) : undefined };
    } catch (e: any) {
      return { ok: false, status: "DEFERRED", errorMessage: e?.message };
    }
  },

  async handleWebhook(_c, body): Promise<WebhookPayload> {
    const events = Array.isArray(body) ? body : [body];
    return {
      raw: body,
      events: events.map((e: any) => ({
        type: mapEvent(e?.event),
        email: e?.email,
        messageId: e?.MessageID ? String(e.MessageID) : undefined,
        occurredAt: e?.time ? new Date(e.time * 1000) : undefined,
      })),
    };
  },

  supportsMarketing() { return true; },
  supportsTransactional() { return true; },
  supportsBulk() { return true; },
  requiresVerifiedDomain() { return true; },
};

function basic(u: string, p: string) {
  return "Basic " + Buffer.from(`${u}:${p}`).toString("base64");
}

function mapEvent(e: string): WebhookPayload["events"][number]["type"] {
  switch (e) {
    case "sent": return "delivered";
    case "open": return "open";
    case "click": return "click";
    case "bounce":
    case "blocked": return "bounce";
    case "spam": return "complaint";
    case "unsub": return "unsubscribe";
    default: return "delivered";
  }
}
