import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getProvider } from "@/lib/providers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ ok: false, error: "Not authenticated" }, { status: 401 });
  }
  const { action } = await req.json().catch(() => ({}));
  switch (action) {
    case "reseed-sources":
      return reseedSources();
    case "wipe-test-sends":
      return wipeTestSends();
    case "send-self-test":
      return sendSelfTest();
    case "show-env":
      return showEnv();
    default:
      return NextResponse.json({ ok: false, error: `Unknown action: ${action}` }, { status: 400 });
  }
}

async function reseedSources() {
  // Upserts a few well-known catalog items as a smoke-test. Full reseed lives in prisma/seed.ts;
  // re-running it from a serverless function is too heavy. This is a sanity check that the DB
  // is reachable and writes work.
  try {
    const items = [
      { name: "Brevo", url: "https://www.brevo.com", category: "provider", freeLimit: "300/day", supportsSmtp: true, supportsApi: true, supportsTransactional: true, supportsMarketing: true, status: "verified" },
      { name: "Resend", url: "https://resend.com", category: "provider", freeLimit: "100/day, 3000/month", supportsSmtp: true, supportsApi: true, supportsTransactional: true, supportsMarketing: false, status: "verified" },
      { name: "Mailtrap Email Sending API", url: "https://mailtrap.io", category: "provider", freeLimit: "1000/month", supportsSmtp: true, supportsApi: true, supportsTransactional: true, supportsMarketing: false, status: "verified" },
    ];
    for (const it of items) {
      await prisma.sourceResearchItem.upsert({
        where: { name: it.name },
        update: it,
        create: it,
      });
    }
    return NextResponse.json({ ok: true, message: `Upserted ${items.length} catalog rows. Use SEED_DATABASE.bat for full 93-item reseed.` });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}

async function wipeTestSends() {
  try {
    const e = await prisma.emailEvent.deleteMany({});
    const s = await prisma.emailSend.deleteMany({});
    return NextResponse.json({ ok: true, message: `Deleted ${s.count} EmailSend rows and ${e.count} EmailEvent rows.` });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}

async function sendSelfTest() {
  const env = process.env;
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
    return NextResponse.json({ ok: false, error: "GMAIL_USER + GMAIL_APP_PASSWORD must be set." }, { status: 400 });
  }
  try {
    const provider = getProvider("gmail");
    const config: any = {
      smtp: {
        host: "smtp.gmail.com",
        port: 587,
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
        useTls: true,
      },
    };
    const res = await provider.sendEmail(config, {
      to: env.GMAIL_USER,
      from: env.GMAIL_USER,
      fromName: "Got Mail Admin",
      subject: "Got Mail self-test",
      html: "<p>Got Mail admin self-test — if you see this in your inbox the pipeline is healthy.</p>",
      text: "Got Mail admin self-test — if you see this in your inbox the pipeline is healthy.",
      headers: {
        "X-Got-Mail-Admin": "self-test",
      },
    });
    if (res.ok) {
      return NextResponse.json({ ok: true, message: `Self-test sent to ${env.GMAIL_USER}\nProvider message id: ${res.providerMessageId}` });
    }
    return NextResponse.json({ ok: false, error: res.errorMessage ?? "Send failed" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  }
}

function showEnv() {
  const env = process.env;
  const flags = [
    "DATABASE_URL",
    "ADMIN_TOKEN",
    "GMAIL_USER", "GMAIL_APP_PASSWORD",
    "BREVO_API_KEY", "RESEND_API_KEY", "MAILJET_API_KEY", "POSTMARK_SERVER_TOKEN",
    "SENDGRID_API_KEY", "MAILERSEND_API_KEY", "SMTP2GO_API_KEY", "ELASTICEMAIL_API_KEY",
    "MAILTRAP_API_TOKEN", "ZEPTOMAIL_API_KEY",
    "SMTP_HOST", "SMTP_USER", "SMTP_PASS", "SMTP_FROM_EMAIL",
    "POSTAL_BASE_URL", "POSTAL_API_KEY",
    "LISTMONK_BASE_URL", "LISTMONK_USERNAME", "LISTMONK_PASSWORD",
    "MAUTIC_BASE_URL", "MAUTIC_USERNAME", "MAUTIC_PASSWORD",
    "NEXTAUTH_SECRET", "CREDENTIALS_ENCRYPTION_KEY", "UNSUBSCRIBE_SECRET",
  ];
  const lines = flags.map((k) => `${k.padEnd(34, " ")}: ${env[k] ? "✓ set" : "✗ missing"}`);
  return NextResponse.json({ ok: true, message: lines.join("\n") });
}
