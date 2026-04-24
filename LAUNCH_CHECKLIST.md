# Launch Checklist

Before you point Got Mail at real recipients.

## Code

- [ ] `.env` populated (never committed).
- [ ] `npm install` clean.
- [ ] `npx prisma migrate deploy` succeeds.
- [ ] `npx prisma db seed` populated providers and open-source tools.
- [ ] `npm run build` passes.
- [ ] `npm run test` passes (compliance + quota tests).
- [ ] No secrets in client bundles (check `out/` or `.next/`).

## Provider accounts

- [ ] At least one provider connected (Brevo, Mailjet, Resend, SES, etc.).
- [ ] Provider API key tested via Settings → Provider Setup → Validate.
- [ ] Webhook URL configured on the provider side for bounces/complaints.
- [ ] Webhook signature/secret stored.

## Sender identity

- [ ] Workspace has legal business name.
- [ ] Workspace has valid postal address.
- [ ] Verified From email address.
- [ ] Reply-to monitored.

## Domain

- [ ] Custom domain added in Domain Wizard.
- [ ] SPF record published + green in Got Mail.
- [ ] DKIM record published + green.
- [ ] DMARC record published + green.
- [ ] Return-path configured.
- [ ] DMARC reports routing to a monitored address.
- [ ] Test send lands in Gmail inbox (not Promotions, not Spam).

## Contacts

- [ ] All contacts have a `consent_status` of VERIFIED or IMPORTED_WITH_PROOF.
- [ ] CSV import includes consent source, timestamp, IP/UA where possible.
- [ ] Suppression list imported from prior system (if migrating).

## Compliance

- [ ] COMPLIANCE_CHECKLIST.md reviewed.
- [ ] Physical address in default footer.
- [ ] Unsubscribe link in default footer.
- [ ] One-click unsubscribe header enabled.
- [ ] Privacy policy linked.
- [ ] Terms of service linked.

## Warmup

- [ ] If new domain: Warmup Autopilot enabled.
- [ ] Day 1 cap set to 50 or less.
- [ ] Engaged-recipient-first priority enabled.

## Monitoring

- [ ] Google Postmaster Tools domain verified.
- [ ] Yahoo SNDS (Smart Network Data Services) opted-in.
- [ ] Microsoft SNDS opted-in.
- [ ] Blacklist monitoring enabled (HetrixTools or similar).
- [ ] Deliverability Doctor premium feature configured (optional).

## Operations

- [ ] Backup strategy for DB in place.
- [ ] Audit log retention policy set.
- [ ] Admin access limited to named users.
- [ ] Rate limits configured on public endpoints.
- [ ] CSRF + input validation on all forms (Zod).
- [ ] Error monitoring wired up (Sentry or similar).

## Go-live

- [ ] Send one real campaign to a list of 10 known-consenting recipients.
- [ ] Confirm all 10 inbox (not spam).
- [ ] Confirm unsubscribe link works end-to-end.
- [ ] Confirm bounce webhook fires on test bounce.
- [ ] Confirm complaint handling on test complaint.
- [ ] Celebrate. 📬
