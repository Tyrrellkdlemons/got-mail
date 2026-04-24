# Got Mail — Checkpoint (2026-04-24)

Snapshot of the project at this point so anyone (including future-you) can pick up where we left off.

---

## Infrastructure

| Service | Identifier | URL | Status |
|---|---|---|---|
| **GitHub repo** | `Tyrrellkdlemons/got-mail` | https://github.com/Tyrrellkdlemons/got-mail | ✅ Public, auto-deploys to Netlify |
| **Netlify site** | `got-mail` | https://got-mail.netlify.app | 🟢 Live, connected to GitHub main |
| **Neon Postgres** | `got-mail` (`steep-hall-70703569`) | https://console.neon.tech/app/projects/steep-hall-70703569 | ✅ AWS US-West-2 Oregon, free tier |
| **Local workspace** | — | `C:\Users\TKDL\Desktop\Emailer\Emailer` | — |

### Netlify env vars (confirmed working)

- `DATABASE_URL` — Neon pooled connection, ends `?sslmode=require&connect_timeout=60`
- `NODE_VERSION=20`
- `NPM_FLAGS=--legacy-peer-deps`
- **NOT set (stay under 4KB):** `NEXTAUTH_SECRET`, `CREDENTIALS_ENCRYPTION_KEY`, `DIRECT_URL`
- Fallback crypto key is derived from DATABASE_URL until a real `CREDENTIALS_ENCRYPTION_KEY` is added.

---

## Pages — all 27 functional

**Live features (user-interactive, real backend):**
- `/dns-health` — live DNS lookups (SPF/DKIM/DMARC/MX) + 6 RBL checks via Google DNS-over-HTTPS
- `/doctor` — deliverability score 0-100 with specific prescriptions per failure
- `/test-send` — actually sends 5 emails through Brevo/Mailjet/Resend/Postmark/SendGrid
- `/identities/my-email` — save SMTP identity with encrypted password
- `/identities/owned-domain` — save domain identity with inline DNS audit
- `/identities/free-domain` — save experimental free-subdomain identity (EU.org, afraid.org, DuckDNS, is-a.dev, js.org)
- `/provider-setup` — validate + save provider API keys encrypted in Neon

**Live data (read from Neon):**
- `/dashboard` — counts, health snapshot, provider quotas
- `/providers`, `/sources`, `/open-source`, `/free-domains` — catalog browsers
- `/contacts`, `/segments`, `/templates`, `/campaigns` — CRUD-ready tables
- `/consent` — SHA-256 hash-chained audit ledger
- `/queue` — live send jobs with batch progress bars
- `/deliverability` — snapshot + history
- `/bounces`, `/suppression`, `/unsubscribes` — monitor lists
- `/warmup` — 10-day ramp visualization + active schedules

**Static:**
- `/` Landing — animated AOL/Blue's Clues hero
- `/domain-wizard` — 9-step DNS setup
- `/mass-mode` — 1,000+ campaign spec
- `/compliance` — 17-item checklist
- `/settings` — workspace identity

---

## API routes

- `GET/POST /api/admin/seed?token=gotmail-seed-2026` — auto-migrate + seed in one hit
- `GET /api/dns-check?domain=&blacklist=1` — live DNS + blacklist check
- `POST /api/identities` — create SendingIdentity (encrypts SMTP password)
- `POST /api/provider-accounts` — validate + save provider API key
- `GET /api/provider-accounts/list` — list connected providers
- `POST /api/test-send` — send real emails through provider
- `POST/GET /api/unsubscribe/[token]` — one-click unsubscribe

---

## Schema (Neon)

25 tables via Prisma: `User`, `Workspace`, `Membership`, `SendingIdentity`, `SMTPAccount`, `ProviderAccount`, `Domain`, `DomainVerification`, `Contact`, `ConsentRecord`, `Segment`, `SegmentMember`, `Suppression`, `Unsubscribe`, `Bounce`, `Complaint`, `EmailTemplate`, `Campaign`, `CampaignRecipient`, `SendJob`, `SendingBatch`, `EmailSend`, `EmailEvent`, `WarmupSchedule`, `DeliverabilityHealth`, `SourceResearchItem`, `AuditLog`.

7 Postgres enums: `Role`, `SendingMode`, `WarmupStatus`, `DomainStatus`, `ConsentStatus`, `CampaignStatus`, `SendJobStatus`.

---

## Seed data (99+ items)

- **15 providers** (Brevo, Mailjet, Resend, Postmark, SendGrid, Mailgun Flex, SMTP2GO, Elastic Email, Amazon SES, MailerSend, Mailtrap, Sweego, Gmail/Workspace, Loops, Courier)
- **14 OSS newsletter platforms** (listmonk, Mautic, Keila, Plunk, Mailcoach, Sendportal, OpenEMM, phpList, Mailtrain, Ghost, Chaskiq, Novu, Knock, Buttondown)
- **12 OSS mail servers** (Postal, Docker Mailserver, Mailcow, Mailu, iRedMail, Modoboa, Maddy, Stalwart, Haraka, WildDuck, OpenSMTPD, Exim)
- **4 dev SMTP catchers** (Mailpit, MailHog, MailCatcher, smtp4dev)
- **10 DNS tools** · **10 spam/inbox tools** · **8 template libraries** · **5 free-domain sources** · **15 adjacent OSS infra**
- **Sample workspace** with domain, SendingIdentity, template, segment, 3 contacts (Ada/Grace/Alan), suppression, draft campaign, warmup schedule, deliverability snapshot

---

## Batch files (Windows)

- **`DEPLOY.bat`** — commits + pushes to GitHub → Netlify auto-builds
- **`PUSH_TO_GITHUB.bat`** — first-time git init + remote wire + push
- **`SEED_DATABASE.bat`** — local seed (resilient against Windows Defender EPERM)

All three are PowerShell wrappers that stay open after execution so you can read the output.

---

## Remaining TODOs (future work)

- **Real contact import** — CSV upload handler (`POST /api/contacts/import`)
- **Real campaign creation form** — extend `/test-send` pattern into `/campaigns/new`
- **Queue worker for DB-backed sends** — wire `/api/cron/process-queue` to a Netlify scheduled function
- **Webhook handlers per provider** — `/api/webhooks/brevo`, `/api/webhooks/mailjet`, etc., using the existing `provider.handleWebhook()` interface
- **Auth** — NextAuth with email magic link (requires `NEXTAUTH_SECRET` env var, which we can add back now that env budget is healthier)
- **Set `SEED_TOKEN`** in Netlify env to override the default `gotmail-seed-2026`
- **Add `CREDENTIALS_ENCRYPTION_KEY`** to Netlify so the crypto fallback isn't used in production (cryptographically stronger)

---

## How to resume

Clone this folder or the GitHub repo. Then:

```bash
cp .env.example .env
# Paste your Neon DATABASE_URL into .env
npm install --legacy-peer-deps
npm run db:push
npm run db:seed
npm run dev
```

Or, to deploy changes:

```bat
DEPLOY.bat
```

Or, to just seed Neon from production without local setup:

```
Open: https://got-mail.netlify.app/api/admin/seed?token=gotmail-seed-2026
```

---

## Documentation

- `README.md` — overview
- `PROJECT_INSTRUCTIONS.md` — hard rules
- `COMPLIANCE_CHECKLIST.md` — CAN-SPAM/GDPR/CASL gates
- `DELIVERABILITY_RULES.md` — Gmail/Yahoo 2024 rules, warmup
- `DNS_SETUP_GUIDE.md` — SPF/DKIM/DMARC guide
- `FREE_EMAIL_SOURCES.md`, `OPEN_SOURCE_EMAIL_RESOURCES.md`, `FREE_DOMAIN_SOURCES.md` — catalogs
- `MASS_EMAIL_MODE.md` — 4 sending modes + batching spec
- `BATCH_SENDING.md` — engine design
- `DEPLOY.md` — deployment guide
- `NEON_SETUP.md` — Neon-specific setup
- `SEED.md` — seeding guide
- `LAUNCH_CHECKLIST.md` — pre-launch verification
- **`CHECKPOINT.md`** — this file
