import { NextRequest, NextResponse } from "next/server";
import { getProvider } from "@/lib/providers";
import type { EmailMessage } from "@/lib/providers/types";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const schema = z.object({
  provider: z.enum(["brevo", "mailjet", "resend", "postmark", "sendgrid"]),
  apiKey: z.string().min(5),
  apiSecret: z.string().optional(),
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
  const config = {
    apiKey: body.apiKey,
    apiSecret: body.apiSecret,
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

  for (const r of body.recipients) {
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
