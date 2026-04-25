import type { ProviderModule, EmailMessage, SendResult, WebhookPayload } from "./types";

/**
 * Mailtrap — https://api-docs.mailtrap.io/docs/mailtrap-api-docs/
 * Free: 1,000/month for production sending; also has a sandbox inbox for dev.
 */
export const mailtrap: ProviderModule = {
  kind: "mailtrap",
  displayName: "Mailtrap",

  async validateConnection(config) {
    if (!config.apiKey) return { ok: false, error: "Missing MAILTRAP_API_TOKEN" };
    try {
      const res = await fetch("https://send.api.mailtrap.io/api/accounts", {
        headers: { authorization: `Bearer ${config.apiKey}` },
      });
      // Some Mailtrap account types restrict /accounts but allow send. Treat 401/403 as invalid token,
      // 404 as still-valid token but missing scope (we accept it).
      if (res.status === 401 || res.status === 403) return { ok: false, error: `Mailtrap → ${res.status}` };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Network error" };
    }
  },

  async getQuota() {
    return { perMonth: 1000, burstCapacity: 35 };
  },

  async sendEmail(config, msg: EmailMessage): Promise<SendResult> {
    if (!config.apiKey) return { ok: false, status: "FAILED", errorMessage: "Missing API key" };
    try {
      const res = await fetch("https://send.api.mailtrap.io/api/send", {
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
          headers: msg.headers,
          category: msg.tags?.[0],
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return {
          ok: false,
          status: res.status >= 500 || res.status === 429 ? "DEFERRED" : "FAILED",
          errorCode: String(res.status),
          errorMessage: (err as any)?.errors?.join?.("; ") ?? `HTTP ${res.status}`,
        };
      }
      const data = await res.json().catch(() => ({} as any));
      return { ok: true, status: "SENT", providerMessageId: (data as any)?.message_ids?.[0] };
    } catch (e: any) {
      return { ok: false, status: "DEFERRED", errorMessage: e?.message };
    }
  },

  async handleWebhook(_c, body): Promise<WebhookPayload> {
    const event: any = body;
    const events = Array.isArray(event?.events) ? event.events : [event];
    const typeMap: Record<string, WebhookPayload["events"][number]["type"]> = {
      delivery: "delivered",
      bounce: "bounce",
      reject: "bounce",
      spam: "complaint",
      unsubscribe: "unsubscribe",
      open: "open",
      click: "click",
      soft_bounce: "deferred",
    };
    return {
      raw: body,
      events: events.map((e: any) => ({
        type: typeMap[e?.event] ?? "delivered",
        email: e?.email,
        messageId: e?.message_id,
        occurredAt: e?.timestamp ? new Date(Number(e.timestamp) * 1000) : undefined,
      })),
    };
  },

  supportsMarketing() { return true; },
  supportsTransactional() { return true; },
  supportsBulk() { return false; },
  requiresVerifiedDomain() { return true; },
};
