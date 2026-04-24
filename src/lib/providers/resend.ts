import type { ProviderModule, EmailMessage, SendResult, WebhookPayload } from "./types";

/**
 * Resend — https://resend.com/docs
 * Free: 100/day, 3,000/month. Transactional-leaning.
 */
export const resend: ProviderModule = {
  kind: "resend",
  displayName: "Resend",

  async validateConnection(config) {
    if (!config.apiKey) return { ok: false, error: "Missing RESEND_API_KEY" };
    try {
      const res = await fetch("https://api.resend.com/domains", {
        headers: { authorization: `Bearer ${config.apiKey}` },
      });
      if (!res.ok) return { ok: false, error: `Resend /domains → ${res.status}` };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Network error" };
    }
  },

  async getQuota() {
    return { perDay: 100, perMonth: 3000, burstCapacity: 100 };
  },

  async sendEmail(config, msg: EmailMessage): Promise<SendResult> {
    if (!config.apiKey) return { ok: false, status: "FAILED", errorMessage: "Missing API key" };
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          authorization: `Bearer ${config.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: msg.fromName ? `${msg.fromName} <${msg.from}>` : msg.from,
          to: [msg.to],
          reply_to: msg.replyTo,
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
          headers: msg.headers,
          tags: msg.tags?.map((n) => ({ name: "tag", value: n })),
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
      return { ok: true, status: "SENT", providerMessageId: (data as any)?.id };
    } catch (e: any) {
      return { ok: false, status: "DEFERRED", errorMessage: e?.message };
    }
  },

  async handleWebhook(_c, body): Promise<WebhookPayload> {
    const event: any = body;
    const typeMap: Record<string, WebhookPayload["events"][number]["type"]> = {
      "email.sent": "delivered",
      "email.delivered": "delivered",
      "email.bounced": "bounce",
      "email.complained": "complaint",
      "email.opened": "open",
      "email.clicked": "click",
      "email.unsubscribed": "unsubscribe",
      "email.delivery_delayed": "deferred",
    };
    return {
      raw: body,
      events: [{
        type: typeMap[event?.type] ?? "delivered",
        email: event?.data?.to?.[0],
        messageId: event?.data?.email_id,
        occurredAt: event?.created_at ? new Date(event.created_at) : undefined,
      }],
    };
  },

  supportsMarketing() { return true; },
  supportsTransactional() { return true; },
  supportsBulk() { return false; },
  requiresVerifiedDomain() { return true; },
};
