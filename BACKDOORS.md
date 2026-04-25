# Got Mail — admin backdoors

Three hidden ways to reach the admin login screen at `/admin/login`. All three
are *gateways* — they only open the door. To actually log in you still need to
enter the `ADMIN_TOKEN` (stored in your `.env` and Netlify env vars).

The admin dashboard itself lives at `/admin` and is gated by an HMAC-signed
HttpOnly cookie that expires in 24 hours.

---

## Backdoor 1 — Konami code (home page only)

**On the home page** (`https://got-mail.netlify.app/`), type the following
sequence on the keyboard:

```
↑ ↑ ↓ ↓ ← → ← → b a
```

A small toast labeled "↑↑↓↓←→←→ba — admin gateway" pops up in the bottom-right
and you're redirected to the login screen.

Caveat: keystrokes are ignored if you're focused inside an `<input>`,
`<textarea>`, or `contenteditable` element.

---

## Backdoor 2 — Type "gotmail" (home page only)

**On the home page**, just type the word `gotmail` (lowercase, no spaces) within
a 3-second window. Toast: `"gotmail" — admin gateway`. Redirect to login.

This is a softer fallback in case Konami feels like overkill.

Same input-focus caveat as Backdoor 1.

---

## Backdoor 3 — Click the logo 7 times (home page only)

**On the home page**, click the **GOT MAIL logo / envelope** in the top-left
header **7 times within 3 seconds**. Any element tagged with
`data-backdoor="logo"` triggers it; currently that's only the logo link.

Toast: `logo×7 — admin gateway`. Redirect to login.

This one's resistant to "fingerprinting" — it works even if a user has JavaScript
sniffers on, because clicks aren't unusual.

---

## Bonus — Direct URL with token prefill (works anywhere)

You can paste the URL directly:

```
https://got-mail.netlify.app/admin/login?backdoor=<ADMIN_TOKEN>
```

The `?backdoor=` query param **prefills** the password field but does NOT
auto-submit, so a leaked URL alone isn't enough — the URL has to be paired with
a confirmed click on "Enter".

---

## Where the secret lives

```
.env                 → ADMIN_TOKEN=<your-32-byte-token>
Netlify env vars     → ADMIN_TOKEN=<same value>
```

Generate a fresh one any time with:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Rotating `ADMIN_TOKEN` instantly invalidates every existing admin session
(because cookies are HMAC-signed against the token).

---

## What the admin panel can do

Visit `/admin` after auth and you get:

- **At-a-glance counts** — contacts, segments, campaigns, identities, domains,
  suppressions, source-catalog rows, recent sends.
- **Provider keys table** — every provider env var, configured (✓) or missing.
- **Recent email sends** — the 5 latest with provider, status, message id.
- **Dangerous actions** (with confirm prompts):
  - **Re-seed source catalog** — upserts a few well-known catalog rows
  - **Wipe EmailSend + EmailEvent** — clears the send/event log (irreversible)
  - **Self-test send** — fires a one-line email from the app to your `GMAIL_USER`
    via Gmail SMTP, returns the provider message id
  - **Show env diagnostic** — lists every relevant env var with a ✓/✗ for whether
    it's set (never returns the values)

---

## Security model in one paragraph

Token is a 32-byte URL-safe random string. Login compares user-supplied token
against `ADMIN_TOKEN` with constant-time `crypto.timingSafeEqual`. Wrong token
incurs a 1.5s sleep. Right token sets a `gm_admin` HttpOnly cookie whose body
is the expiry timestamp and whose signature is `HMAC-SHA256(timestamp,
ADMIN_TOKEN)`. Forging a cookie requires knowing the token. Cookie max age is
24h; expired cookies fail validation.

The admin dashboard at `/admin` checks the cookie on every server render and
redirects to `/admin/login` if it's missing or invalid. The action endpoint
at `/api/admin/action` re-checks the cookie before executing anything.

If you ever suspect leak: rotate `ADMIN_TOKEN`, redeploy, every session dies.
