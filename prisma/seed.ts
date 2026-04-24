/**
 * Got Mail — seed data (expanded edition)
 *
 * Populates:
 *   - SourceResearchItem: 80+ free providers, OSS platforms, DNS tools,
 *     spam checkers, template libraries, free-domain sources, AND modern
 *     open-source infrastructure (analytics, error-monitoring, auth,
 *     workflow automation, dev-SMTP testing, transactional platforms).
 *   - Workspace: the default workspace you'll develop against.
 *   - SendingIdentity, Domain, DomainVerification: one "owned-domain" identity
 *     with all three authentication records passing.
 *   - EmailTemplate: a compliant default template.
 *   - Segment: one VIP segment.
 *   - Contact: 3 sample consent-verified contacts with ConsentRecord history.
 *   - Campaign: one draft campaign to show in the dashboard.
 *   - Suppression: one sample bounced-then-suppressed address.
 *   - WarmupSchedule: a 10-day warmup on the sample domain.
 *   - DeliverabilityHealth: one 30-day snapshot row.
 *
 * Safe to re-run: every upsert keys on a unique field.
 */

import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

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

// =============================================================
//  Free / low-cost email providers (13)
// =============================================================
const PROVIDERS: Seed[] = [
  { name: "Brevo", category: "provider", officialUrl: "https://www.brevo.com/pricing/", freeLimit: "300 emails/day", dailyLimit: 300, supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, supportsBulk: true, status: "verified" },
  { name: "Mailjet", category: "provider", officialUrl: "https://www.mailjet.com/pricing/", freeLimit: "6,000/month, 200/day", dailyLimit: 200, monthlyLimit: 6000, supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, supportsBulk: true, status: "verified" },
  { name: "Resend", category: "provider", officialUrl: "https://resend.com/pricing", freeLimit: "100/day, 3,000/month", dailyLimit: 100, monthlyLimit: 3000, supportsApi: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "Postmark", category: "provider", officialUrl: "https://postmarkapp.com/pricing", freeLimit: "100/month (dev plan)", monthlyLimit: 100, supportsSmtp: true, supportsApi: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "SendGrid", category: "provider", officialUrl: "https://sendgrid.com/en-us/pricing", freeLimit: "60-day trial, 100/day", dailyLimit: 100, supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, supportsBulk: true, status: "trial_only" },
  { name: "Mailgun Flex", category: "provider", officialUrl: "https://www.mailgun.com/pricing", freeLimit: "100/day (trial)", dailyLimit: 100, supportsSmtp: true, supportsApi: true, supportsTransactional: true, supportsWebhooks: true, status: "trial_only" },
  { name: "SMTP2GO", category: "provider", officialUrl: "https://www.smtp2go.com/pricing/", freeLimit: "1,000/month, 200/day", dailyLimit: 200, monthlyLimit: 1000, supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "Elastic Email", category: "provider", officialUrl: "https://elasticemail.com/pricing", freeLimit: "100/day", dailyLimit: 100, supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "Amazon SES", category: "provider", officialUrl: "https://aws.amazon.com/ses/", freeLimit: "62,000/month from EC2", supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, supportsBulk: true, status: "verified", notes: "Requires AWS account + sandbox exit." },
  { name: "MailerSend", category: "provider", officialUrl: "https://www.mailersend.com/pricing", freeLimit: "3,000/month", monthlyLimit: 3000, supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "Mailtrap Email API", category: "provider", officialUrl: "https://mailtrap.io/pricing", freeLimit: "1,000/month", monthlyLimit: 1000, supportsSmtp: true, supportsApi: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "Sweego", category: "provider", officialUrl: "https://www.sweego.io", freeLimit: "500/day free", dailyLimit: 500, supportsSmtp: true, supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "Gmail / Google Workspace SMTP", category: "provider", officialUrl: "https://support.google.com/a/answer/166852", freeLimit: "~2,000/day Workspace, ~500/day free Gmail", dailyLimit: 2000, supportsSmtp: true, supportsTransactional: true, status: "verified", notes: "Not for 1,000+ campaigns." },
  { name: "Loops", category: "provider", officialUrl: "https://loops.so/pricing", freeLimit: "1,000 contacts free", supportsApi: true, supportsMarketing: true, supportsTransactional: true, supportsWebhooks: true, status: "verified" },
  { name: "Courier", category: "provider", officialUrl: "https://www.courier.com/pricing/", freeLimit: "10,000 notifications/month", supportsApi: true, supportsTransactional: true, supportsWebhooks: true, status: "verified", notes: "Multi-channel (email, SMS, push)." },
];

// =============================================================
//  Open-source newsletter / marketing / campaign platforms (14)
// =============================================================
const OSS_NEWSLETTER: Seed[] = [
  { name: "listmonk", category: "oss_newsletter", description: "Self-hosted, high-performance newsletter & mailing list manager.", officialUrl: "https://listmonk.app", license: "AGPL", selfHosted: true, supportsBulk: true, supportsMarketing: true, status: "verified" },
  { name: "Mautic", category: "oss_newsletter", description: "Open-source marketing automation.", officialUrl: "https://www.mautic.org", license: "GPLv3", selfHosted: true, supportsBulk: true, supportsMarketing: true, status: "verified" },
  { name: "Keila", category: "oss_newsletter", description: "Modern newsletter tool in Elixir.", officialUrl: "https://www.keila.io", license: "MIT", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Plunk", category: "oss_newsletter", description: "Open-source email marketing platform with a clean UI.", officialUrl: "https://www.useplunk.com", license: "AGPL", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Mailcoach", category: "oss_newsletter", description: "Spatie's self-hosted mailing list + transactional.", officialUrl: "https://mailcoach.app", license: "MIT (core)", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Sendportal", category: "oss_newsletter", description: "Laravel-based email campaign manager.", officialUrl: "https://sendportal.io", license: "MIT", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "OpenEMM", category: "oss_newsletter", description: "Enterprise-grade OSS marketing suite.", officialUrl: "https://www.openemm.org", license: "AGPL", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "phpList", category: "oss_newsletter", description: "One of the oldest OSS newsletter managers.", officialUrl: "https://www.phplist.org", license: "AGPL", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Mailtrain", category: "oss_newsletter", description: "Self-hosted newsletter app (Node.js).", officialUrl: "https://mailtrain.org", license: "GPLv3", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Ghost", category: "oss_newsletter", description: "Publishing + newsletter platform.", officialUrl: "https://ghost.org", license: "MIT", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Chaskiq", category: "oss_newsletter", description: "Messaging + email campaigns.", officialUrl: "https://chaskiq.io", license: "AGPL", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Novu", category: "oss_newsletter", description: "Open-source notification infrastructure (email, in-app, push, SMS).", officialUrl: "https://novu.co", license: "Apache-2.0", selfHosted: true, supportsTransactional: true, status: "verified" },
  { name: "Knock", category: "oss_newsletter", description: "Notifications-as-a-service with OSS roots; generous free tier.", officialUrl: "https://knock.app/pricing", status: "verified" },
  { name: "Buttondown", category: "oss_newsletter", description: "Minimalist newsletter platform (source-available).", officialUrl: "https://buttondown.email", status: "verified" },
];

// =============================================================
//  Open-source mail servers / SMTP stacks (12)
// =============================================================
const OSS_MAIL_SERVER: Seed[] = [
  { name: "Postal", category: "mail_server", description: "Open-source mail delivery platform like SendGrid.", officialUrl: "https://postalserver.io", license: "MIT", selfHosted: true, supportsSmtp: true, supportsApi: true, supportsWebhooks: true, status: "verified" },
  { name: "Docker Mailserver", category: "mail_server", description: "Production-ready stack: Postfix + Dovecot + Rspamd + ClamAV.", officialUrl: "https://docker-mailserver.github.io", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Mailcow", category: "mail_server", description: "Dockerized mail server (Postfix/Dovecot + SOGo).", officialUrl: "https://mailcow.email", license: "GPLv3", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Mailu", category: "mail_server", description: "Dockerized mail server suite.", officialUrl: "https://mailu.io", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "iRedMail", category: "mail_server", description: "Full mail server stack installer.", officialUrl: "https://www.iredmail.org", license: "GPLv3", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Modoboa", category: "mail_server", description: "Mail hosting + management UI.", officialUrl: "https://modoboa.org", license: "ISC", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Maddy", category: "mail_server", description: "Modern modular all-in-one mail server in Go.", officialUrl: "https://maddy.email", license: "GPLv3", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Stalwart Mail Server", category: "mail_server", description: "Rust-based all-in-one mail server.", officialUrl: "https://stalw.art", license: "AGPL", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Haraka", category: "mail_server", description: "Node.js SMTP server, very fast, pluggable.", officialUrl: "https://haraka.github.io", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "WildDuck", category: "mail_server", description: "Scalable IMAP/POP3 server.", officialUrl: "https://wildduck.email", license: "EUPL", selfHosted: true, status: "verified" },
  { name: "OpenSMTPD", category: "mail_server", description: "OpenBSD's minimal & secure SMTP daemon.", officialUrl: "https://www.opensmtpd.org", license: "ISC", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Exim", category: "mail_server", description: "Classic MTA, still widely deployed.", officialUrl: "https://www.exim.org", license: "GPLv2", selfHosted: true, supportsSmtp: true, status: "verified" },
];

// =============================================================
//  Dev/local SMTP testing (4)  — category reuses "mail_server"
// =============================================================
const DEV_SMTP: Seed[] = [
  { name: "Mailpit", category: "mail_server", description: "Local SMTP server + web UI for dev testing.", officialUrl: "https://github.com/axllent/mailpit", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "MailHog", category: "mail_server", description: "Classic dev-mode SMTP catcher.", officialUrl: "https://github.com/mailhog/MailHog", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "MailCatcher", category: "mail_server", description: "Ruby SMTP server that catches mail for inspection.", officialUrl: "https://mailcatcher.me", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "smtp4dev", category: "mail_server", description: ".NET/Cross-platform dev SMTP server.", officialUrl: "https://github.com/rnwood/smtp4dev", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
];

// =============================================================
//  DNS / auth checkers (10)
// =============================================================
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
  { name: "whatsmydns.net", category: "dns_tool", description: "Check DNS propagation across 40+ global DNS servers.", officialUrl: "https://www.whatsmydns.net", status: "verified" },
];

// =============================================================
//  Spam / inbox placement (10)
// =============================================================
const SPAM_TOOLS: Seed[] = [
  { name: "Mail-Tester", category: "spam_tool", description: "10/10 spam score check.", officialUrl: "https://www.mail-tester.com", status: "verified" },
  { name: "GlockApps", category: "spam_tool", description: "Inbox placement testing (free trial).", officialUrl: "https://glockapps.com", status: "verified" },
  { name: "Litmus", category: "spam_tool", description: "Email preview & testing (free trial).", officialUrl: "https://www.litmus.com", status: "verified" },
  { name: "Email on Acid", category: "spam_tool", description: "Preview & test across clients (free trial).", officialUrl: "https://www.emailonacid.com", status: "verified" },
  { name: "HTML Email Check", category: "spam_tool", description: "Validate HTML email code.", officialUrl: "https://www.htmlemailcheck.com", status: "verified" },
  { name: "Spamhaus Lookup", category: "spam_tool", description: "Check if an IP/domain is listed.", officialUrl: "https://www.spamhaus.org/lookup/", status: "verified" },
  { name: "Hunter (verification)", category: "spam_tool", description: "Email verification — 25/month free.", officialUrl: "https://hunter.io", status: "verified" },
  { name: "NeverBounce", category: "spam_tool", description: "1,000 free verifications on signup.", officialUrl: "https://neverbounce.com", status: "verified" },
  { name: "Mailboxlayer", category: "spam_tool", description: "250 free verifications/month.", officialUrl: "https://mailboxlayer.com", status: "verified" },
  { name: "Can I email?", category: "spam_tool", description: "CSS & HTML compatibility reference for email clients.", officialUrl: "https://www.caniemail.com", status: "verified" },
];

// =============================================================
//  Template libraries / editors (8)
// =============================================================
const TEMPLATE_LIBS: Seed[] = [
  { name: "React Email", category: "template_lib", description: "Components for building emails in React.", officialUrl: "https://react.email", license: "MIT", status: "verified" },
  { name: "MJML", category: "template_lib", description: "Markup language that compiles to responsive HTML.", officialUrl: "https://mjml.io", license: "MIT", status: "verified" },
  { name: "Maizzle", category: "template_lib", description: "Framework for rapid email dev with Tailwind.", officialUrl: "https://maizzle.com", license: "MIT", status: "verified" },
  { name: "Foundation for Emails", category: "template_lib", description: "Responsive email framework.", officialUrl: "https://get.foundation/emails.html", license: "MIT", status: "verified" },
  { name: "Cerberus", category: "template_lib", description: "Battle-tested responsive HTML email patterns.", officialUrl: "https://tedgoas.github.io/Cerberus/", license: "MIT", status: "verified" },
  { name: "Really Good Emails", category: "template_lib", description: "Gallery of real-world email designs.", officialUrl: "https://reallygoodemails.com", status: "verified" },
  { name: "Good Email Code", category: "template_lib", description: "Accessibility-first email code snippets.", officialUrl: "https://www.goodemailcode.com", status: "verified" },
  { name: "HTMLEmail.io", category: "template_lib", description: "Email design & template gallery.", officialUrl: "https://htmlemail.io", status: "verified" },
];

// =============================================================
//  Free domains / subdomains (5)
// =============================================================
const FREE_DOMAINS: Seed[] = [
  { name: "EU.org", category: "free_domain", description: "Free subdomain registration under .eu.org.", officialUrl: "https://nic.eu.org", status: "experimental", riskLevel: "medium" },
  { name: "FreeDNS / afraid.org", category: "free_domain", description: "Free shared subdomains + free DNS hosting.", officialUrl: "https://freedns.afraid.org", status: "experimental", riskLevel: "high" },
  { name: "DuckDNS", category: "free_domain", description: "Dynamic DNS subdomain under duckdns.org.", officialUrl: "https://www.duckdns.org", status: "experimental", riskLevel: "high" },
  { name: "is-a.dev", category: "free_domain", description: "Free `*.is-a.dev` subdomains for developers (GitHub-backed).", officialUrl: "https://www.is-a.dev", status: "experimental", riskLevel: "medium" },
  { name: "js.org", category: "free_domain", description: "Free `*.js.org` subdomains for JS projects (GitHub-backed).", officialUrl: "https://js.org", status: "experimental", riskLevel: "medium" },
];

// =============================================================
//  Adjacent OSS infrastructure — analytics, auth, storage, monitoring
//  (category = "infrastructure")  (15)
// =============================================================
const INFRASTRUCTURE: Seed[] = [
  { name: "Supabase", category: "infrastructure", description: "Postgres + Auth + Storage + Realtime. Free tier.", officialUrl: "https://supabase.com/pricing", license: "Apache-2.0 (core)", status: "verified" },
  { name: "Neon", category: "infrastructure", description: "Serverless Postgres. Free plan with branching.", officialUrl: "https://neon.tech/pricing", status: "verified" },
  { name: "Turso", category: "infrastructure", description: "Edge SQLite via libSQL. Generous free tier.", officialUrl: "https://turso.tech/pricing", status: "verified" },
  { name: "Railway", category: "infrastructure", description: "Background workers + DB hosting.", officialUrl: "https://railway.app/pricing", status: "verified" },
  { name: "Render", category: "infrastructure", description: "Workers, cron, static, DB hosting.", officialUrl: "https://render.com/pricing", status: "verified" },
  { name: "Fly.io", category: "infrastructure", description: "Run workers near your users. Free allowance.", officialUrl: "https://fly.io/docs/about/pricing/", status: "verified" },
  { name: "Plausible (self-host)", category: "infrastructure", description: "Privacy-first analytics, self-hostable.", officialUrl: "https://plausible.io/self-hosted-web-analytics", license: "AGPL", selfHosted: true, status: "verified" },
  { name: "Umami", category: "infrastructure", description: "Open-source privacy-friendly analytics.", officialUrl: "https://umami.is", license: "MIT", selfHosted: true, status: "verified" },
  { name: "PostHog", category: "infrastructure", description: "Open-source product analytics, session replay.", officialUrl: "https://posthog.com", license: "MIT", selfHosted: true, status: "verified" },
  { name: "Sentry (self-host)", category: "infrastructure", description: "Error monitoring, self-hostable.", officialUrl: "https://develop.sentry.dev/self-hosted/", license: "FSL", selfHosted: true, status: "verified" },
  { name: "Uptime Kuma", category: "infrastructure", description: "Self-hosted uptime & status pages.", officialUrl: "https://uptime.kuma.pet", license: "MIT", selfHosted: true, status: "verified" },
  { name: "n8n", category: "infrastructure", description: "OSS workflow automation (Zapier alternative).", officialUrl: "https://n8n.io", license: "Fair-code", selfHosted: true, status: "verified" },
  { name: "Authentik", category: "infrastructure", description: "OSS identity provider.", officialUrl: "https://goauthentik.io", license: "MIT", selfHosted: true, status: "verified" },
  { name: "Zitadel", category: "infrastructure", description: "OSS identity platform.", officialUrl: "https://zitadel.com", license: "Apache-2.0", selfHosted: true, status: "verified" },
  { name: "Cloudflare Turnstile", category: "infrastructure", description: "Free, privacy-friendly CAPTCHA alternative.", officialUrl: "https://www.cloudflare.com/products/turnstile/", status: "verified" },
];

async function upsertAll(items: Seed[]) {
  for (const item of items) {
    await prisma.sourceResearchItem.upsert({
      where: { name: item.name },
      update: { ...item, lastCheckedAt: new Date() },
      create: { ...item, lastCheckedAt: new Date() },
    });
  }
}

function sha256Hex(s: string) {
  return crypto.createHash("sha256").update(s).digest("hex");
}

async function seedSampleWorkspace() {
  // Default workspace
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

  // Sample domain with all three checks green
  const domain = await prisma.domain.upsert({
    where: { workspaceId_domain: { workspaceId: ws.id, domain: "gotmail.example" } },
    update: { status: "VERIFIED", spfValid: true, dkimValid: true, dmarcValid: true, returnPathValid: true, lastCheckedAt: new Date() },
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

  // Domain verifications
  const recs = [
    { recordType: "SPF",         name: "@",              value: "v=spf1 include:amazonses.com ~all", status: "PASS" },
    { recordType: "DKIM",        name: "resend._domainkey", value: "resend._domainkey.resend.com (CNAME)", status: "PASS" },
    { recordType: "DMARC",       name: "_dmarc",         value: "v=DMARC1; p=none; rua=mailto:dmarc@gotmail.example", status: "PASS" },
    { recordType: "RETURN_PATH", name: "bounces",        value: "bounces.provider.com (CNAME)", status: "PASS" },
  ];
  for (const r of recs) {
    await prisma.domainVerification.create({
      data: { domainId: domain.id, ...r, checkedAt: new Date() },
    });
  }

  // A sample SendingIdentity (Owned Domain mode)
  const identity = await prisma.sendingIdentity.create({
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

  // Warmup schedule
  await prisma.warmupSchedule.create({
    data: {
      workspaceId: ws.id,
      sendingIdentityId: identity.id,
      day: 2,
      dailyCap: 100,
      status: "IN_PROGRESS",
    },
  });

  // Sample template — find-or-create so re-runs don't duplicate
  const existingTemplate = await prisma.emailTemplate.findFirst({
    where: { workspaceId: ws.id, name: "Welcome email" },
  });
  const template =
    existingTemplate ??
    (await prisma.emailTemplate.create({
      data: {
        workspaceId: ws.id,
        name: "Welcome email",
        subject: "Welcome to Got Mail, {{first_name}}!",
        preheader: "Here's what to expect.",
        html: `<p>Hi {{first_name}},</p><p>Thanks for subscribing. You'll hear from us once a week — no more, no less.</p><p>— The Got Mail Demo team<br>1455 Market St, San Francisco, CA 94103</p><p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>`,
        text: `Hi {{first_name}},\nThanks for subscribing.\n— The Got Mail Demo team\n1455 Market St, San Francisco, CA 94103\nUnsubscribe: {{unsubscribe_url}}`,
        variablesJson: JSON.stringify(["first_name", "unsubscribe_url"]),
      },
    }));

  // Sample segment
  const segment = await prisma.segment.create({
    data: {
      workspaceId: ws.id,
      name: "VIP — opted-in newsletter",
      description: "Early subscribers who double opted-in.",
      filterJson: JSON.stringify({ tag: "vip", consentStatus: "VERIFIED" }),
    },
  });

  // Sample contacts
  const contactsData = [
    { email: "ada@gotmail.example",   firstName: "Ada",   lastName: "Lovelace" },
    { email: "grace@gotmail.example", firstName: "Grace", lastName: "Hopper" },
    { email: "alan@gotmail.example",  firstName: "Alan",  lastName: "Turing" },
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
        consentUa: "seed-script",
        tagsJson: JSON.stringify(["vip", "seed"]),
      },
    });

    // Tamper-evident consent record
    const payload = `${contact.email}|OPT_IN|${contact.consentAt?.toISOString()}`;
    await prisma.consentRecord.create({
      data: {
        workspaceId: ws.id,
        contactId: contact.id,
        event: "DOUBLE_OPT_IN_CONFIRMED",
        source: "seed",
        ip: "127.0.0.1",
        userAgent: "seed-script",
        proofHash: sha256Hex(payload),
      },
    });

    // Attach to VIP segment
    await prisma.segmentMember.upsert({
      where: { segmentId_contactId: { segmentId: segment.id, contactId: contact.id } },
      update: {},
      create: { segmentId: segment.id, contactId: contact.id },
    });
  }

  // Sample suppression (someone who hard-bounced)
  await prisma.suppression.upsert({
    where: { workspaceId_email: { workspaceId: ws.id, email: "bounced@gotmail.example" } },
    update: {},
    create: {
      workspaceId: ws.id,
      email: "bounced@gotmail.example",
      reason: "BOUNCE",
      note: "Hard bounce on 2026-04-20 — mailbox does not exist.",
    },
  });

  // Sample campaign in DRAFT
  await prisma.campaign.create({
    data: {
      workspaceId: ws.id,
      name: "April 2026 newsletter",
      subject: "What's new at Got Mail Demo — April",
      preheader: "Product updates, tips, and a note from Ada.",
      html: `<h1>Hello {{first_name}}</h1><p>Here's what we shipped this month.</p><p>Got Mail Demo LLC · 1455 Market St, San Francisco, CA 94103</p><p><a href="{{unsubscribe_url}}">Unsubscribe</a></p>`,
      text: `Hello {{first_name}}\nHere's what we shipped this month.\nGot Mail Demo LLC · 1455 Market St, San Francisco, CA 94103\nUnsubscribe: {{unsubscribe_url}}`,
      templateId: template.id,
      segmentId: segment.id,
      sendingIdentityId: identity.id,
      status: "DRAFT",
    },
  });

  // Sample deliverability health snapshot (last 30 days)
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
}

async function main() {
  console.log("🌱 Seeding Got Mail...");
  await upsertAll(PROVIDERS);
  await upsertAll(OSS_NEWSLETTER);
  await upsertAll(OSS_MAIL_SERVER);
  await upsertAll(DEV_SMTP);
  await upsertAll(DNS_TOOLS);
  await upsertAll(SPAM_TOOLS);
  await upsertAll(TEMPLATE_LIBS);
  await upsertAll(FREE_DOMAINS);
  await upsertAll(INFRASTRUCTURE);
  console.log("   · source catalog populated");

  await seedSampleWorkspace();
  console.log("   · sample workspace + domain + identity + contacts + template + segment + campaign + suppression + warmup + health snapshot");

  // Summary
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
  console.log("✅ Seed complete:", counts);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
