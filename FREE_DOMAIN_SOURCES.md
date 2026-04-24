# Free Domain & Subdomain Sources

Research-only catalog. These are marked **EXPERIMENTAL / LOW-TRUST** in Got Mail. Do NOT use them as your primary sending domain for real mass campaigns — inbox providers distrust shared subdomains and freshly-minted free TLDs.

## Free subdomains

| Source | What you get | Notes |
|---|---|---|
| **EU.org** | Free subdomain registration under `.eu.org` | Goal: free addresses for users/nonprofits who can't afford normal NIC fees. Manual review process. |
| **FreeDNS / afraid.org** | Free shared subdomains + free DNS hosting | Their FAQ advises using your own domain for guaranteed long-term control. |
| **DuckDNS** | Dynamic DNS subdomain under `duckdns.org` | For home/dev. Not recommended for mass email. |
| **No-IP** (free tier) | Dynamic DNS, subdomain | Primarily for remote access. |
| **Dynu** | Free subdomains + DNS | Dev/testing only. |

## Free-tier registrars (domain is "free" for limited time or with strings)

| Source | What you get |
|---|---|
| **Freenom** | `.tk`, `.ml`, `.ga`, `.cf`, `.gq` — **heavily abused, poor deliverability, often blocked entirely**. Not recommended. |
| **namecheap free-for-students** | 1 year free with student verification |
| **porkbun** / **Cloudflare Registrars** | Not free but near-cost, no markup, strongly recommended for real use |

## Why Got Mail marks these low-trust

1. Inbox providers (Gmail, Outlook) score free-TLD domains lower by default because spammers abuse them.
2. Shared subdomains inherit the reputation of the parent — if anyone else on `foo.eu.org` spams, your subdomain suffers.
3. Free domains can be reclaimed or revoked without notice.
4. Many free TLDs are on RBLs (blocklists) preemptively.

## When free subdomains ARE acceptable

- Personal hobby projects with consenting friends/family recipients.
- Testing Got Mail's pipeline before you buy a real domain.
- Completely internal transactional mail (and even then, use a real domain).

## Strong recommendation

Buy a real domain. Cloudflare Registrar, Porkbun, and Namecheap sell `.com` / `.email` / `.io` domains for a few dollars/year with no markup. That's the single biggest deliverability upgrade you can make.

## Warning copy shown in app

> **Free domains/subdomains may work for testing, but they are not ideal for trusted mass email. A real owned domain is strongly recommended for serious sending.**
