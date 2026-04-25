import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";
import type { EmailMessage } from "@/lib/providers/types";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  provider: z.enum([
    "brevo",
    "mailjet",
    "resend",
    "postmark",
    "sendgrid",
    "mailersend",
    "smtp2go",
    "elasticemail",
    "mailtrap",
    "zeptomail",
    "smtp",
  ]),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  useServerKeys: z.boolean().optional(),
  fromEmail: z.string().email(),
  fromName: z.string().optional(),
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
  recipients: z
    .array(
      z.object({
        name: z.string().optional(),
        email: z.string().email(),
      })
    )
    .min(1)
    .max(5),
});

/** Resolve provider credentials from server env vars when useServerKeys is true. */
function resolveServerKeys(provider: string): { apiKey?: string; apiSecret?: string } {
  const env = process.env;
  switch (provider) {
    case "brevo":         return { apiKey: env.BREVO_API_KEY };
    case "mailjet":       return { apiKey: env.MAILJET_API_KEY, apiSecret: env.MAILJET_API_SECRET };
    case "resend":        return { apiKey: env.RESEND_API_KEY };
    case "postmark":      return { apiKey: env.POSTMARK_SERVER_TOKEN };
    case "sendgrid":      return { apiKey: env.SENDGRID_API_KEY };
    case "mailersend":    return { apiKey: env.MAILERSEND_API_KEY };
    case "smtp2go":       return { apiKey: env.SMTP2GO_API_KEY };
    case "elasticemail":  return { apiKey: env.ELASTICEMAIL_API_KEY };
    case "mailtrap":      return { apiKey: env.MAILTRAP_API_TOKEN };
    case "zeptomail":     return { apiKey: env.ZEPTOMAIL_API_KEY };
    case "smtp":          return { apiKey: env.SMTP_PASS, apiSecret: env.SMTP_USER };
    default:              return {};
  }
}

const FOOTER = `

---
This is a test send from Got Mail (https://got-mail.netlify.app).
Got Mail Test · please disregard if this was unexpected.
Unsubscribe: {{unsubscribe_url}}`;

function toHtml(text: string): string {
  // Very simple plain-text → HTML: paragraphs + line breaks + autolinked URLs.
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const linked = escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    '<a href="$1">$1</a>'
  );
  const withBreaks = linked.split(/\n{2,}/).map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`).join("");
  return `<!doctype html><html><body style="font-family:system-ui,sans-serif;line-height:1.5;color:#111;max-width:600px;margin:0 auto;padding:16px;">${withBreaks}</body></html>`;
}

function personalize(tpl: string, contact: { name?: string; email: string }) {
  const firstName = (contact.name ?? "").split(" ")[0] || "friend";
  return tpl
    .replace(/\{\{\s*first_name\s*\}\}/g, firstName)
    .replace(/\{\{\s*email\s*\}\}/g, contact.email)
    .replace(/\{\{\s*unsubscribe_url\s*\}\}/g, `https://got-mail.netlify.app/unsubscribe/test-${encodeURIComponent(contact.email)}`);
}

export async function POST(req: NextRequest) {
  let body: z.infer<typeof schema>;
  try {
    const json = await req.json();
    body = schema.parse(json);
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Invalid payload: " + (e?.message ?? String(e)) },
      { status: 400 }
    );
  }

  const provider = getProvider(body.provider);

  // Resolve credentials: prefer user-supplied, fall back to server env if requested.
  let apiKey = body.apiKey;
  let apiSecret = body.apiSecret;
  if (body.useServerKeys || !apiKey) {
    const fromEnv = resolveServerKeys(body.provider);
    apiKey = apiKey || fromEnv.apiKey;
    apiSecret = apiSecret || fromEnv.apiSecret;
  }
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: `No API key for provider "${body.provider}". Paste one or set the matching env var on the server.` },
      { status: 400 }
    );
  }

  // For SMTP, the provider module reads config.smtp.{host,port,user,pass,useTls}.
  const config: any = {
    apiKey,
    apiSecret,
    smtp:
      body.provider === "smtp"
        ? {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
            useTls: true,
          }
        : undefined,
  };

  // Validate the key first so we fail fast with a clean error
  const ping = await provider.validateConnection(config);
  if (!ping.ok) {
    return NextResponse.json(
      { ok: false, error: `Provider connection failed: ${ping.error ?? "unknown"}` },
      { status: 400 }
    );
  }

  const results: Array<{
    to: string;
    ok: boolean;
    status: string;
    providerMessageId?: string;
    errorMessage?: string;
  }> = [];

  // Throttle: Mailtrap sandbox free tier is 2 emails/sec but in practice we see rate-limit
  // errors below ~3s/email. 3.5s is generous and keeps a 5-recipient batch under 18s
  // (well within Netlify's 60s function maxDuration). Real providers like Brevo can
  // tolerate faster rates; this is the safe default.
  let firstIteration = true;
  for (const r of body.recipients) {
    if (!firstIteration) {
      await new Promise((res) => setTimeout(res, 3500));
    }
    firstIteration = false;
    const personalizedBody = personalize(body.body, r) + FOOTER.replace(/\{\{\s*unsubscribe_url\s*\}\}/g, `https://got-mail.netlify.app/unsubscribe/test-${encodeURIComponent(r.email)}`);
    const msg: EmailMessage = {
      to: r.email,
      toName: r.name,
      from: body.fromEmail,
      fromName: body.fromName,
      replyTo: body.fromEmail,
      subject: body.subject,
      html: toHtml(personalizedBody),
      text: personalizedBody,
      headers: {
        "List-Unsubscribe": `<https://got-mail.netlify.app/unsubscribe/test-${encodeURIComponent(r.email)}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        "X-Got-Mail-Test": "true",
      },
    };

    try {
      const res = await provider.sendEmail(config, msg);
      results.push({
        to: r.email,
        ok: res.ok,
        status: res.status,
        providerMessageId: res.providerMessageId,
        errorMessage: res.errorMessage,
      });
    } catch (e: any) {
      results.push({
        to: r.email,
        ok: false,
        status: "FAILED",
        errorMessage: e?.message ?? String(e),
      });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  return NextResponse.json({
    ok: true,
    provider: body.provider,
    sent,
    failed: results.length - sent,
    results,
  });
}
