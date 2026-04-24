# Deliverability Rules

Rules the app enforces to keep Got Mail users out of spam folders and off blacklists.

## Authentication (required)

- **SPF**: include the sending provider, aligned with the From domain.
- **DKIM**: 2048-bit, rotated annually, signed by the sending provider.
- **DMARC**: `v=DMARC1; p=none` minimum for ramp, move to `p=quarantine` then `p=reject` once you pass.
- **Return-Path / MAIL FROM**: aligned with the From domain (bounce handling lives here).
- **Reverse DNS (PTR)**: required if self-hosting on a cloud IP.

## Gmail/Yahoo 2024 sender rules

- Authenticate with SPF + DKIM.
- Publish a DMARC record on the From domain.
- Keep spam complaint rate below 0.3% (target < 0.1%).
- Support one-click unsubscribe for bulk sending (above 5,000 msgs/day to Gmail users).
- Use `List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click` headers.

## CAN-SPAM (US)

- No deceptive headers or From/Reply-To.
- No misleading subject line.
- Clear identification when the message is an advertisement.
- Valid physical postal address.
- Honor opt-out within 10 business days, forever.

## GDPR (EU)

- Lawful basis for processing (usually consent).
- Consent is freely given, specific, informed, unambiguous.
- Record the consent (source, timestamp, IP/UA, opt-in method).
- Provide easy withdrawal.
- Data minimization: only collect fields you need.

## CASL (Canada)

- Express or implied consent required.
- Sender identification required.
- Working unsubscribe mechanism required.

## Warmup (new domain or IP)

Ramp schedule built into the Warmup Autopilot:

| Day | Max sends |
|---:|---:|
| 1 | 50 |
| 2 | 100 |
| 3 | 200 |
| 4 | 400 |
| 5 | 800 |
| 6 | 1,500 |
| 7 | 3,000 |
| 8 | 5,000 |
| 9 | 8,000 |
| 10+ | gradual double-until-target |

- Prioritize engaged recipients.
- Spread sends over business hours.
- Skip weekends during warmup.

## List hygiene

- Remove hard bounces immediately.
- Remove spam complaints immediately.
- Re-engage or sunset inactive subscribers (no opens/clicks for 6+ months).
- Never email addresses that have unsubscribed — ever.
- Validate at import (syntax, MX, role addresses flagged).

## Content

- Plain-text alternative always present.
- Image/text ratio balanced.
- Avoid spammy trigger phrases.
- No all-caps subject lines.
- No "RE:" or "FWD:" deception.
- Links to reputable domains only.

## Infrastructure

- Dedicated IP only if consistent high-volume (≥ 50k/month).
- Shared IPs fine for low volume — pick a reputable pool.
- Monitor blacklists (Spamhaus, SORBS, Barracuda, etc.).
- Monitor Google Postmaster Tools.
- Monitor Yahoo Smart Network Data Services.
- Monitor Microsoft SNDS.
