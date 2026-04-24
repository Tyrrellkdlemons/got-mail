# Free & Open-Source Email Sources

Everything in Got Mail's research catalog. Limits change — every entry has a `last_checked` field in the database. Re-verify monthly.

---

## Free / low-cost email sending providers

| Provider | Free / Trial Limit | SMTP | API | Webhooks | Marketing | Transactional | Official Source |
|---|---|---|---|---|---|---|---|
| **Brevo** (ex-Sendinblue) | 300 emails/day | ✅ | ✅ | ✅ | ✅ | ✅ | brevo.com/pricing |
| **Mailjet** | 6,000/month, 200/day | ✅ | ✅ | ✅ | ✅ | ✅ | mailjet.com/pricing |
| **Resend** | 100/day, 3,000/month | ❌ | ✅ | ✅ | ⚠️ (transactional-leaning) | ✅ | resend.com/pricing |
| **Postmark** (developer plan) | 100/month | ✅ | ✅ | ✅ | ❌ | ✅ | postmarkapp.com/pricing |
| **SendGrid** | 60-day trial, 100/day | ✅ | ✅ | ✅ | ✅ | ✅ | sendgrid.com/pricing |
| **Mailgun Flex** | 100/day (trial) | ✅ | ✅ | ✅ | ⚠️ | ✅ | mailgun.com/pricing |
| **SMTP2GO** | 1,000/month, 200/day | ✅ | ✅ | ✅ | ✅ | ✅ | smtp2go.com/pricing |
| **Elastic Email** | 100/day free | ✅ | ✅ | ✅ | ✅ | ✅ | elasticemail.com/pricing |
| **Amazon SES** | 62,000/mo from EC2 | ✅ | ✅ | ✅ | ✅ | ✅ | aws.amazon.com/ses |
| **Mailersend** | 3,000/month | ✅ | ✅ | ✅ | ✅ | ✅ | mailersend.com/pricing |
| **Mailtrap** (email API) | 1,000/month | ✅ | ✅ | ✅ | ⚠️ | ✅ | mailtrap.io/pricing |
| **Sweego** | 500/day free | ✅ | ✅ | ✅ | ✅ | ✅ | sweego.io |
| **Gmail / Workspace SMTP** | ~500/day (personal), ~2,000/day (Workspace) | ✅ | ⚠️ | ❌ | ❌ | ⚠️ (low volume only) | support.google.com |

> Google Workspace has a per-user/per-day sending cap. Do not treat it as unlimited. Exceeding the cap temporarily disables sending.

---

## Open-source sending & newsletter platforms (self-host)

| Tool | What it is | License | Link |
|---|---|---|---|
| **listmonk** | Self-hosted newsletter & mailing list manager. Very fast, Go-based. | AGPL | listmonk.app |
| **Mautic** | Full open-source marketing automation suite. | GPLv3 | mautic.org |
| **Keila** | Modern newsletter tool, Elixir/Phoenix. | MIT | keila.io |
| **Plunk** | Open-source email marketing platform with a clean UI. | AGPL | useplunk.com |
| **Mailcoach** (Spatie) | Self-hosted mailing list + transactional. | MIT (core) | mailcoach.app |
| **Sendportal** | Laravel-based email campaign manager. | MIT | sendportal.io |
| **OpenEMM** | Enterprise-grade OSS marketing suite. | AGPL | openemm.org |
| **phpList** | One of the oldest OSS newsletter managers. | AGPL | phplist.org |
| **Mailtrain** | Self-hosted newsletter app (Node.js). | GPLv3 | mailtrain.org |
| **Ghost** | Publishing + newsletter platform. | MIT | ghost.org |
| **Chaskiq** | Messaging platform with email campaigns. | AGPL | chaskiq.io |

## Open-source mail servers / SMTP stacks

| Tool | What it is | Link |
|---|---|---|
| **Docker Mailserver** | Production-ready full stack (Postfix, Dovecot, Rspamd, ClamAV). | docker-mailserver.github.io |
| **Postal** | Mail delivery platform for outgoing mail. | postalserver.io |
| **Mailcow** | Dockerized mail server (Postfix + Dovecot + SOGo). | mailcow.email |
| **Mailu** | Dockerized mail server suite. | mailu.io |
| **iRedMail** | Full mail server stack installer. | iredmail.org |
| **Modoboa** | Mail hosting + management UI. | modoboa.org |
| **Maddy** | Modern modular all-in-one mail server in Go. | maddy.email |
| **Stalwart Mail Server** | Rust-based all-in-one mail server. | stalw.art |
| **Haraka** | Node.js SMTP server, very fast, pluggable. | haraka.github.io |
| **WildDuck** | Scalable IMAP/POP3 server used by large providers. | wildduck.email |
| **OpenSMTPD** | OpenBSD's SMTP daemon, minimal & secure. | opensmtpd.org |
| **Exim** | Classic MTA still widely deployed. | exim.org |

## Dev / local SMTP testing

| Tool | Link |
|---|---|
| **Mailpit** | github.com/axllent/mailpit |
| **MailHog** | github.com/mailhog/MailHog |
| **MailCatcher** | mailcatcher.me |
| **smtp4dev** | github.com/rnwood/smtp4dev |

## DNS / authentication checkers (free)

| Tool | Purpose | Link |
|---|---|---|
| **MXToolbox** | SPF/DKIM/DMARC/MX/blacklist lookups. | mxtoolbox.com |
| **Google Admin Toolbox** | CheckMX, Dig, Email Log Search. | toolbox.googleapps.com |
| **dmarcian** | DMARC record generator + monitoring. | dmarcian.com |
| **Postmark DMARC Digests** | Free DMARC aggregation. | dmarc.postmarkapp.com |
| **Valimail Monitor** | Free DMARC monitoring. | monitor.valimail.com |
| **Learn DMARC** | Interactive DMARC explainer. | learndmarc.com |
| **DNS Checker** | Global propagation checker. | dnschecker.org |
| **intoDNS** | DNS record health. | intodns.com |

## Inbox placement / spam testing (free tier)

| Tool | Purpose |
|---|---|
| **Mail-Tester.com** | 10/10 spam score check. |
| **GlockApps** | Inbox placement testing (free trial). |
| **Litmus** | Email preview & testing (free trial). |
| **Email on Acid** | Same. Free trial. |
| **HTML Email Check** | Validate HTML email code. |
| **Spamhaus Lookup** | Check if an IP/domain is listed. |

## Email template / design resources (free)

| Tool | Purpose | Link |
|---|---|---|
| **React Email** | Components for building emails in React. | react.email |
| **MJML** | Markup language that compiles to responsive HTML. | mjml.io |
| **Maizzle** | Framework for rapid email dev with Tailwind. | maizzle.com |
| **Foundation for Emails** | Responsive email framework. | get.foundation/emails |
| **Cerberus** | Battle-tested responsive HTML email patterns. | tedgoas.github.io/Cerberus |
| **Really Good Emails** | Gallery of real-world email designs. | reallygoodemails.com |
| **Unlayer** (community) | Free drag-and-drop builder. | unlayer.com |

## Bounce / verification (free tier)

| Tool | Free Tier | Link |
|---|---|---|
| **Hunter** | 25 verifications/month free. | hunter.io |
| **NeverBounce** | 1,000 free on signup. | neverbounce.com |
| **Mailboxlayer** | 250/month free. | mailboxlayer.com |
| **VerifyBee** | 100 free. | verifybee.com |

---

## Important warning

> **Self-hosting is not unlimited trusted sending.** Deliverability depends on IP reputation, domain authentication, warmup, bounce handling, complaint rates, list quality, and compliance. Running your own mail server on a cloud IP with no warmup means you land in spam.

Every entry in Got Mail's database is marked with one of:

- `verified` — facts confirmed against the official source.
- `needs_review` — stale, re-check.
- `trial_only` — time-limited trial, not a permanent free tier.
- `outdated` — details have changed.
- `removed` — no longer exists.
