# Got Mail

**"You've got... ethical email."**

Got Mail is a polished, consent-first email platform that helps creators, startups, and small businesses discover trusted free & low-cost email providers, verify their domain setup, and send permission-based campaigns — without torching their sender reputation.

Styled with a modern-retro AOL / Blue's Clues vibe: electric blues, the classic yellow envelope, dial-up-era animations, and a bright, playful UI on top of a serious compliance engine.

---

## What it does

- **Provider Finder** — a live catalog of free & low-cost email providers with daily/monthly limits, features, and source links.
- **Free Source Finder** — research engine that tracks free APIs, open-source newsletter tools, DNS tools, spam checkers, template libraries.
- **Open-Source Tools** — curated list of self-hostable options (listmonk, Mautic, Docker Mailserver, Postal, Mailcow, Mailu, iRedMail).
- **Domain Setup Wizard** — SPF, DKIM, DMARC, return-path, tracking domain, verified sender, deliverability check.
- **Ethical Campaign Builder** — HTML + plain-text, required unsubscribe footer, compliance checklist, spam-risk warnings, link checker.
- **Contact System** — consent status, consent source, consent timestamp, tags, segments, suppression list.
- **Smart Sending Engine** — provider abstraction layer that respects each provider's limits and queues excess sends. Never rotates to evade terms.
- **Deliverability Dashboard** — open/click/bounce/complaint metrics, remaining quota by provider, DNS status, send health.

## What it is NOT

Got Mail is not an "unlimited free email" tool. Good providers cap free sending to protect deliverability. The hard rules:

1. Permission-based email only.
2. Opt-in or imported consent proof required before sending.
3. Unsubscribe links on every marketing email.
4. Sender identity + physical/business address fields on every campaign.
5. CAN-SPAM compliant: no deceptive headers/subject lines, clear ad identification, valid postal address, honored opt-out.
6. Gmail/Yahoo sender rules honored, including one-click unsubscribe for high-volume senders (Google requires it above 5,000 msgs/day).
7. Never rotate providers to evade sending limits.
8. Never scrape addresses. Never send to purchased lists.
9. No "unlimited sending" claims — only smart quota routing, queueing, and compliance-safe scaling.

---

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a custom AOL/Blue's Clues theme
- **Prisma** with **SQLite** for dev (one-line swap to PostgreSQL/Supabase for prod)
- **Zod** for validation
- **React Email / MJML** for templates
- In-DB queue for sending (swap to BullMQ when you add Redis)
- Netlify-ready deploy + GitHub Actions workflow

## Quick start

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

Open http://localhost:3000.

## Deploy

See [DEPLOY.md](./DEPLOY.md) for full steps. TL;DR:

```
DEPLOY.bat         — runs build + push-to-github + triggers Netlify
PUSH_TO_GITHUB.bat — just pushes current code to your configured GitHub repo
```

Netlify auto-deploys from the `main` branch.

## Project docs

- [PROJECT_INSTRUCTIONS.md](./PROJECT_INSTRUCTIONS.md) — product scope and hard rules.
- [COMPLIANCE_CHECKLIST.md](./COMPLIANCE_CHECKLIST.md) — what every campaign must satisfy.
- [FREE_EMAIL_SOURCES.md](./FREE_EMAIL_SOURCES.md) — provider facts and source links.
- [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md) — pre-launch verification.
- [DEPLOY.md](./DEPLOY.md) — deployment guide.

## Testing

```
npm run test:unit        # vitest — compliance + provider quota tests
npm run test             # playwright — e2e (add specs under tests/)
```

## File map (what lives where)

```
prisma/
  schema.prisma          — 20+ models
  seed.ts                — providers, OSS tools, DNS/spam tools, free domains
src/
  app/                   — 24 pages (App Router)
    page.tsx             — Landing
    dashboard/           — Dashboard
    providers/           — Provider Finder
    sources/             — Free Source Finder
    open-source/         — OSS tools
    free-domains/        — Free domain research
    domain-wizard/       — 9-step DNS wizard
    identities/          — my-email / owned-domain / free-domain modes
    provider-setup/      — API keys
    contacts/ segments/ consent/ — audience
    campaigns/ templates/ mass-mode/ queue/ — send
    deliverability/ dns-health/ bounces/ suppression/ unsubscribes/ compliance/ doctor/ warmup/ — health
    settings/            — workspace
    unsubscribe/[token]/ — recipient landing
    api/unsubscribe/[token]/ — one-click header endpoint
  components/
    brand/               — Envelope, PawStripe, YouveGotMailToast
    layout/              — AppShell
    ui/                  — PageHeader, StatCard, Section, Warning, ProgressBar
  lib/
    db.ts                — Prisma client
    providers/           — brevo, mailjet, resend, postmark, sendgrid, smtp (used by gmail+workspace), postal, listmonk, mautic
    compliance/check.ts  — the hard gate
    sending/engine.ts    — batches, throttle, circuit breaker
    queue/worker.ts      — always-on poll loop
tests/                   — compliance, quota, suppression
.github/workflows/       — CI
netlify.toml             — deploy config
DEPLOY.bat / PUSH_TO_GITHUB.bat — Windows one-click deploy
```

## License

MIT. Use it for your business, ethically.
