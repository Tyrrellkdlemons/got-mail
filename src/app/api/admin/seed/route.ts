/**
 * POST /api/admin/seed?token=TOKEN   (also accepts GET for easy browser-hit)
 *
 * One-shot endpoint that pushes the schema + populates Neon.
 * Use when you can't or don't want to run `SEED_DATABASE.bat` locally
 * (e.g. Windows Defender blocks npm install).
 *
 * Protected by a shared token. Default is 'gotmail-seed-2026'.
 * Override by setting SEED_TOKEN in Netlify env vars.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { MIGRATION_SQL } from "@/lib/migration-sql";
import crypto from "crypto";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_TOKEN = "gotmail-seed-2026";

// Same seed payloads as prisma/seed.ts, inlined so this route is self-contained.
type Seed = {
  name: string;
  category: string;
  description?: string;
  officialUrl?: string;
  freeLimit?: string;
  dailyLimit?: number | null;
  monthlyLimit?: number | null;
  supportsSmtp?: boolean;
  supportsApi?: boolean;
  supportsMarketing?: boolean;
  supportsTransactional?: boolean;
  supportsWebhooks?: boolean;
  supportsBulk?: boolean;
  selfHosted?: boolean;
  license?: string;
  status?: string;
  riskLevel?: string;
  notes?: string;
};

const PROVIDERS: Seed[] = [
  { name: "Brevo", category: "provider", officialUrl: "https://www.brevo.com/pricing/", freeLimit: "300 emails/day", dailyLimit: 300, supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, supportsBulk: true, status: "verified" },
  { name: "Mailjet", category: "provider", officialUrl: "https://www.mailjet.com/pricing/", freeLimit: "6,000/month, 200/day", dailyLimit: 200, monthlyLimit: 6000, supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, supportsBulk: true, status: "verified" },
  { name: "Resend", category: "provider", officialUrl: "https://resend.com/pricing", freeLimit: "100/day, 3,000/month", dailyLimit: 100, monthlyLimit: 3000, supportsApi: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "Postmark", category: "provider", officialUrl: "https://postmarkapp.com/pricing", freeLimit: "100/month (dev plan)", monthlyLimit: 100, supportsSmtp: true, supportsApi: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "SendGrid", category: "provider", officialUrl: "https://sendgrid.com/en-us/pricing", freeLimit: "60-day trial, 100/day", dailyLimit: 100, supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, supportsBulk: true, status: "trial_only" },
  { name: "Mailgun Flex", category: "provider", officialUrl: "https://www.mailgun.com/pricing", freeLimit: "100/day (trial)", dailyLimit: 100, supportsSmtp: true, supportsApi: true, supportsTransactional: true, supportsWebhooks: true, status: "trial_only" },
  { name: "SMTP2GO", category: "provider", officialUrl: "https://www.smtp2go.com/pricing/", freeLimit: "1,000/month, 200/day", dailyLimit: 200, monthlyLimit: 1000, supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "Elastic Email", category: "provider", officialUrl: "https://elasticemail.com/pricing", freeLimit: "100/day", dailyLimit: 100, supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "Amazon SES", category: "provider", officialUrl: "https://aws.amazon.com/ses/", freeLimit: "62,000/month from EC2", supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, supportsBulk: true, status: "verified" },
  { name: "MailerSend", category: "provider", officialUrl: "https://www.mailersend.com/pricing", freeLimit: "3,000/month", monthlyLimit: 3000, supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "Mailtrap Email API", category: "provider", officialUrl: "https://mailtrap.io/pricing", freeLimit: "1,000/month", monthlyLimit: 1000, supportsSmtp: true, supportsApi: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "Sweego", category: "provider", officialUrl: "https://www.sweego.io", freeLimit: "500/day free", dailyLimit: 500, supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "Gmail / Google Workspace SMTP", category: "provider", officialUrl: "https://support.google.com/a/answer/166852", freeLimit: "~2,000/day Workspace, ~500/day free Gmail", dailyLimit: 2000, supportsSmtp: true, supportsTransactional: true, status: "verified" },
  { name: "Loops", category: "provider", officialUrl: "https://loops.so/pricing", freeLimit: "1,000 contacts free", supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "Courier", category: "provider", officialUrl: "https://www.courier.com/pricing/", freeLimit: "10,000 notifications/month", supportsApi: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
];

const OSS_NEWSLETTER: Seed[] = [
  { name: "listmonk", category: "oss_newsletter", description: "Self-hosted, high-performance newsletter & mailing list manager.", officialUrl: "https://listmonk.app", license: "AGPL", selfHosted: true, supportsBulk: true, supportsMarketing: true, status: "verified" },
  { name: "Mautic", category: "oss_newsletter", description: "Open-source marketing automation.", officialUrl: "https://www.mautic.org", license: "GPLv3", selfHosted: true, supportsBulk: true, supportsMarketing: true, status: "verified" },
  { name: "Keila", category: "oss_newsletter", description: "Modern newsletter tool in Elixir.", officialUrl: "https://www.keila.io", license: "MIT", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Plunk", category: "oss_newsletter", description: "Open-source email marketing platform.", officialUrl: "https://www.useplunk.com", license: "AGPL", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Mailcoach", category: "oss_newsletter", description: "Self-hosted mailing list + transactional.", officialUrl: "https://mailcoach.app", license: "MIT (core)", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Sendportal", category: "oss_newsletter", description: "Laravel-based email campaign manager.", officialUrl: "https://sendportal.io", license: "MIT", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "OpenEMM", category: "oss_newsletter", description: "Enterprise-grade OSS marketing suite.", officialUrl: "https://www.openemm.org", license: "AGPL", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "phpList", category: "oss_newsletter", description: "Classic OSS newsletter manager.", officialUrl: "https://www.phplist.org", license: "AGPL", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Mailtrain", category: "oss_newsletter", description: "Self-hosted newsletter app (Node.js).", officialUrl: "https://mailtrain.org", license: "GPLv3", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Ghost", category: "oss_newsletter", description: "Publishing + newsletter platform.", officialUrl: "https://ghost.org", license: "MIT", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Chaskiq", category: "oss_newsletter", description: "Messaging + email campaigns.", officialUrl: "https://chaskiq.io", license: "AGPL", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Novu", category: "oss_newsletter", description: "Open-source notification infrastructure.", officialUrl: "https://novu.co", license: "Apache-2.0", selfHosted: true, supportsTransactional: true, status: "verified" },
  { name: "Knock", category: "oss_newsletter", description: "Notifications-as-a-service.", officialUrl: "https://knock.app/pricing", status: "verified" },
  { name: "Buttondown", category: "oss_newsletter", description: "Minimalist newsletter platform.", officialUrl: "https://buttondown.email", status: "verified" },
];

const OSS_MAIL_SERVER: Seed[] = [
  { name: "Postal", category: "mail_server", description: "Open-source mail delivery platform.", officialUrl: "https://postalserver.io", license: "MIT", selfHosted: true, supportsSmtp: true, supportsApi: true, supportsWebhooks: true, status: "verified" },
  { name: "Docker Mailserver", category: "mail_server", description: "Production-ready stack.", officialUrl: "https://docker-mailserver.github.io", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Mailcow", category: "mail_server", description: "Dockerized mail server.", officialUrl: "https://mailcow.email", license: "GPLv3", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Mailu", category: "mail_server", description: "Dockerized mail server suite.", officialUrl: "https://mailu.io", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "iRedMail", category: "mail_server", description: "Full mail server installer.", officialUrl: "https://www.iredmail.org", license: "GPLv3", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Modoboa", category: "mail_server", description: "Mail hosting + UI.", officialUrl: "https://modoboa.org", license: "ISC", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Maddy", category: "mail_server", description: "Modular mail server in Go.", officialUrl: "https://maddy.email", license: "GPLv3", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Stalwart Mail Server", category: "mail_server", description: "Rust-based all-in-one mail server.", officialUrl: "https://stalw.art", license: "AGPL", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Haraka", category: "mail_server", description: "High-perf Node.js SMTP server.", officialUrl: "https://haraka.github.io", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "WildDuck", category: "mail_server", description: "Scalable IMAP/POP3 server.", officialUrl: "https://wildduck.email", license: "EUPL", selfHosted: true, status: "verified" },
  { name: "OpenSMTPD", category: "mail_server", description: "Minimal & secure OpenBSD SMTP daemon.", officialUrl: "https://www.opensmtpd.org", license: "ISC", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Exim", category: "mail_server", description: "Classic MTA.", officialUrl: "https://www.exim.org", license: "GPLv2", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Mailpit", category: "mail_server", description: "Local SMTP server + web UI for dev testing.", officialUrl: "https://github.com/axllent/mailpit", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "MailHog", category: "mail_server", description: "Classic dev-mode SMTP catcher.", officialUrl: "https://github.com/mailhog/MailHog", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "MailCatcher", category: "mail_server", description: "Ruby SMTP server that catches mail.", officialUrl: "https://mailcatcher.me", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "smtp4dev", category: "mail_server", description: ".NET dev SMTP server.", officialUrl: "https://github.com/rnwood/smtp4dev", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
];

const DNS_TOOLS: Seed[] = [
  { name: "MXToolbox", category: "dns_tool", description: "SPF/DKIM/DMARC/MX/blacklist lookups.", officialUrl: "https://mxtoolbox.com", status: "verified" },
  { name: "Google Admin Toolbox", category: "dns_tool", description: "CheckMX, Dig, Email Log Search.", officialUrl: "https://toolbox.googleapps.com", status: "verified" },
  { name: "dmarcian", category: "dns_tool", description: "DMARC record generator + monitoring.", officialUrl: "https://dmarcian.com", status: "verified" },
  { name: "Postmark DMARC Digests", category: "dns_tool", description: "Free DMARC aggregation.", officialUrl: "https://dmarc.postmarkapp.com", status: "verified" },
  { name: "Valimail Monitor", category: "dns_tool", description: "Free DMARC monitoring.", officialUrl: "https://monitor.valimail.com", status: "verified" },
  { name: "Learn DMARC", category: "dns_tool", description: "Interactive DMARC explainer.", officialUrl: "https://learndmarc.com", status: "verified" },
  { name: "DNS Checker", category: "dns_tool", description: "Global DNS propagation checker.", officialUrl: "https://dnschecker.org", status: "verified" },
  { name: "intoDNS", category: "dns_tool", description: "DNS record health.", officialUrl: "https://intodns.com", status: "verified" },
  { name: "DigWebInterface", category: "dns_tool", description: "Web-based dig tool.", officialUrl: "https://www.digwebinterface.com", status: "verified" },
  { name: "whatsmydns.net", category: "dns_tool", description: "Check DNS propagation globally.", officialUrl: "https://www.whatsmydns.net", status: "verified" },
];

const SPAM_TOOLS: Seed[] = [
  { name: "Mail-Tester", category: "spam_tool", description: "10/10 spam score check.", officialUrl: "https://www.mail-tester.com", status: "verified" },
  { name: "GlockApps", category: "spam_tool", description: "Inbox placement testing.", officialUrl: "https://glockapps.com", status: "verified" },
  { name: "Litmus", category: "spam_tool", description: "Email preview & testing.", officialUrl: "https://www.litmus.com", status: "verified" },
  { name: "Email on Acid", category: "spam_tool", description: "Preview & test across clients.", officialUrl: "https://www.emailonacid.com", status: "verified" },
  { name: "HTML Email Check", category: "spam_tool", description: "Validate HTML email code.", officialUrl: "https://www.htmlemailcheck.com", status: "verified" },
  { name: "Spamhaus Lookup", category: "spam_tool", description: "Check if an IP/domain is listed.", officialUrl: "https://www.spamhaus.org/lookup/", status: "verified" },
  { name: "Hunter (verification)", category: "spam_tool", description: "Email verification free tier.", officialUrl: "https://hunter.io", status: "verified" },
  { name: "NeverBounce", category: "spam_tool", description: "1,000 free verifications on signup.", officialUrl: "https://neverbounce.com", status: "verified" },
  { name: "Mailboxlayer", category: "spam_tool", description: "250 free verifications/month.", officialUrl: "https://mailboxlayer.com", status: "verified" },
  { name: "Can I email?", category: "spam_tool", description: "CSS & HTML compatibility reference.", officialUrl: "https://www.caniemail.com", status: "verified" },
];

const TEMPLATE_LIBS: Seed[] = [
  { name: "React Email", category: "template_lib", description: "Components for building emails in React.", officialUrl: "https://react.email", license: "MIT", status: "verified" },
  { name: "MJML", category: "template_lib", description: "Responsive email markup language.", officialUrl: "https://mjml.io", license: "MIT", status: "verified" },
  { name: "Maizzle", category: "template_lib", description: "Email framework with Tailwind.", officialUrl: "https://maizzle.com", license: "MIT", status: "verified" },
  { name: "Foundation for Emails", category: "template_lib", description: "Responsive email framework.", officialUrl: "https://get.foundation/emails.html", license: "MIT", status: "verified" },
  { name: "Cerberus", category: "template_lib", description: "Battle-tested HTML email patterns.", officialUrl: "https://tedgoas.github.io/Cerberus/", license: "MIT", status: "verified" },
  { name: "Really Good Emails", category: "template_lib", description: "Gallery of real-world email designs.", officialUrl: "https://reallygoodemails.com", status: "verified" },
  { name: "Good Email Code", category: "template_lib", description: "Accessibility-first snippets.", officialUrl: "https://www.goodemailcode.com", status: "verified" },
  { name: "HTMLEmail.io", category: "template_lib", description: "Email design & template gallery.", officialUrl: "https://htmlemail.io", status: "verified" },
];

const FREE_DOMAINS: Seed[] = [
  { name: "EU.org", category: "free_domain", description: "Free subdomain registration under .eu.org.", officialUrl: "https://nic.eu.org", status: "experimental", riskLevel: "medium" },
  { name: "FreeDNS / afraid.org", category: "free_domain", description: "Free shared subdomains + DNS.", officialUrl: "https://freedns.afraid.org", status: "experimental", riskLevel: "high" },
  { name: "DuckDNS", category: "free_domain", description: "Dynamic DNS subdomain.", officialUrl: "https://www.duckdns.org", status: "experimental", riskLevel: "high" },
  { name: "is-a.dev", category: "free_domain", description: "Free `*.is-a.dev` subdomains for devs.", officialUrl: "https://www.is-a.dev", status: "experimental", riskLevel: "medium" },
  { name: "js.org", category: "free_domain", description: "Free `*.js.org` subdomains.", officialUrl: "https://js.org", status: "experimental", riskLevel: "medium" },
];

const INFRASTRUCTURE: Seed[] = [
  { name: "Supabase", category: "infrastructure", description: "Postgres + Auth + Storage. Free tier.", officialUrl: "https://supabase.com/pricing", license: "Apache-2.0 (core)", status: "verified" },
  { name: "Neon", category: "infrastructure", description: "Serverless Postgres, branching.", officialUrl: "https://neon.tech/pricing", status: "verified" },
  { name: "Turso", category: "infrastructure", description: "Edge SQLite via libSQL.", officialUrl: "https://turso.tech/pricing", status: "verified" },
  { name: "Railway", category: "infrastructure", description: "Workers + DB hosting.", officialUrl: "https://railway.app/pricing", status: "verified" },
  { name: "Render", category: "infrastructure", description: "Workers, cron, static, DB.", officialUrl: "https://render.com/pricing", status: "verified" },
  { name: "Fly.io", category: "infrastructure", description: "Run workers near users.", officialUrl: "https://fly.io/docs/about/pricing/", status: "verified" },
  { name: "Plausible (self-host)", category: "infrastructure", description: "Privacy-first analytics.", officialUrl: "https://plausible.io/self-hosted-web-analytics", license: "AGPL", selfHosted: true, status: "verified" },
  { name: "Umami", category: "infrastructure", description: "Open-source privacy analytics.", officialUrl: "https://umami.is", license: "MIT", selfHosted: true, status: "verified" },
  { name: "PostHog", category: "infrastructure", description: "Product analytics + session replay.", officialUrl: "https://posthog.com", license: "MIT", selfHosted: true, status: "verified" },
  { name: "Sentry (self-host)", category: "infrastructure", description: "Error monitoring.", officialUrl: "https://develop.sentry.dev/self-hosted/", license: "FSL", selfHosted: true, status: "verified" },
  { name: "Uptime Kuma", category: "infrastructure", description: "Self-hosted uptime monitoring.", officialUrl: "https://uptime.kuma.pet", license: "MIT", selfHosted: true, status: "verified" },
  { name: "n8n", category: "infrastructure", description: "OSS workflow automation.", officialUrl: "https://n8n.io", license: "Fair-code", selfHosted: true, status: "verified" },
  { name: "Authentik", category: "infrastructure", description: "OSS identity provider.", officialUrl: "https://goauthentik.io", license: "MIT", selfHosted: true, status: "verified" },
  { name: "Zitadel", category: "infrastructure", description: "OSS identity platform.", officialUrl: "https://zitadel.com", license: "Apache-2.0", selfHosted: true, status: "verified" },
  { name: "Cloudflare Turnstile", category: "infrastructure", description: "Free privacy-friendly CAPTCHA.", officialUrl: "https://www.cloudflare.com/products/turnstile/", status: "verified" },
];

const ALL_SOURCES: Seed[] = [
  ...PROVIDERS,
  ...OSS_NEWSLETTER,
  ...OSS_MAIL_SERVER,
  ...DNS_TOOLS,
  ...SPAM_TOOLS,
  ...TEMPLATE_LIBS,
  ...FREE_DOMAINS,
  ...INFRASTRUCTURE,
];

function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

/** Wake Neon up by running a trivial query with backoff. */
async function waitForDb(maxAttempts = 6): Promise<{ ok: boolean; attempts: number; error?: string }> {
  for (let i = 1; i <= maxAttempts; i++) {
    try {
      await prisma.$queryRawUnsafe("SELECT 1");
      return { ok: true, attempts: i };
    } catch (e: any) {
      if (i === maxAttempts) return { ok: false, attempts: i, error: e?.message };
      // Exponential-ish backoff: 1s, 2s, 4s, 8s, 15s, 30s
      const waitMs = [1000, 2000, 4000, 8000, 15000, 30000][i - 1] ?? 5000;
      await new Promise((r) => setTimeout(r, waitMs));
    }
  }
  return { ok: false, attempts: maxAttempts };
}

async function runMigration() {
  // Split the migration SQL into individual statements and run each.
  // CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS handle re-runs.
  // CREATE TYPE and ALTER TABLE ADD CONSTRAINT don't support IF NOT EXISTS,
  // so we swallow "already exists" errors.
  const statements = MIGRATION_SQL
    .split(/;\s*(?:\n|$)/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  let skipped = 0;
  let ran = 0;
  const errors: string[] = [];

  for (const stmt of statements) {
    try {
      await prisma.$executeRawUnsafe(stmt);
      ran++;
    } catch (e: any) {
      const msg = String(e?.message ?? e).toLowerCase();
      if (
        msg.includes("already exists") ||
        msg.includes("duplicate object") ||
        msg.includes("42p07") || // duplicate_table
        msg.includes("42710")    // duplicate_object
      ) {
        skipped++;
      } else {
        errors.push(`${stmt.slice(0, 80)}...: ${e?.message}`);
      }
    }
  }
  return { ran, skipped, errors };
}

async function runSeed() {
  // 1. Upsert every source research item
  for (const item of ALL_SOURCES) {
    await prisma.sourceResearchItem.upsert({
      where: { name: item.name },
      update: { ...item, lastCheckedAt: new Date() },
      create: { ...item, lastCheckedAt: new Date() },
    });
  }

  // 2. Default workspace
  const ws = await prisma.workspace.upsert({
    where: { slug: "default" },
    update: {
      legalName: "Got Mail Demo LLC",
      postalAddress: "1455 Market St, San Francisco, CA 94103",
      replyTo: "hello@gotmail.example",
      timezone: "America/Los_Angeles",
    },
    create: {
      name: "My Workspace",
      slug: "default",
      legalName: "Got Mail Demo LLC",
      postalAddress: "1455 Market St, San Francisco, CA 94103",
      replyTo: "hello@gotmail.example",
      timezone: "America/Los_Angeles",
    },
  });

  // 3. Domain
  const domain = await prisma.domain.upsert({
    where: { workspaceId_domain: { workspaceId: ws.id, domain: "gotmail.example" } },
    update: {
      status: "VERIFIED",
      spfValid: true,
      dkimValid: true,
      dmarcValid: true,
      returnPathValid: true,
      lastCheckedAt: new Date(),
    },
    create: {
      workspaceId: ws.id,
      domain: "gotmail.example",
      status: "VERIFIED",
      spfValid: true,
      dkimValid: true,
      dmarcValid: true,
      returnPathValid: true,
      trackingDomain: "track.gotmail.example",
      reputationScore: 92,
      freeSubdomain: false,
      lastCheckedAt: new Date(),
    },
  });

  // 4. Sending identity (find-or-create)
  let identity = await prisma.sendingIdentity.findFirst({
    where: { workspaceId: ws.id, fromEmail: "news@gotmail.example" },
  });
  if (!identity) {
    identity = await prisma.sendingIdentity.create({
      data: {
        workspaceId: ws.id,
        mode: "OWNED_DOMAIN",
        name: "Newsletter sender",
        fromName: "Got Mail Demo",
        fromEmail: "news@gotmail.example",
        replyTo: "hello@gotmail.example",
        providerKind: "brevo",
        domainId: domain.id,
        dailyLimit: 300,
        hourlyLimit: 60,
        warmupStatus: "IN_PROGRESS",
        isDefault: true,
      },
    });
  }

  // 5. Template (find-or-create)
  let template = await prisma.emailTemplate.findFirst({
    where: { workspaceId: ws.id, name: "Welcome email" },
  });
  if (!template) {
    template = await prisma.emailTemplate.create({
      data: {
        workspaceId: ws.id,
        name: "Welcome email",
        subject: "Welcome to Got Mail, {{first_name}}!",
        preheader: "Here's what to expect.",
        html: `<p>Hi {{first_name}},</p><p>Thanks for subscribing.</p><p>— Got Mail Demo<br>1455 Market St, SF, CA 94103</p><p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>`,
        text: `Hi {{first_name}},\nThanks for subscribing.\n— Got Mail Demo\n1455 Market St, SF, CA 94103\nUnsubscribe: {{unsubscribe_url}}`,
        variablesJson: JSON.stringify(["first_name", "unsubscribe_url"]),
      },
    });
  }

  // 6. Segment (find-or-create)
  let segment = await prisma.segment.findFirst({
    where: { workspaceId: ws.id, name: "VIP — opted-in newsletter" },
  });
  if (!segment) {
    segment = await prisma.segment.create({
      data: {
        workspaceId: ws.id,
        name: "VIP — opted-in newsletter",
        description: "Early subscribers who double opted-in.",
        filterJson: JSON.stringify({ tag: "vip" }),
      },
    });
  }

  // 7. Contacts
  const contactsData = [
    { email: "ada@gotmail.example", firstName: "Ada", lastName: "Lovelace" },
    { email: "grace@gotmail.example", firstName: "Grace", lastName: "Hopper" },
    { email: "alan@gotmail.example", firstName: "Alan", lastName: "Turing" },
  ];
  for (const c of contactsData) {
    const contact = await prisma.contact.upsert({
      where: { workspaceId_email: { workspaceId: ws.id, email: c.email } },
      update: { consentStatus: "VERIFIED", lastActivityAt: new Date() },
      create: {
        workspaceId: ws.id,
        email: c.email,
        firstName: c.firstName,
        lastName: c.lastName,
        consentStatus: "VERIFIED",
        consentSource: "double-opt-in",
        consentAt: new Date(),
        consentIp: "127.0.0.1",
        consentUa: "seed-api",
        tagsJson: JSON.stringify(["vip", "seed"]),
      },
    });

    await prisma.consentRecord.create({
      data: {
        workspaceId: ws.id,
        contactId: contact.id,
        event: "DOUBLE_OPT_IN_CONFIRMED",
        source: "seed-api",
        ip: "127.0.0.1",
        userAgent: "seed-api",
        proofHash: sha256Hex(`${contact.email}|OPT_IN|${new Date().toISOString()}`),
      },
    });

    await prisma.segmentMember.upsert({
      where: { segmentId_contactId: { segmentId: segment.id, contactId: contact.id } },
      update: {},
      create: { segmentId: segment.id, contactId: contact.id },
    });
  }

  // 8. Suppression
  await prisma.suppression.upsert({
    where: { workspaceId_email: { workspaceId: ws.id, email: "bounced@gotmail.example" } },
    update: {},
    create: {
      workspaceId: ws.id,
      email: "bounced@gotmail.example",
      reason: "BOUNCE",
      note: "Hard bounce on 2026-04-20.",
    },
  });

  // 9. Sample campaign (only create one if none exists)
  const hasCampaign = await prisma.campaign.findFirst({ where: { workspaceId: ws.id } });
  if (!hasCampaign) {
    await prisma.campaign.create({
      data: {
        workspaceId: ws.id,
        name: "April 2026 newsletter",
        subject: "What's new at Got Mail Demo — April",
        preheader: "Product updates, tips.",
        html: `<h1>Hello {{first_name}}</h1><p>Here's what we shipped this month.</p><p>Got Mail Demo LLC · 1455 Market St, SF, CA 94103</p><p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>`,
        text: `Hello {{first_name}}\nHere's what we shipped.\nGot Mail Demo LLC · 1455 Market St, SF, CA 94103\nUnsubscribe: {{unsubscribe_url}}`,
        templateId: template.id,
        segmentId: segment.id,
        sendingIdentityId: identity.id,
        status: "DRAFT",
      },
    });
  }

  // 10. Warmup schedule
  const hasWarmup = await prisma.warmupSchedule.findFirst({
    where: { sendingIdentityId: identity.id },
  });
  if (!hasWarmup) {
    await prisma.warmupSchedule.create({
      data: {
        workspaceId: ws.id,
        sendingIdentityId: identity.id,
        day: 2,
        dailyCap: 100,
        status: "IN_PROGRESS",
      },
    });
  }

  // 11. Deliverability snapshot
  await prisma.deliverabilityHealth.create({
    data: {
      workspaceId: ws.id,
      domain: "gotmail.example",
      providerKind: "brevo",
      bounceRate: 0.4,
      complaintRate: 0.02,
      openRate: 38.5,
      clickRate: 5.1,
      unsubRate: 0.18,
      inboxPct: 97.0,
      rblListed: false,
    },
  });

  const counts = {
    sources: await prisma.sourceResearchItem.count(),
    workspaces: await prisma.workspace.count(),
    contacts: await prisma.contact.count(),
    segments: await prisma.segment.count(),
    templates: await prisma.emailTemplate.count(),
    campaigns: await prisma.campaign.count(),
    identities: await prisma.sendingIdentity.count(),
    domains: await prisma.domain.count(),
  };
  return counts;
}

async function handle(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const expected = process.env.SEED_TOKEN ?? DEFAULT_TOKEN;
  if (token !== expected) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Unauthorized. Pass ?token=<your-seed-token>. Default token is 'gotmail-seed-2026' — override by setting SEED_TOKEN in Netlify env vars.",
      },
      { status: 401 }
    );
  }

  try {
    const wake = await waitForDb();
    if (!wake.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: "Neon database did not wake up in time (6 attempts, ~60s).",
          hint:
            "In Netlify env vars, append &connect_timeout=60 to DATABASE_URL, then retry. Also confirm the Neon compute is not suspended in the Neon console.",
          details: wake.error,
        },
        { status: 503 }
      );
    }
    const migration = await runMigration();
    const counts = await runSeed();
    return NextResponse.json({
      ok: true,
      message: "Migration + seed complete. Reload the site — every page now has data.",
      wake,
      migration,
      counts,
    });
  } catch (e: any) {
    // Most common first-time failure: tables don't exist yet because
    // `prisma db push` hasn't run. Point the user at the fix.
    const msg: string = e?.message ?? String(e);
    const isMissingTable = /relation .* does not exist|table .* doesn't exist|P2021/i.test(msg);
    return NextResponse.json(
      {
        ok: false,
        error: msg,
        hint: isMissingTable
          ? "Tables don't exist in Neon yet. Run `npx prisma db push --accept-data-loss` locally once, OR paste your schema via the Neon SQL editor."
          : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) { return handle(req); }
export async function POST(req: NextRequest) { return handle(req); }
