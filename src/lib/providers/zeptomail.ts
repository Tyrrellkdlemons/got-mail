import type { ProviderModule, EmailMessage, SendResult, WebhookPayload } from "./types";

/**
 * Zoho ZeptoMail — https://www.zoho.com/zeptomail/help/api/
 * Pricing: $2.50 per 10,000 transactional emails. Cheapest at scale.
 */
export const zeptomail: ProviderModule = {
  kind: "zeptomail",
  displayName: "Zoho ZeptoMail",

  async validateConnection(config) {
    if (!config.apiKey) return { ok: false, error: "Missing ZEPTOMAIL_API_KEY" };
    try {
      // No simple /me. Use a no-op send dry-run via their template list endpoint.
      const res = await fetch("https://api.zeptomail.com/v1.1/email/template", {
        headers: { authorization: `Zoho-enczapikey ${config.apiKey}` },
      });
      if (res.status === 401) return { ok: false, error: "Invalid ZeptoMail key (401)" };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Network error" };
    }
  },

  async getQuota() {
    return { perMonth: 999_999 };
  },

  async sendEmail(config, msg: EmailMessage): Promise<SendResult> {
    if (!config.apiKey) return { ok: false, status: "FAILED", errorMessage: "Missing API key" };
    try {
      const res = await fetch("https://api.zeptomail.com/v1.1/email", {
        method: "POST",
        headers: {
          authorization: `Zoho-enczapikey ${config.apiKey}`,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          from: { address: msg.from, name: msg.fromName },
          to: [{ email_address: { address: msg.to, name: msg.toName } }],
          reply_to: msg.replyTo ? [{ address: msg.replyTo }] : undefined,
          subject: msg.subject,
          htmlbody: msg.html,
          textbody: msg.text,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return {
          ok: false,
          status: res.status >= 500 || res.status === 429 ? "DEFERRED" : "FAILED",
          errorCode: String(res.status),
          errorMessage: (err as any)?.message ?? `HTTP ${res.status}`,
        };
      }
      const data = await res.json().catch(() => ({} as any));
      return { ok: true, status: "SENT", providerMessageId: (data as any)?.data?.[0]?.message_id };
    } catch (e: any) {
      return { ok: false, status: "DEFERRED", errorMessage: e?.message };
    }
  },

  async handleWebhook(_c, body): Promise<WebhookPayload> {
    const event: any = body;
    const typeMap: Record<string, WebhookPayload["events"][number]["type"]> = {
      delivered: "delivered",
      bounced: "bounce",
      "spam_complaint": "complaint",
      opened: "open",
      clicked: "click",
      unsubscribed: "unsubscribe",
    };
    return {
      raw: body,
      events: [{
        type: typeMap[event?.event_name] ?? "delivered",
        email: event?.email,
        messageId: event?.message_id,
        occurredAt: event?.event_time ? new Date(event.event_time) : undefined,
      }],
    };
  },

  supportsMarketing() { return false; },
  supportsTransactional() { return true; },
  supportsBulk() { return false; },
  requiresVerifiedDomain() { return true; },
};
