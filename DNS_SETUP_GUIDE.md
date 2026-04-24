# DNS Setup Guide

The Domain Setup Wizard in Got Mail walks through all of this interactively. This document is the reference it pulls from.

## 1. Add your domain

Use a domain you own (e.g. `yourcompany.com`) — not a free subdomain for serious sending.

## 2. SPF (Sender Policy Framework)

Add ONE TXT record at the root of your domain:

```
v=spf1 include:<provider-spf> ~all
```

Common provider includes:

| Provider | include |
|---|---|
| Brevo | `include:spf.brevo.com` |
| Mailjet | `include:spf.mailjet.com` |
| Resend | `include:amazonses.com` |
| Postmark | `include:spf.mtasv.net` |
| SendGrid | `include:sendgrid.net` |
| Amazon SES | `include:amazonses.com` |
| Google Workspace | `include:_spf.google.com` |

## 3. DKIM (DomainKeys Identified Mail)

Most providers give you 1–3 CNAME records. Example (Resend):

```
resend._domainkey    CNAME    resend._domainkey.resend.com
```

Some providers give you a TXT record with a public key instead. Copy what they give you.

## 4. DMARC

Start with `p=none` to collect reports, then tighten:

```
_dmarc    TXT    "v=DMARC1; p=none; rua=mailto:dmarc@yourcompany.com; fo=1"
```

After a few weeks of clean reports, move to `p=quarantine`, then `p=reject`.

## 5. Return-Path / MAIL FROM

Align bounce handling with your sending domain. Providers usually give you a CNAME:

```
bounces    CNAME    bounces.brevo.com
```

## 6. Tracking domain (optional)

Only set this up if you enable open/click tracking:

```
track    CNAME    track.provider.com
```

## 7. MX (only if you receive email on this domain)

If you just send, you don't need MX records for sending. If you want replies to a custom domain:

```
@    MX    1    mail.yourdomain.com
```

## 8. Verify

Use any of these free tools:

- MXToolbox (mxtoolbox.com)
- Google Admin Toolbox (toolbox.googleapps.com)
- dmarcian
- Got Mail's built-in DNS check (Domain Setup Wizard → Verify)

## 9. Send test email

The wizard's last step sends a test to your verified address and shows:

- SPF pass/fail
- DKIM pass/fail
- DMARC alignment
- Delivery time
- Headers dump
- Mail-Tester-style score

## Common gotchas

- **Multiple SPF records** — only one TXT record at the root starting with `v=spf1`. Merge `include:`s into one.
- **DMARC too strict too fast** — stay on `p=none` until reports are clean.
- **Subdomain vs root** — DMARC at `_dmarc.yourcompany.com` covers the root AND subdomains by default.
- **Tracking domain mismatch** — if your From is `yourcompany.com` and tracking is `somerandom.com`, alignment fails. Use a subdomain of your main domain.
- **DNS propagation** — TTL times mean changes take minutes to hours. Don't panic.
