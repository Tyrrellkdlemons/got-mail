// All adapters in one file for easy import. Each is independently tree-shakeable.
import type { ProviderAdapter, SendArgs, ProviderName } from "./types";

const isQuota429 = (err: unknown) => /(\b429\b|quota|rate limit|too many)/i.test(String(err));

// ----- Resend -----
export const resend: ProviderAdapter = {
  name: "RESEND",
  async validate(apiKey) {
    const r = await fetch("https://api.resend.com/api-keys", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!r.ok) throw new Error(`Resend validate ${r.status}: ${await r.text()}`);
    return { ok: true, account: await r.json() };
  },
  async send(apiKey, a: SendArgs) {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: a.from.name ? `${a.from.name} <${a.from.email}>` : a.from.email,
        to: a.to.map(t => t.email),
        cc: a.cc?.map(t => t.email),
        bcc: a.bcc?.map(t => t.email),
        reply_to: a.replyTo?.email,
        subject: a.subject,
        html: a.html,
        text: a.text,
        headers: a.headers,
      }),
    });
    if (!r.ok) throw new Error(`Resend send ${r.status}: ${await r.text()}`);
    const { id } = (await r.json()) as { id: string };
    return { id, provider: "RESEND" };
  },
  isQuotaError: isQuota429,
};

// ----- Brevo (Sendinblue) -----
export const brevo: ProviderAdapter = {
  name: "BREVO",
  async validate(apiKey) {
    const r = await fetch("https://api.brevo.com/v3/account", {
      headers: { "api-key": apiKey, accept: "application/json" },
    });
    if (!r.ok) throw new Error(`Brevo validate ${r.status}: ${await r.text()}`);
    return { ok: true, account: await r.json() };
  },
  async send(apiKey, a: SendArgs) {
    const r = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: { name: a.from.name, email: a.from.email },
        to: a.to,
        cc: a.cc,
        bcc: a.bcc,
        replyTo: a.replyTo,
        subject: a.subject,
        htmlContent: a.html,
        textContent: a.text,
        headers: a.headers,
      }),
    });
    if (!r.ok) throw new Error(`Brevo send ${r.status}: ${await r.text()}`);
    const j = (await r.json()) as { messageId: string };
    return { id: j.messageId, provider: "BREVO" };
  },
  isQuotaError: isQuota429,
};

// ----- SendGrid -----
export const sendgrid: ProviderAdapter = {
  name: "SENDGRID",
  async validate(apiKey) {
    const r = await fetch("https://api.sendgrid.com/v3/scopes", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!r.ok) throw new Error(`SendGrid validate ${r.status}: ${await r.text()}`);
    return { ok: true, account: await r.json() };
  },
  async send(apiKey, a: SendArgs) {
    const r = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: a.from.email, name: a.from.name },
        reply_to: a.replyTo ? { email: a.replyTo.email, name: a.replyTo.name } : undefined,
        personalizations: [{ to: a.to, cc: a.cc, bcc: a.bcc }],
        subject: a.subject,
        content: [
          a.text && { type: "text/plain", value: a.text },
          a.html && { type: "text/html", value: a.html },
        ].filter(Boolean),
        headers: a.headers,
      }),
    });
    if (!r.ok) throw new Error(`SendGrid send ${r.status}: ${await r.text()}`);
    return { id: r.headers.get("x-message-id") ?? "", provider: "SENDGRID" };
  },
  isQuotaError: isQuota429,
};

// ----- MailerSend -----
export const mailersend: ProviderAdapter = {
  name: "MAILERSEND",
  async validate(apiKey) {
    const r = await fetch("https://api.mailersend.com/v1/me", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!r.ok) throw new Error(`MailerSend validate ${r.status}: ${await r.text()}`);
    return { ok: true, account: await r.json() };
  },
  async send(apiKey, a: SendArgs) {
    const r = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: { email: a.from.email, name: a.from.name },
        to: a.to,
        cc: a.cc,
        bcc: a.bcc,
        reply_to: a.replyTo,
        subject: a.subject,
        html: a.html,
        text: a.text,
      }),
    });
    if (!r.ok) throw new Error(`MailerSend send ${r.status}: ${await r.text()}`);
    return {
      id: r.headers.get("x-message-id") ?? "",
      provider: "MAILERSEND",
    };
  },
  isQuotaError: isQuota429,
};

// ----- Mailjet (apiKey stored as "publicKey:secretKey") -----
export const mailjet: ProviderAdapter = {
  name: "MAILJET",
  async validate(apiKeyAndSecret) {
    const [k, s] = apiKeyAndSecret.split(":");
    if (!k || !s) throw new Error("Mailjet expects 'publicKey:secretKey'");
    const auth = "Basic " + Buffer.from(`${k}:${s}`).toString("base64");
    const r = await fetch("https://api.mailjet.com/v3/REST/sender", {
      headers: { Authorization: auth },
    });
    if (!r.ok) throw new Error(`Mailjet validate ${r.status}: ${await r.text()}`);
    return { ok: true };
  },
  async send(apiKeyAndSecret, a: SendArgs) {
    const [k, s] = apiKeyAndSecret.split(":");
    const auth = "Basic " + Buffer.from(`${k}:${s}`).toString("base64");
    const r = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify({
        Messages: [
          {
            From: { Email: a.from.email, Name: a.from.name },
            To: a.to.map(t => ({ Email: t.email, Name: t.name })),
            Cc: a.cc?.map(t => ({ Email: t.email, Name: t.name })),
            Bcc: a.bcc?.map(t => ({ Email: t.email, Name: t.name })),
            ReplyTo: a.replyTo ? { Email: a.replyTo.email, Name: a.replyTo.name } : undefined,
            Subject: a.subject,
            HTMLPart: a.html,
            TextPart: a.text,
            Headers: a.headers,
          },
        ],
      }),
    });
    if (!r.ok) throw new Error(`Mailjet send ${r.status}: ${await r.text()}`);
    const j = (await r.json()) as any;
    return { id: String(j.Messages?.[0]?.To?.[0]?.MessageID ?? ""), provider: "MAILJET" };
  },
  isQuotaError: isQuota429,
};

// ----- Registry -----
export const PROVIDERS: Partial<Record<ProviderName, ProviderAdapter>> = {
  RESEND: resend,
  BREVO: brevo,
  SENDGRID: sendgrid,
  MAILERSEND: mailersend,
  MAILJET: mailjet,
};

export function getAdapter(name: ProviderName): ProviderAdapter {
  const a = PROVIDERS[name];
  if (!a) throw new Error(`No adapter registered for provider: ${name}`);
  return a;
}
