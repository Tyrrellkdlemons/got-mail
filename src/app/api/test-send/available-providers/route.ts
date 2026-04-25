import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Returns which providers have credentials configured server-side and any known
 * health/account state (suspended / sandbox-only / etc) so the UI can:
 *  - skip the API-key paste step for ready providers
 *  - clearly mark down/suspended providers
 *  - point the user at self-hosted OSS options
 *
 * SECURITY: never returns the actual key value — only a boolean per provider.
 */

type ProviderState = {
  available: boolean;
  from: string;
  status?: "ok" | "suspended" | "sandbox" | "self-hosted-needed";
  note?: string;
};

export async function GET() {
  const env = process.env;

  const providers: Record<string, ProviderState> = {
    brevo: {
      available: !!env.BREVO_API_KEY,
      from: "BREVO_API_KEY",
      status: "suspended",
      note: "Brevo account is suspended pending review. Support ticket #5332419 open. Use another provider in the meantime.",
    },
    gmail: {
      available: !!(env.GMAIL_USER && env.GMAIL_APP_PASSWORD),
      from: "GMAIL_USER + GMAIL_APP_PASSWORD",
      status: "ok",
      note: "Gmail SMTP — direct delivery to any inbox via your Google account. 500/day free.",
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
      status: "sandbox",
      note: "API token works against the testing sandbox only. Live sending requires verified domain.",
    },
    zeptomail: {
      available: !!env.ZEPTOMAIL_API_KEY,
      from: "ZEPTOMAIL_API_KEY",
    },
    smtp: {
      available: !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS),
      from: "SMTP_HOST + SMTP_USER + SMTP_PASS",
      status: env.SMTP_HOST?.includes("sandbox.mailtrap") ? "sandbox" : "ok",
      note: env.SMTP_HOST?.includes("sandbox.mailtrap")
        ? "Currently configured for Mailtrap sandbox — captures messages, doesn't deliver."
        : "Generic SMTP fallback.",
    },
    // Self-hosted OSS — available if user supplies a base URL.
    postal: {
      available: !!(env.POSTAL_BASE_URL && env.POSTAL_API_KEY),
      from: "POSTAL_BASE_URL + POSTAL_API_KEY",
      status: "self-hosted-needed",
      note: "Postal — fully open-source, MIT license. Self-host or use a managed instance, then set POSTAL_BASE_URL + POSTAL_API_KEY.",
    },
    listmonk: {
      available: !!(env.LISTMONK_BASE_URL && env.LISTMONK_USERNAME && env.LISTMONK_PASSWORD),
      from: "LISTMONK_BASE_URL + LISTMONK_USERNAME + LISTMONK_PASSWORD",
      status: "self-hosted-needed",
      note: "listmonk — AGPL-3.0, single-binary newsletter platform. Excellent for bulk sends.",
    },
    mautic: {
      available: !!(env.MAUTIC_BASE_URL && env.MAUTIC_USERNAME && env.MAUTIC_PASSWORD),
      from: "MAUTIC_BASE_URL + MAUTIC_USERNAME + MAUTIC_PASSWORD",
      status: "self-hosted-needed",
      note: "Mautic — GPL marketing-automation platform with deep CRM integration.",
    },
  };

  // Sensible default From email: prefer Gmail user if configured, then SMTP_FROM_EMAIL.
  const fromEmailDefault =
    env.GMAIL_USER ||
    env.SMTP_FROM_EMAIL ||
    "";
  const fromNameDefault = env.SMTP_FROM_NAME || "Got Mail";

  return NextResponse.json({
    ok: true,
    providers,
    fromEmailDefault,
    fromNameDefault,
  });
}
