# Seeding the Database — Got Mail

When the app is empty (Provider Finder shows zero, Dashboard shows `0`/`—`),
your Neon database has no tables or data yet. This is a one-time setup.

## The easy way (recommended)

Double-click **`SEED_DATABASE.bat`** in the project folder. It does everything:

1. Verifies Node.js is installed.
2. Creates a local `.env` from `.env.example` if missing.
3. Prompts you to paste your Neon `DATABASE_URL` if `.env` still has the SQLite placeholder.
4. Runs `npm install` (one-time, ~1 minute).
5. Runs `prisma generate` (creates the client library).
6. Runs `prisma db push --accept-data-loss` (creates all tables in Neon).
7. Runs `tsx prisma/seed.ts` (populates everything).

A PowerShell window stays open so you can read the output. Press any key to close.

## What gets seeded

### `SourceResearchItem` — 80+ free & OSS resources

| Category | Count | Examples |
|---|---:|---|
| Free email providers | 15 | Brevo, Mailjet, Resend, Postmark, SendGrid, SMTP2GO, Elastic Email, SES, MailerSend, Mailtrap, Sweego, Loops, Courier, Gmail, + more |
| OSS newsletter platforms | 14 | listmonk, Mautic, Keila, Plunk, Mailcoach, Sendportal, OpenEMM, phpList, Mailtrain, Ghost, Chaskiq, Novu, Knock, Buttondown |
| OSS mail servers | 12 | Postal, Docker Mailserver, Mailcow, Mailu, iRedMail, Modoboa, Maddy, Stalwart, Haraka, WildDuck, OpenSMTPD, Exim |
| Dev-mode SMTP testers | 4 | Mailpit, MailHog, MailCatcher, smtp4dev |
| DNS / auth tools | 10 | MXToolbox, Google Admin Toolbox, dmarcian, Postmark DMARC Digests, Valimail, Learn DMARC, DNS Checker, intoDNS, DigWebInterface, whatsmydns.net |
| Spam / inbox tests | 10 | Mail-Tester, GlockApps, Litmus, Email on Acid, HTML Email Check, Spamhaus, Hunter, NeverBounce, Mailboxlayer, Can I email? |
| Template libraries | 8 | React Email, MJML, Maizzle, Foundation for Emails, Cerberus, Really Good Emails, Good Email Code, HTMLEmail.io |
| Free-domain sources | 5 | EU.org, FreeDNS, DuckDNS, is-a.dev, js.org |
| Adjacent OSS infrastructure | 15 | Supabase, Neon, Turso, Railway, Render, Fly.io, Plausible, Umami, PostHog, Sentry, Uptime Kuma, n8n, Authentik, Zitadel, Cloudflare Turnstile |

### Sample workspace (so Dashboard shows real numbers)

- **Workspace** — "My Workspace" with legal name + SF postal address.
- **Domain** — `gotmail.example`, SPF/DKIM/DMARC/return-path all marked `PASS`.
- **SendingIdentity** — Owned-Domain mode, `news@gotmail.example`, warmup in progress.
- **WarmupSchedule** — day 2, cap 100.
- **EmailTemplate** — compliant welcome email with unsubscribe token + physical address.
- **Segment** — "VIP — opted-in newsletter".
- **Contacts** — 3 consent-verified: Ada Lovelace, Grace Hopper, Alan Turing.
- **ConsentRecord** — tamper-evident hash for each opt-in.
- **Suppression** — sample hard-bounce entry.
- **Campaign** — "April 2026 newsletter" in DRAFT status, linked to the VIP segment.
- **DeliverabilityHealth** — 30-day snapshot: 0.4% bounce, 0.02% complaint, 97% inbox.

## Re-running is safe

The seed uses `upsert` and `findFirst ?? create` patterns on unique fields
(name/email/slug), so running it twice won't create duplicates. Run it any
time you want to refresh the catalog after updating `prisma/seed.ts`.

## Manual alternative

If you'd rather run the commands yourself:

```bash
# in the project folder
cp .env.example .env
# edit .env and paste your Neon DATABASE_URL

npm install --legacy-peer-deps
npx prisma generate
npx prisma db push --accept-data-loss
npx tsx prisma/seed.ts
```

## Where to get the Neon URL

1. https://console.neon.tech/app/projects/steep-hall-70703569
2. Click **Connect** (top right).
3. Ensure **Connection pooling** is ON.
4. Click **Copy snippet** to grab the pooled connection string.
5. Paste it into `.env` as `DATABASE_URL` (in quotes).

**Never commit `.env`** — it's already in `.gitignore`.
