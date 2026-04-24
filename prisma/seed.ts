/**
 * Got Mail — seed data
 * Populates providers, open-source tools, free-domain sources, DNS tools, etc.
 */
import { PrismaClient } from "@prisma/client";

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

const PROVIDERS: Seed[] = [
  {
    name: "Brevo",
    category: "provider",
    officialUrl: "https://www.brevo.com/pricing/",
    freeLimit: "300 emails/day",
    dailyLimit: 300,
    supportsSmtp: true,
    supportsApi: true,
    supportsMarketing: true,
    supportsTransactional: true,
    supportsWebhooks: true,
    supportsBulk: true,
    status: "verified",
    notes: "Respect daily free quota. Queue excess sends — do not rotate.",
  },
  {
    name: "Mailjet",
    category: "provider",
    officialUrl: "https://www.mailjet.com/pricing/",
    freeLimit: "6,000 emails/month, 200/day",
    dailyLimit: 200,
    monthlyLimit: 6000,
    supportsSmtp: true,
    supportsApi: true,
    supportsMarketing: true,
    supportsTransactional: true,
    supportsWebhooks: true,
    supportsBulk: true,
    status: "verified",
  },
  {
    name: "Resend",
    category: "provider",
    officialUrl: "https://resend.com/pricing",
    freeLimit: "100/day, 3,000/month",
    dailyLimit: 100,
    monthlyLimit: 3000,
    supportsApi: true,
    supportsTransactional: true,
    supportsWebhooks: true,
    supportsBulk: false,
    status: "verified",
    notes: "Transactional-leaning. Great developer API.",
  },
  {
    name: "Postmark",
    category: "provider",
    officialUrl: "https://postmarkapp.com/pricing",
    freeLimit: "100/month (developer plan)",
    monthlyLimit: 100,
    supportsSmtp: true,
    supportsApi: true,
    supportsMarketing: false,
    supportsTransactional: true,
    supportsWebhooks: true,
    supportsBulk: false,
    status: "verified",
    notes: "Strictly transactional. Separate paid streams for marketing.",
  },
  {
    name: "SendGrid",
    category: "provider",
    officialUrl: "https://sendgrid.com/en-us/pricing",
    freeLimit: "60-day trial, 100/day",
    dailyLimit: 100,
    supportsSmtp: true,
    supportsApi: true,
    supportsMarketing: true,
    supportsTransactional: true,
    supportsWebhooks: true,
    supportsBulk: true,
    status: "trial_only",
    notes: "Only a 60-day trial — not a permanent free tier.",
  },
  {
    name: "Mailgun Flex",
    category: "provider",
    officialUrl: "https://www.mailgun.com/pricing",
    freeLimit: "100/day (trial)",
    dailyLimit: 100,
    supportsSmtp: true,
    supportsApi: true,
    supportsTransactional: true,
    supportsWebhooks: true,
    status: "trial_only",
  },
  {
    name: "SMTP2GO",
    category: "provider",
    officialUrl: "https://www.smtp2go.com/pricing/",
    freeLimit: "1,000/month, 200/day",
    dailyLimit: 200,
    monthlyLimit: 1000,
    supportsSmtp: true,
    supportsApi: true,
    supportsMarketing: true,
    supportsTransactional: true,
    supportsWebhooks: true,
    status: "verified",
  },
  {
    name: "Elastic Email",
    category: "provider",
    officialUrl: "https://elasticemail.com/pricing",
    freeLimit: "100/day",
    dailyLimit: 100,
    supportsSmtp: true,
    supportsApi: true,
    supportsMarketing: true,
    supportsTransactional: true,
    supportsWebhooks: true,
    status: "verified",
  },
  {
    name: "Amazon SES",
    category: "provider",
    officialUrl: "https://aws.amazon.com/ses/",
    freeLimit: "62,000/month from EC2",
    supportsSmtp: true,
    supportsApi: true,
    supportsMarketing: true,
    supportsTransactional: true,
    supportsWebhooks: true,
    supportsBulk: true,
    status: "verified",
    notes: "Requires AWS account + sandbox exit request.",
  },
  {
    name: "MailerSend",
    category: "provider",
    officialUrl: "https://www.mailersend.com/pricing",
    freeLimit: "3,000/month",
    monthlyLimit: 3000,
    supportsSmtp: true,
    supportsApi: true,
    supportsMarketing: true,
    supportsTransactional: true,
    supportsWebhooks: true,
    status: "verified",
  },
  {
    name: "Mailtrap Email API",
    category: "provider",
    officialUrl: "https://mailtrap.io/pricing",
    freeLimit: "1,000/month",
    monthlyLimit: 1000,
    supportsSmtp: true,
    supportsApi: true,
    supportsTransactional: true,
    supportsWebhooks: true,
    status: "verified",
  },
  {
    name: "Sweego",
    category: "provider",
    officialUrl: "https://www.sweego.io",
    freeLimit: "500/day free",
    dailyLimit: 500,
    supportsSmtp: true,
    supportsApi: true,
    supportsMarketing: true,
    supportsTransactional: true,
    supportsWebhooks: true,
    status: "verified",
  },
  {
    name: "Gmail / Google Workspace SMTP",
    category: "provider",
    officialUrl: "https://support.google.com/a/answer/166852",
    freeLimit: "~2,000/day Workspace, ~500/day free Gmail",
    dailyLimit: 2000,
    supportsSmtp: true,
    supportsApi: false,
    supportsTransactional: true,
    supportsMarketing: false,
    status: "verified",
    notes: "Not designed for 1,000+ campaign sending. Warn user and enforce caps.",
  },
];

const OSS: Seed[] = [
  { name: "listmonk", category: "oss_newsletter", description: "Self-hosted, high-performance newsletter & mailing list manager.", officialUrl: "https://listmonk.app", license: "AGPL", selfHosted: true, supportsBulk: true, supportsMarketing: true, status: "verified" },
  { name: "Mautic", category: "oss_newsletter", description: "Open-source marketing automation.", officialUrl: "https://www.mautic.org", license: "GPLv3", selfHosted: true, supportsBulk: true, supportsMarketing: true, status: "verified" },
  { name: "Keila", category: "oss_newsletter", description: "Modern newsletter tool in Elixir.", officialUrl: "https://www.keila.io", license: "MIT", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Plunk", category: "oss_newsletter", description: "Open-source email marketing platform.", officialUrl: "https://www.useplunk.com", license: "AGPL", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Mailcoach", category: "oss_newsletter", description: "Spatie's self-hosted mailing list + transactional.", officialUrl: "https://mailcoach.app", license: "MIT (core)", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Sendportal", category: "oss_newsletter", description: "Laravel-based email campaign manager.", officialUrl: "https://sendportal.io", license: "MIT", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "OpenEMM", category: "oss_newsletter", description: "Enterprise-grade OSS marketing suite.", officialUrl: "https://www.openemm.org", license: "AGPL", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "phpList", category: "oss_newsletter", description: "One of the oldest OSS newsletter managers.", officialUrl: "https://www.phplist.org", license: "AGPL", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Mailtrain", category: "oss_newsletter", description: "Self-hosted newsletter app (Node.js).", officialUrl: "https://mailtrain.org", license: "GPLv3", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Ghost", category: "oss_newsletter", description: "Publishing + newsletter platform.", officialUrl: "https://ghost.org", license: "MIT", selfHosted: true, supportsMarketing: true, status: "verified" },
  { name: "Chaskiq", category: "oss_newsletter", description: "Messaging + email campaigns.", officialUrl: "https://chaskiq.io", license: "AGPL", selfHosted: true, supportsMarketing: true, status: "verified" },

  { name: "Postal", category: "mail_server", description: "Open-source mail delivery platform like SendGrid/Mailgun.", officialUrl: "https://postalserver.io", license: "MIT", selfHosted: true, supportsSmtp: true, supportsApi: true, supportsWebhooks: true, status: "verified" },
  { name: "Docker Mailserver", category: "mail_server", description: "Production-ready full stack: Postfix + Dovecot + Rspamd + ClamAV.", officialUrl: "https://docker-mailserver.github.io", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Mailcow", category: "mail_server", description: "Dockerized mail server (Postfix/Dovecot + SOGo).", officialUrl: "https://mailcow.email", license: "GPLv3", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Mailu", category: "mail_server", description: "Dockerized mail server suite.", officialUrl: "https://mailu.io", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "iRedMail", category: "mail_server", description: "Full mail server stack installer.", officialUrl: "https://www.iredmail.org", license: "GPLv3", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Modoboa", category: "mail_server", description: "Mail hosting + management UI.", officialUrl: "https://modoboa.org", license: "ISC", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Maddy", category: "mail_server", description: "Modern modular all-in-one mail server in Go.", officialUrl: "https://maddy.email", license: "GPLv3", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Stalwart Mail Server", category: "mail_server", description: "Rust-based all-in-one mail server.", officialUrl: "https://stalw.art", license: "AGPL", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Haraka", category: "mail_server", description: "Node.js SMTP server, very fast, pluggable.", officialUrl: "https://haraka.github.io", license: "MIT", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "WildDuck", category: "mail_server", description: "Scalable IMAP/POP3 server used by large providers.", officialUrl: "https://wildduck.email", license: "EUPL", selfHosted: true, status: "verified" },
  { name: "OpenSMTPD", category: "mail_server", description: "OpenBSD's minimal & secure SMTP daemon.", officialUrl: "https://www.opensmtpd.org", license: "ISC", selfHosted: true, supportsSmtp: true, status: "verified" },
  { name: "Exim", category: "mail_server", description: "Classic MTA, still widely deployed.", officialUrl: "https://www.exim.org", license: "GPLv2", selfHosted: true, supportsSmtp: true, status: "verified" },
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
];

const SPAM_TOOLS: Seed[] = [
  { name: "Mail-Tester", category: "spam_tool", description: "10/10 spam score check.", officialUrl: "https://www.mail-tester.com", status: "verified" },
  { name: "GlockApps", category: "spam_tool", description: "Inbox placement testing (free trial).", officialUrl: "https://glockapps.com", status: "verified" },
  { name: "Litmus", category: "spam_tool", description: "Email preview & testing (free trial).", officialUrl: "https://www.litmus.com", status: "verified" },
  { name: "Email on Acid", category: "spam_tool", description: "Preview & test across clients (free trial).", officialUrl: "https://www.emailonacid.com", status: "verified" },
  { name: "HTML Email Check", category: "spam_tool", description: "Validate HTML email code.", officialUrl: "https://www.htmlemailcheck.com", status: "verified" },
  { name: "Spamhaus Lookup", category: "spam_tool", description: "Check if an IP/domain is listed.", officialUrl: "https://www.spamhaus.org/lookup/", status: "verified" },
];

const TEMPLATE_LIBS: Seed[] = [
  { name: "React Email", category: "template_lib", description: "Components for building emails in React.", officialUrl: "https://react.email", license: "MIT", status: "verified" },
  { name: "MJML", category: "template_lib", description: "Markup language that compiles to responsive HTML.", officialUrl: "https://mjml.io", license: "MIT", status: "verified" },
  { name: "Maizzle", category: "template_lib", description: "Framework for rapid email dev with Tailwind.", officialUrl: "https://maizzle.com", license: "MIT", status: "verified" },
  { name: "Foundation for Emails", category: "template_lib", description: "Responsive email framework.", officialUrl: "https://get.foundation/emails.html", license: "MIT", status: "verified" },
  { name: "Cerberus", category: "template_lib", description: "Battle-tested responsive HTML email patterns.", officialUrl: "https://tedgoas.github.io/Cerberus/", license: "MIT", status: "verified" },
  { name: "Really Good Emails", category: "template_lib", description: "Gallery of real-world email designs.", officialUrl: "https://reallygoodemails.com", status: "verified" },
];

const FREE_DOMAINS: Seed[] = [
  { name: "EU.org", category: "free_domain", description: "Free subdomain registration under .eu.org.", officialUrl: "https://nic.eu.org", status: "experimental", riskLevel: "medium", notes: "Manual review process. Nonprofit-friendly." },
  { name: "FreeDNS / afraid.org", category: "free_domain", description: "Free shared subdomains + free DNS hosting.", officialUrl: "https://freedns.afraid.org", status: "experimental", riskLevel: "high", notes: "Shared reputation. Low trust for mass email." },
  { name: "DuckDNS", category: "free_domain", description: "Dynamic DNS subdomain under duckdns.org.", officialUrl: "https://www.duckdns.org", status: "experimental", riskLevel: "high", notes: "For home/dev. Not recommended for mass email." },
  { name: "No-IP (free tier)", category: "free_domain", description: "Dynamic DNS subdomain.", officialUrl: "https://www.noip.com", status: "experimental", riskLevel: "high" },
  { name: "Dynu", category: "free_domain", description: "Free subdomains + DNS.", officialUrl: "https://www.dynu.com", status: "experimental", riskLevel: "high" },
];

const BOUNCE_TOOLS: Seed[] = [
  { name: "Hunter", category: "spam_tool", description: "Email verification — 25/month free.", officialUrl: "https://hunter.io", status: "verified" },
  { name: "NeverBounce", category: "spam_tool", description: "1,000 free on signup.", officialUrl: "https://neverbounce.com", status: "verified" },
  { name: "Mailboxlayer", category: "spam_tool", description: "250 free verifications/month.", officialUrl: "https://mailboxlayer.com", status: "verified" },
  { name: "VerifyBee", category: "spam_tool", description: "100 free verifications.", officialUrl: "https://verifybee.com", status: "verified" },
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

async function main() {
  console.log("🌱 Seeding Got Mail sources...");
  await upsertAll(PROVIDERS);
  await upsertAll(OSS);
  await upsertAll(DNS_TOOLS);
  await upsertAll(SPAM_TOOLS);
  await upsertAll(TEMPLATE_LIBS);
  await upsertAll(FREE_DOMAINS);
  await upsertAll(BOUNCE_TOOLS);

  // Default workspace
  await prisma.workspace.upsert({
    where: { slug: "default" },
    update: {},
    create: {
      name: "My Workspace",
      slug: "default",
      legalName: "",
      postalAddress: "",
      replyTo: "",
      timezone: "America/Los_Angeles",
    },
  });

  console.log("✅ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
