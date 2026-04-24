# 1,000+ Mass Campaign Mode

Got Mail lets users build campaigns aimed at 1,000+ recipients, but it never advertises "unlimited sending." Instead the app layers queueing, batching, throttling, warmup, bounce handling, complaint monitoring, and compliance gates on top of whatever provider the user is sending through.

## The four sending modes

Users pick one per Sending Identity.

### Mode 1 — Send From My Email
Connect a personal mailbox via SMTP or API (Gmail, Google Workspace, Outlook, Zoho, custom SMTP, business email).

- Required: SMTP host, port, username, password/app password, from-name, from-email, reply-to, daily limit, hourly limit, warmup status, provider type.
- Google Workspace caps: 2,000 messages/day per user, 1,500 for mail merge, 500 for trial accounts. Enforced in code.
- Free Gmail shows an explicit "not ideal for 1,000+ campaigns" warning. Enforced with a soft limit.
- App never assumes unlimited. All limits stored per-account and enforced by the queue.

### Mode 2 — Send From My Owned Domain (recommended)
Connect a domain the user owns.

- DNS wizard walks through SPF, DKIM, DMARC, MX, return-path/bounce domain, optional tracking domain.
- 1,000+ sending is blocked until DNS verification passes.
- Domain health panel shows SPF ✅, DKIM ✅, DMARC ✅, Bounce handling ✅, Complaint rate, Unsub endpoint, Reputation.

### Mode 3 — Send From Free Domain/Subdomain (experimental)
Research and connect free domain or subdomain options.

- Seeded: EU.org (free subdomain registration), FreeDNS / afraid.org (shared subdomains).
- Labeled **EXPERIMENTAL / LOW-TRUST** in the UI.
- Big inline warning: "Free domains/subdomains may work for testing but aren't ideal for trusted mass email. Use a real owned domain for serious sending."
- Never uses disposable domains. Never rotates free domains to evade reputation systems.

### Mode 4 — Send Through Open-Source Infrastructure
Connect to a self-hosted stack.

- Supported: listmonk, Mautic, Postal, Docker Mailserver, Mailtrain, OpenEMM, Roundcube, Haraka, Keila, Plunk, Mailcoach, Sendportal, phpList, Stalwart, Maddy, Mailcow, Mailu, iRedMail, Modoboa, WildDuck.
- Big inline warning: "Self-hosting ≠ unlimited trusted sending. Inbox delivery still depends on DNS, domain reputation, IP reputation, bounce/complaint rates, recipient consent, and compliance."

## Bulk selection UX

- Contacts table supports "Select all 1,247 matching contacts" — a server-side selection token, not a giant array in the browser.
- Attach selection to campaign with one click.
- UI tells the user exactly what will happen: *"1,247 emails will be delivered in batches over ~2 hours. Sending auto-pauses if bounce or complaint rates spike."*

## Backend flow

1. **Create SendJob** — materialize the filtered recipient set into `CampaignRecipient` rows.
2. **Re-filter at job time** — drop unsub / bounce / complaint / suppression / unverified consent.
3. **Split into SendingBatch rows** — default size 50, based on provider's per-second/minute/hour/day limits + warmup ramp.
4. **Worker loop** — pick next ready batch, call provider, write `EmailSend` + `EmailEvent`.
5. **After every batch** — recompute rolling bounce & complaint rates; if over threshold → `PAUSED_CIRCUIT_BREAKER`.
6. **Live progress** — dashboard shows sent / queued / failed / bounced / unsubscribed / complained in real time.
7. **Retry policy** — retry 4xx temporary failures with exponential backoff; never retry permanent (5xx hard) bounces.

## Thresholds

```
BOUNCE_RATE_PAUSE_AT      = 2.0%   (rolling, last 500 sends or 24h)
COMPLAINT_RATE_PAUSE_AT   = 0.1%   (rolling, last 1000 sends or 7d)
RAPID_UNSUB_PAUSE_AT      = 5.0%   (last 100 sends)
UNSUB_ENDPOINT_DOWN       = auto-pause + alert
DNS_HEALTH_BROKEN         = auto-pause + alert
PROVIDER_QUOTA_REACHED    = queue, don't rotate
```

## Mass-send pre-flight checklist (hard gate)

Blocked until all pass:

- [ ] Recipients all consent-verified.
- [ ] Unsubscribed / bounced / complained / suppressed excluded.
- [ ] Sender identity complete (name + address).
- [ ] Unsubscribe link + `List-Unsubscribe` + `List-Unsubscribe-Post: List-Unsubscribe=One-Click`.
- [ ] Physical address in footer.
- [ ] SPF / DKIM / DMARC verified (for Owned Domain mode).
- [ ] Provider connection valid and quota not negative.
- [ ] Bounce/complaint health acceptable.
- [ ] Subject line passes deception heuristic.
- [ ] Link checker green.
- [ ] Workspace admin approval recorded.

## Failure behavior

- Domain DNS breaks mid-job → auto-pause, alert admin.
- Unsubscribe endpoint returns non-2xx → auto-pause, alert admin.
- Provider quota reached → batches park in queue with `send_after` bumped; they run when quota resets.
- Bounce/complaint spike → circuit breaker trips, human must clear.

No silent failures. Every pause has a reason and an audit log entry.
