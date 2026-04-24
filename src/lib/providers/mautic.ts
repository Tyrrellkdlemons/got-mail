import type { ProviderModule, EmailMessage, SendResult, WebhookPayload } from "./types";

/**
 * Mautic (self-hosted) — https://docs.mautic.org
 * Uses Basic auth against the admin API.
 */
export const mautic: ProviderModule = {
  kind: "mautic",
  displayName: "Mautic (self-hosted)",

  async validateConnection(config) {
    if (!config.baseUrl || !config.apiKey || !config.apiSecret) return { ok: false, error: "Missing config" };
    try {
      const res = await fetch(`${config.baseUrl.replace(/\/$/, "")}/api/emails`, {
        headers: { authorization: basic(config.apiKey, config.apiSecret) },
      });
      if (!res.ok) return { ok: false, error: `Mautic /api/emails → ${res.status}` };
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e?.message };
    }
  },

  async getQuota() {
    return {}; // self-hosted
  },

  async sendEmail(_c, _m): Promise<SendResult> {
    // Mautic sends via campaigns/segments, not arbitrary one-off API calls.
    // Got Mail syncs contacts into Mautic segments and triggers campaigns there.
    return {
      ok: false,
      status: "FAILED",
      errorMessage: "Mautic sends through its own campaigns. Use Got Mail's Mautic sync instead.",
    };
  },

  async handleWebhook(_c, body): Promise<WebhookPayload> {
    return { raw: body, events: [] };
  },

  supportsMarketing() { return true; },
  supportsTransactional() { return false; },
  supportsBulk() { return true; },
  requiresVerifiedDomain() { return true; },
};

function basic(u: string, p: string) {
  return "Basic " + Buffer.from(`${u}:${p}`).toString("base64");
}
