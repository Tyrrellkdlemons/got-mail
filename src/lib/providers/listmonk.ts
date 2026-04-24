import type { ProviderModule, EmailMessage, SendResult, WebhookPayload } from "./types";

/**
 * listmonk (self-hosted) — https://listmonk.app
 * Uses HTTP Basic auth against the admin API. User provides baseUrl + username + password via config.apiKey (user) and config.apiSecret (pass).
 */
export const listmonk: ProviderModule = {
  kind: "listmonk",
  displayName: "listmonk (self-hosted)",

  async validateConnection(config) {
    if (!config.baseUrl || !config.apiKey || !config.apiSecret) return { ok: false, error: "Missing baseUrl/user/pass" };
    try {
      const res = await fetch(`${config.baseUrl.replace(/\/$/, "")}/api/health`, {
        headers: { authorization: basic(config.apiKey, config.apiSecret) },
      });
      if (!res.ok) return { ok: false, error: `listmonk /api/health → ${res.status}` };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message };
    }
  },

  async getQuota() {
    return {}; // self-hosted
  },

  async sendEmail(config, msg: EmailMessage): Promise<SendResult> {
    if (!config.baseUrl || !config.apiKey || !config.apiSecret) return { ok: false, status: "FAILED", errorMessage: "Missing config" };
    try {
      // listmonk has a transactional endpoint that requires a template_id; for arbitrary sends
      // the app should push content via templates. This is a simplified path.
      const res = await fetch(`${config.baseUrl.replace(/\/$/, "")}/api/tx`, {
        method: "POST",
        headers: {
          authorization: basic(config.apiKey, config.apiSecret),
          "content-type": "application/json",
        },
        body: JSON.stringify({
          subscriber_email: msg.to,
          template_id: 1, // default template; surface via UI
          data: { subject: msg.subject, html: msg.html, text: msg.text },
          content_type: "html",
        }),
      });
      if (!res.ok) return { ok: false, status: "DEFERRED", errorCode: String(res.status), errorMessage: `HTTP ${res.status}` };
      return { ok: true, status: "SENT" };
    } catch (e: any) {
      return { ok: false, status: "DEFERRED", errorMessage: e?.message };
    }
  },

  async handleWebhook(_c, body): Promise<WebhookPayload> {
    return { raw: body, events: [] };
  },

  supportsMarketing() { return true; },
  supportsTransactional() { return true; },
  supportsBulk() { return true; },
  requiresVerifiedDomain() { return true; },
};

function basic(u: string, p: string) {
  return "Basic " + Buffer.from(`${u}:${p}`).toString("base64");
}
