import type { ProviderModule, EmailMessage, SendResult, WebhookPayload } from "./types";

/**
 * Postal (self-hosted) — https://postalserver.io
 * User provides baseUrl + apiKey. Limits are self-defined.
 */
export const postal: ProviderModule = {
  kind: "postal",
  displayName: "Postal (self-hosted)",

  async validateConnection(config) {
    if (!config.apiKey || !config.baseUrl) return { ok: false, error: "Missing Postal baseUrl/apiKey" };
    try {
      const res = await fetch(`${config.baseUrl.replace(/\/$/, "")}/api/v1/send/ping`, {
        method: "POST",
        headers: {
          "X-Server-API-Key": config.apiKey,
          "content-type": "application/json",
        },
        body: "{}",
      });
      if (!res.ok) return { ok: false, error: `Postal ping → ${res.status}` };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message };
    }
  },

  async getQuota() {
    return {}; // self-hosted, no enforced cap
  },

  async sendEmail(config, msg: EmailMessage): Promise<SendResult> {
    if (!config.apiKey || !config.baseUrl) return { ok: false, status: "FAILED", errorMessage: "Missing config" };
    try {
      const res = await fetch(`${config.baseUrl.replace(/\/$/, "")}/api/v1/send/message`, {
        method: "POST",
        headers: {
          "X-Server-API-Key": config.apiKey,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          to: [msg.to],
          from: msg.fromName ? `${msg.fromName} <${msg.from}>` : msg.from,
          reply_to: msg.replyTo,
          subject: msg.subject,
          html_body: msg.html,
          plain_body: msg.text,
          headers: msg.headers,
          tag: msg.tags?.[0],
        }),
      });
      if (!res.ok) {
        return { ok: false, status: "DEFERRED", errorCode: String(res.status), errorMessage: `HTTP ${res.status}` };
      }
      const data = await res.json().catch(() => ({} as any));
      return { ok: true, status: "SENT", providerMessageId: (data as any)?.data?.message_id };
    } catch (e: any) {
      return { ok: false, status: "DEFERRED", errorMessage: e?.message };
    }
  },

  async handleWebhook(_c, body): Promise<WebhookPayload> {
    const e: any = body;
    const typeMap: Record<string, WebhookPayload["events"][number]["type"]> = {
      MessageDelivered: "delivered",
      MessageBounced: "bounce",
      MessageLinkClicked: "click",
      MessageLoaded: "open",
      MessageUnsubscribed: "unsubscribe",
    };
    return { raw: body, events: [{ type: typeMap[e?.event] ?? "delivered", email: e?.payload?.message?.to }] };
  },

  supportsMarketing() { return true; },
  supportsTransactional() { return true; },
  supportsBulk() { return true; },
  requiresVerifiedDomain() { return true; },
};
