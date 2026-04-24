# Batch Sending Engine — Spec

This is the core protection that keeps your domain out of blacklists when you blast a big list.

## The user experience

1. User opens **Contacts**, filters a segment ("all verified + tag:newsletter"), and selects 1,000+ contacts in one click with a "Select all 1,247 matching contacts" checkbox.
2. User attaches the selection to a campaign.
3. Campaign passes the compliance checklist.
4. User clicks **Send**.
5. The UI says: *"Got Mail will deliver these 1,247 emails in controlled batches over ~2 hours, pausing automatically if bounce or complaint rates spike."*
6. User watches the **Sending Queue** live-update with throughput, errors, and circuit-breaker state.

## The engine (server-side)

On **Send**, the server:

1. Creates a `SendJob` row with the campaign id and candidate recipient ids.
2. Re-filters candidates at job creation time:
   - Drop any `consent_status != VERIFIED`.
   - Drop any `Suppression`, `Unsubscribe`, `Bounce(hard)`, `Complaint`.
   - Drop duplicates (per-address).
   - Drop role addresses if the workspace setting excludes them (info@, postmaster@, etc.).
3. Splits recipients into `Batch` rows of configurable size (default 50).
4. Assigns each batch a `send_after` timestamp based on:
   - Provider's per-second, per-minute, per-hour, per-day limits.
   - Warmup schedule (see below) for new domains/IPs.
   - Quiet hours (don't send to US recipients at 3am their local time).
5. A worker loop picks the next ready batch, calls the provider's `sendEmail()` for each recipient, records `EmailSend` + `EmailEvent` rows, updates `SendJob.progress`.
6. After every batch:
   - Recompute rolling bounce rate & complaint rate across the last N sends.
   - If bounce rate > 2% OR complaint rate > 0.1% in the window, **auto-pause** the job and alert the user.
   - Re-check suppression list (a user may have unsubscribed mid-job).
7. On completion, archive consent proofs for every recipient at send-time into the audit trail.

## Warmup Autopilot (premium feature)

For new domains or IPs, the engine ramps volume gradually:

| Day | Max sends / day |
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
| 10+ | 15,000 then 2x daily to target |

- Prioritize engaged recipients first (opened in last 30 days).
- Schedule over business hours in the recipient's timezone.
- Spread sends smoothly (e.g. every N seconds) rather than bursting at midnight.

## Throttle defaults by provider (from provider config)

Got Mail reads each provider's config for:

```ts
{
  perSecond: number | null,
  perMinute: number | null,
  perHour: number | null,
  perDay: number | null,
  perMonth: number | null,
  burstCapacity: number | null,
  warmupAware: boolean
}
```

The rate limiter enforces the most restrictive bucket. Hitting a cap doesn't "rotate" — it **queues**.

## Circuit breaker thresholds

```
BOUNCE_RATE_WINDOW = last 500 sends or 24h whichever is larger
BOUNCE_RATE_PAUSE_AT = 2.0%
COMPLAINT_RATE_WINDOW = last 1000 sends or 7d
COMPLAINT_RATE_PAUSE_AT = 0.1%
RAPID_UNSUB_PAUSE_AT = 5% unsubscribes in the last 100 sends
```

When tripped, the job goes to `status=PAUSED_CIRCUIT_BREAKER` with the reason logged. The user clears it manually after investigation.

## "Select all 1,247" semantics

The UI uses server-side selection tokens, not a client array of IDs:

```
POST /api/contacts/selection
  body: { filter: {...}, excludeIds: [...] }
  returns: { selection_id, count }

POST /api/campaigns/:id/recipients
  body: { selection_id }
```

This lets users select millions of contacts without the browser ever holding the full ID list. The selection is materialized into batches server-side.

## Hard guarantees

- Bulk select CANNOT bypass the compliance checklist.
- Bulk select CANNOT bypass suppression.
- Bulk select CANNOT push past a provider's quota — it queues.
- The UI never shows an "unlimited sending" mode.
- If the user configures a fallback provider, a send only moves to it when the primary is legitimately unavailable (quota exhausted, API down) and the fallback supports the message type under its own terms.
