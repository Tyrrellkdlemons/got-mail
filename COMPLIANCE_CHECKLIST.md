# Compliance Checklist

Every campaign in Got Mail must pass this checklist before the **Send** button unlocks. These rules combine CAN-SPAM (US), GDPR (EU), CASL (Canada), and the Gmail/Yahoo 2024 sender requirements.

## Sender identity

- [ ] Legal business name set on the Workspace.
- [ ] Valid postal/physical address on the Workspace.
- [ ] Sender email verified (double opt-in confirmation OR domain-level verification).
- [ ] Reply-to address monitored and routes to a real inbox.

## Domain authentication

- [ ] Custom domain added.
- [ ] SPF record published and passing.
- [ ] DKIM record published and passing.
- [ ] DMARC record published (p=none acceptable for ramp, p=quarantine/reject recommended).
- [ ] Return-path / bounce domain aligned with the sending domain.
- [ ] Tracking domain CNAME set (only if open/click tracking is enabled).

## Content

- [ ] Subject line is truthful (no deception).
- [ ] No misleading "From" name.
- [ ] No misleading preheader.
- [ ] Plain-text alternative present.
- [ ] Unsubscribe link present, visible, working.
- [ ] One-click unsubscribe header (`List-Unsubscribe-Post: List-Unsubscribe=One-Click`) set — required by Gmail/Yahoo for senders above 5,000/day.
- [ ] Physical address present in footer.
- [ ] Clear marketing identification when the message is promotional.
- [ ] Link checker passed (no 404s, no flagged domains).

## Audience

- [ ] All recipients have `consent_status = VERIFIED`.
- [ ] Consent source and timestamp recorded for every recipient.
- [ ] Unsubscribed contacts excluded.
- [ ] Hard-bounced contacts excluded.
- [ ] Complained contacts excluded.
- [ ] Suppression list checked.
- [ ] No scraped or purchased addresses (attested at import).

## Sending health

- [ ] Provider API key valid.
- [ ] Provider quota available OR send queued for later (no bypassing).
- [ ] 30-day bounce rate under 2%.
- [ ] 30-day complaint rate under 0.1% (Gmail/Yahoo target: <0.3% hard cap).
- [ ] Volume ramp matches warmup plan for new domains/IPs.

## Audit trail

- [ ] Campaign approved by an authorized user (role check).
- [ ] Audit log entry written for the approval.
- [ ] Consent proofs archived for every recipient at send time.

---

## Automated gates in the app

The sending engine blocks sends when any of these is false:

```
isSenderVerified()
hasSpfDkimDmarc()
hasUnsubscribeLink()
hasPhysicalAddress()
recipientsAllConsentVerified()
providerQuotaAvailableOrQueueable()
bounceRateHealthy()
complaintRateHealthy()
```

If any check fails, the UI shows the failing rule and a one-click fix path. Users can never disable these checks — only fix the underlying condition.
