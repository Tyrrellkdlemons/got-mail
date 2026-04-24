import type { ProviderModule, ProviderConfig, EmailMessage, SendResult, Quota, WebhookPayload } from "./types";

/**
 * Brevo (ex-Sendinblue) — https://developers.brevo.com/
 * Free plan: 300 emails/day. Respect it.
 */
export const brevo: ProviderModule = {
  kind: "brevo",
  displayName: "Brevo",

  async validateConnection(config) {
    if (!config.apiKey) return { ok: false, error: "Missing BREVO_API_KEY" };
    try {
      const res = await fetch("https://api.brevo.com/v3/account", {
        headers: { "api-key": config.apiKey, accept: "application/json" },
      });
      if (!res.ok) return { ok: false, error: `Brevo /account → ${res.status}` };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message ?? "Network error" };
    }
  },

  async getQuota(config) {
    // Brevo's free plan is 300/day. In practice call /account to get remaining credits.
    try {
      const res = await fetch("https://api.brevo.com/v3/account", {
        headers: { "api-key": config.apiKey ?? "" },
      });
      const data = await res.json().catch(() => ({}));
      // data.plan[*].creditsType === "sendLimit" gives credits when available
      return {
        perDay: 300,
        burstCapacity: 300,
        sentToday: 0,
        resetsAt: nextMidnightUtc(),
      };
    } catch {
      return { perDay: 300 };
    }
  },

  async sendEmail(config, msg: EmailMessage): Promise<SendResult> {
    if (!config.apiKey) {
      return { ok: false, status: "FAILED", errorMessage: "Missing API key" };
    }
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": config.apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({
          sender: { email: msg.from, name: msg.fromName },
          to: [{ email: msg.to, name: msg.toName }],
          replyTo: msg.replyTo ? { email: msg.replyTo } : undefined,
          subject: msg.subject,
          htmlContent: msg.html,
          textContent: msg.text,
          headers: msg.headers,
          tags: msg.tags,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return {
          ok: false,
          status: res.status >= 500 || res.status === 429 ? "DEFERRED" : "FAILED",
          errorCode: String(res.status),
          errorMessage: err?.message ?? `HTTP ${res.status}`,
        };
      }
      const data = await res.json().catch(() => ({} as any));
      return { ok: true, status: "SENT", providerMessageId: data?.messageId };
    } catch (e: any) {
      return { ok: false, status: "DEFERRED", errorMessage: e?.message ?? "Network error" };
    }
  },

  async handleWebhook(_config, body): Promise<WebhookPayload> {
    const events = Array.isArray(body) ? body : [body];
    return {
      raw: body,
      events: events.map((e: any) => ({
        type: mapBrevoEvent(e?.event),
        email: e?.email,
        messageId: e?.["message-id"],
        reason: e?.reason,
        occurredAt: e?.ts ? new Date(Number(e.ts) * 1000) : undefined,
      })),
    };
  },

  supportsMarketing() { return true; },
  supportsTransactional() { return true; },
  supportsBulk() { return true; },
  requiresVerifiedDomain() { return false; },
};

function mapBrevoEvent(e: string): WebhookPayload["events"][number]["type"] {
  switch (e) {
    case "delivered": return "delivered";
    case "soft_bounce":
    case "hard_bounce": return "bounce";
    case "spam": return "complaint";
    case "opened": return "open";
    case "click": return "click";
    case "unsubscribed": return "unsubscribe";
    case "deferred": return "deferred";
    default: return "delivered";
  }
}

function nextMidnightUtc() {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d;
}
