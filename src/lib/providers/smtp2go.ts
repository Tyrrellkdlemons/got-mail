import type { ProviderModule, EmailMessage, SendResult, WebhookPayload } from "./types";

/**
 * SMTP2GO — https://www.smtp2go.com/docs/api/
 * Free: 1,000/month, ~35/day. Generous IP pool.
 */
export const smtp2go: ProviderModule = {
  kind: "smtp2go",
  displayName: "SMTP2GO",

  async validateConnection(config) {
    if (!config.apiKey) return { ok: false, error: "Missing SMTP2GO_API_KEY" };
    try {
      const res = await fetch("https://api.smtp2go.com/v3/stats/email_summary", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ api_key: config.apiKey }),
      });
      if (!res.ok) return { ok: false, error: `SMTP2GO summary → ${res.status}` };
      const data = await res.json().catch(() => ({} as any));
      if (data?.data?.failures && data.data.failures.length > 0)
        return { ok: false, error: data.data.failures.join("; ") };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Network error" };
    }
  },

  async getQuota() {
    return { perDay: 35, perMonth: 1000 };
  },

  async sendEmail(config, msg: EmailMessage): Promise<SendResult> {
    if (!config.apiKey) return { ok: false, status: "FAILED", errorMessage: "Missing API key" };
    try {
      const res = await fetch("https://api.smtp2go.com/v3/email/send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          api_key: config.apiKey,
          to: [msg.toName ? `${msg.toName} <${msg.to}>` : msg.to],
          sender: msg.fromName ? `${msg.fromName} <${msg.from}>` : msg.from,
          reply_to: msg.replyTo,
          subject: msg.subject,
          html_body: msg.html,
          text_body: msg.text,
          custom_headers: msg.headers
            ? Object.entries(msg.headers).map(([header, value]) => ({ header, value }))
            : undefined,
        }),
      });
      const data = await res.json().catch(() => ({} as any));
      if (!res.ok || data?.data?.failed > 0) {
        return {
          ok: false,
          status: res.status >= 500 || res.status === 429 ? "DEFERRED" : "FAILED",
          errorCode: String(res.status),
          errorMessage: data?.data?.error ?? `HTTP ${res.status}`,
        };
      }
      return { ok: true, status: "SENT", providerMessageId: data?.data?.email_id };
    } catch (e: any) {
      return { ok: false, status: "DEFERRED", errorMessage: e?.message };
    }
  },

  async handleWebhook(_c, body): Promise<WebhookPayload> {
    const event: any = body;
    const typeMap: Record<string, WebhookPayload["events"][number]["type"]> = {
      delivered: "delivered",
      hardBounce: "bounce",
      softBounce: "bounce",
      bounce: "bounce",
      spam: "complaint",
      unsubscribe: "unsubscribe",
      open: "open",
      click: "click",
    };
    return {
      raw: body,
      events: [{
        type: typeMap[event?.event] ?? "delivered",
        email: event?.email,
        messageId: event?.email_id,
        reason: event?.reason,
        occurredAt: event?.timestamp ? new Date(Number(event.timestamp) * 1000) : undefined,
      }],
    };
  },

  supportsMarketing() { return true; },
  supportsTransactional() { return true; },
  supportsBulk() { return true; },
  requiresVerifiedDomain() { return false; },
};
