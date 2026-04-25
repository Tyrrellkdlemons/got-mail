import type { ProviderModule, EmailMessage, SendResult, WebhookPayload } from "./types";

/**
 * MailerSend — https://developers.mailersend.com
 * Free: 3,000/month.
 */
export const mailersend: ProviderModule = {
  kind: "mailersend",
  displayName: "MailerSend",

  async validateConnection(config) {
    if (!config.apiKey) return { ok: false, error: "Missing MAILERSEND_API_KEY" };
    try {
      const res = await fetch("https://api.mailersend.com/v1/me", {
        headers: { authorization: `Bearer ${config.apiKey}` },
      });
      if (!res.ok) return { ok: false, error: `MailerSend /me → ${res.status}` };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Network error" };
    }
  },

  async getQuota() {
    return { perMonth: 3000, burstCapacity: 100 };
  },

  async sendEmail(config, msg: EmailMessage): Promise<SendResult> {
    if (!config.apiKey) return { ok: false, status: "FAILED", errorMessage: "Missing API key" };
    try {
      const res = await fetch("https://api.mailersend.com/v1/email", {
        method: "POST",
        headers: {
          authorization: `Bearer ${config.apiKey}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          from: { email: msg.from, name: msg.fromName },
          to: [{ email: msg.to, name: msg.toName }],
          reply_to: msg.replyTo ? { email: msg.replyTo } : undefined,
          subject: msg.subject,
          html: msg.html,
          text: msg.text,
          headers: msg.headers && Object.entries(msg.headers).map(([name, value]) => ({ name, value })),
          tags: msg.tags,
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
      const messageId = res.headers.get("x-message-id") ?? undefined;
      return { ok: true, status: "SENT", providerMessageId: messageId };
    } catch (e: any) {
      return { ok: false, status: "DEFERRED", errorMessage: e?.message };
    }
  },

  async handleWebhook(_c, body): Promise<WebhookPayload> {
    const event: any = body;
    const typeMap: Record<string, WebhookPayload["events"][number]["type"]> = {
      "activity.delivered": "delivered",
      "activity.hard_bounced": "bounce",
      "activity.soft_bounced": "bounce",
      "activity.spam_complaint": "complaint",
      "activity.unsubscribed": "unsubscribe",
      "activity.opened": "open",
      "activity.clicked": "click",
    };
    return {
      raw: body,
      events: [{
        type: typeMap[event?.type] ?? "delivered",
        email: event?.data?.email?.recipient?.email,
        messageId: event?.data?.email?.message?.id,
        occurredAt: event?.created_at ? new Date(event.created_at) : undefined,
      }],
    };
  },

  supportsMarketing() { return true; },
  supportsTransactional() { return true; },
  supportsBulk() { return true; },
  requiresVerifiedDomain() { return true; },
};
