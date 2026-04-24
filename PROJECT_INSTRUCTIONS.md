# Project Instructions — Got Mail

## North-star goal
Build a polished, compliance-first email platform that helps people create and send permission-based emails using trusted free or low-cost providers. The platform researches, compares, and organizes free email sending sources, but it must never bypass limits, spam protections, unsubscribe requirements, or provider terms.

## Hard rules

The app MUST:

1. Only support permission-based email.
2. Require opt-in or imported consent proof before sending campaigns.
3. Include unsubscribe links on every marketing email.
4. Include sender identity and physical/business address fields for compliance.
5. Follow CAN-SPAM requirements (no deceptive headers/subject lines, clear ad identification, valid postal address, opt-out handling).
6. Follow Gmail/Yahoo sender rules, including authentication and one-click unsubscribe for senders above 5,000 messages/day.
7. Never rotate providers to evade sending limits.
8. Never scrape random email addresses.
9. Never send to purchased lists.
10. Never advertise "unlimited sending". Instead, offer smart quota routing, queueing, and compliance-safe scaling.

## Product principle

> **Build a consent-based, reputation-safe, legally compliant email system.**
> Every feature should push users toward deliverability health, not around it.

## Page inventory

1. Landing
2. Dashboard
3. Provider Finder
4. Free Source Finder
5. Open-Source Tools
6. Domain Setup Wizard
7. Contacts
8. Segments
9. Campaign Builder
10. Templates
11. Sending Queue
12. Deliverability Health
13. Compliance Checklist
14. Settings
15. Provider Setup (API keys)

## Provider modules

Each provider under `src/lib/providers/` must expose:

```
sendEmail()
getQuota()
validateApiKey()
handleWebhook()
supportsMarketing()
supportsTransactional()
```

Seed providers with these known limits (facts current as of build date — re-check monthly):

| Provider | Free limit | Notes |
|---|---|---|
| Brevo | 300 emails/day | SMTP + API, marketing + transactional |
| Mailjet | 6,000/month, 200/day | SMTP + API |
| Resend | 100/day, 3,000/month | Developer-first transactional |
| Postmark | 100/month (dev plan) | Transactional only |
| SendGrid | 100/day, 60-day trial | Trial only — not a free tier |
| Generic SMTP | varies | Gmail/Workspace caps apply |

## Compliance gate

Every campaign must pass ALL of these before it can send:

- Verified sender identity.
- Verified domain or sender email.
- SPF, DKIM, DMARC status recorded.
- Unsubscribe link present.
- Physical/business address present.
- No deceptive subject line (heuristic check).
- Recipients are consent-verified only.
- Suppression list checked (unsubscribes, bounces, complaints excluded).
- Provider quota available OR email queued for later.
- Bounce/complaint health acceptable.

## Data model (Prisma)

User, Workspace, ProviderAccount, Contact, ConsentRecord, Segment, Campaign, EmailTemplate, EmailSend, EmailEvent, Suppression, Unsubscribe, Bounce, Complaint, DomainVerification, AuditLog, SourceProviderResearchItem.

## Engineering rules

- Never hardcode secrets. Use environment variables.
- Validate all forms with Zod.
- Server-side enforcement of unsubscribe and suppression (never client-only).
- Audit logs for imports, sends, provider changes, campaign approvals.
- Database migrations tracked in git.
- Placeholder API keys only in `.env.example`.
- Back up existing files before destructive changes.

## Theme

Animated retro-AOL meets Blue's Clues — classic AOL blue, electric "Blue's Clues" cyan, the iconic yellow envelope, dial-up-era loading animations, chunky rounded cards, and a bright playful feel on top of a serious compliance UI.
