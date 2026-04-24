# Open-Source Email Resources

Catalog of OSS tools Got Mail integrates with, links to, or researches. Every entry is seeded into the `OpenSourceTool` and `SourceResearchItem` tables.

## Newsletter / campaign managers

| Tool | License | Language | Key strength | Link |
|---|---|---|---|---|
| **listmonk** | AGPL | Go | Fastest OSS newsletter manager, bounce handling | listmonk.app |
| **Mautic** | GPLv3 | PHP | Full marketing automation | mautic.org |
| **Keila** | MIT | Elixir | Modern UI, GDPR-first | keila.io |
| **Plunk** | AGPL | TypeScript | Clean developer UX | useplunk.com |
| **Mailcoach** (Spatie) | MIT (core) | PHP/Laravel | Self-hosted MA with Laravel ecosystem | mailcoach.app |
| **Sendportal** | MIT | PHP/Laravel | Campaigns via your own SES/Postmark | sendportal.io |
| **OpenEMM** | AGPL | Java | Enterprise-grade | openemm.org |
| **phpList** | AGPL | PHP | Classic, lightweight | phplist.org |
| **Mailtrain** | GPLv3 | Node.js | Newsletter app with MOSAICO builder | mailtrain.org |
| **Ghost** | MIT | Node.js | Publishing + newsletter | ghost.org |
| **Chaskiq** | AGPL | Ruby | Messaging + email campaigns | chaskiq.io |

## Mail servers / SMTP stacks

| Tool | Language | Highlight | Link |
|---|---|---|---|
| **Docker Mailserver** | shell + Docker | Postfix + Dovecot + Rspamd + ClamAV | docker-mailserver.github.io |
| **Postal** | Ruby | Like SendGrid, self-hosted | postalserver.io |
| **Mailcow** | Docker | Postfix/Dovecot + SOGo webmail | mailcow.email |
| **Mailu** | Docker | Simple Docker mail suite | mailu.io |
| **iRedMail** | shell | One-shot installer | iredmail.org |
| **Modoboa** | Python | Mail hosting + web UI | modoboa.org |
| **Maddy** | Go | All-in-one modern MTA | maddy.email |
| **Stalwart** | Rust | All-in-one, secure defaults | stalw.art |
| **Haraka** | Node.js | High-perf SMTP server | haraka.github.io |
| **WildDuck** | Node.js | Scalable IMAP/POP3 | wildduck.email |
| **OpenSMTPD** | C | OpenBSD, minimal | opensmtpd.org |
| **Exim** | C | Classic MTA | exim.org |

## Webmail

| Tool | Link |
|---|---|
| **Roundcube** | roundcube.net |
| **SOGo** | sogo.nu |
| **Snappymail** | snappymail.eu |

## Dev / local SMTP testing

| Tool | Link |
|---|---|
| **Mailpit** | github.com/axllent/mailpit |
| **MailHog** | github.com/mailhog/MailHog |
| **MailCatcher** | mailcatcher.me |
| **smtp4dev** | github.com/rnwood/smtp4dev |

## Email template frameworks

| Tool | Link |
|---|---|
| **React Email** | react.email |
| **MJML** | mjml.io |
| **Maizzle** | maizzle.com |
| **Foundation for Emails** | get.foundation/emails |
| **Cerberus** | tedgoas.github.io/Cerberus |

## DNS / auth checkers (free)

| Tool | Link |
|---|---|
| MXToolbox | mxtoolbox.com |
| Google Admin Toolbox | toolbox.googleapps.com |
| dmarcian | dmarcian.com |
| Postmark DMARC Digests | dmarc.postmarkapp.com |
| Valimail Monitor | monitor.valimail.com |
| Learn DMARC | learndmarc.com |
| intoDNS | intodns.com |

## Blacklist monitoring (free tier)

| Tool | Link |
|---|---|
| Spamhaus | spamhaus.org |
| MXToolbox Blacklist | mxtoolbox.com/blacklists.aspx |
| MultiRBL.valli.org | multirbl.valli.org |
| HetrixTools | hetrixtools.com |

## Inbox placement (free tier)

| Tool | Link |
|---|---|
| Mail-Tester | mail-tester.com |
| GlockApps | glockapps.com |
| Litmus | litmus.com |
| Email on Acid | emailonacid.com |
| HTML Email Check | htmlemailcheck.com |

## The warning

> Open-source tools can manage large campaigns, but inbox delivery still depends on DNS, domain reputation, IP reputation, bounce rate, complaint rate, recipient consent, and compliance. Self-hosting is a responsibility, not a free pass.
