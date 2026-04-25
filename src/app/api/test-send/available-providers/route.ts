import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Returns which providers already have credentials in server env vars,
 * so the test-send / campaign UI can offer "use server keys" instead of
 * forcing the user to paste an API key for every test.
 *
 * SECURITY: never returns the actual key value — only a boolean per provider.
 */
export async function GET() {
  const env = process.env;

  const providers: Record<string, { available: boolean; from: string }> = {
    brevo: {
      available: !!env.BREVO_API_KEY,
      from: "BREVO_API_KEY",
    },
    mailjet: {
      available: !!(env.MAILJET_API_KEY && env.MAILJET_API_SECRET),
      from: "MAILJET_API_KEY + MAILJET_API_SECRET",
    },
    resend: {
      available: !!env.RESEND_API_KEY,
      from: "RESEND_API_KEY",
    },
    postmark: {
      available: !!env.POSTMARK_SERVER_TOKEN,
      from: "POSTMARK_SERVER_TOKEN",
    },
    sendgrid: {
      available: !!env.SENDGRID_API_KEY,
      from: "SENDGRID_API_KEY",
    },
    mailersend: {
      available: !!env.MAILERSEND_API_KEY,
      from: "MAILERSEND_API_KEY",
    },
    smtp2go: {
      available: !!env.SMTP2GO_API_KEY,
      from: "SMTP2GO_API_KEY",
    },
    elasticemail: {
      available: !!env.ELASTICEMAIL_API_KEY,
      from: "ELASTICEMAIL_API_KEY",
    },
    mailtrap: {
      available: !!env.MAILTRAP_API_TOKEN,
      from: "MAILTRAP_API_TOKEN",
    },
    zeptomail: {
      available: !!env.ZEPTOMAIL_API_KEY,
      from: "ZEPTOMAIL_API_KEY",
    },
    smtp: {
      available: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
      from: "SMTP_HOST + SMTP_USER + SMTP_PASS",
    },
  };

  const fromEmailDefault = env.SMTP_FROM_EMAIL || env.MAILTRAP_FROM_EMAIL || "";
  const fromNameDefault = env.SMTP_FROM_NAME || "Got Mail";

  return NextResponse.json({
    ok: true,
    providers,
    fromEmailDefault,
    fromNameDefault,
  });
}
