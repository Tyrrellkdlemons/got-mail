"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";
import { Section } from "@/components/ui/Section";
import { CheckCircle2, XCircle, Globe2 } from "lucide-react";
import Link from "next/link";

const FREE_HOSTS = [
  { id: "eu.org", url: "https://nic.eu.org", description: "Free *.eu.org subdomains, nonprofit-friendly, manual review." },
  { id: "afraid.org", url: "https://freedns.afraid.org", description: "FreeDNS — free shared subdomains + DNS hosting." },
  { id: "duckdns.org", url: "https://www.duckdns.org", description: "Dynamic DNS subdomain for home/dev." },
  { id: "is-a.dev", url: "https://www.is-a.dev", description: "Free *.is-a.dev subdomains for developers (GitHub-backed)." },
  { id: "js.org", url: "https://js.org", description: "Free *.js.org subdomains for JS projects (GitHub-backed)." },
];

export default function FreeDomainIdentityPage() {
  const [host, setHost] = useState("eu.org");
  const [subdomain, setSubdomain] = useState("");
  const [name, setName] = useState("Free subdomain sender (EXPERIMENTAL)");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [providerKind, setProviderKind] = useState("brevo");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const fullDomain = subdomain ? `${subdomain}.${host}` : host;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/identities", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "FREE_DOMAIN",
          name,
          fromName,
          fromEmail,
          providerKind,
          domain: fullDomain,
          dailyLimit: 100,
          hourlyLimit: 20,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) setErr(data.error ?? `HTTP ${res.status}`);
      else setMsg("Free-subdomain identity created. Marked EXPERIMENTAL.");
    } catch (e: any) {
      setErr(e?.message ?? "Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="★ sending mode · free subdomain · experimental"
        title="Send from a free domain or subdomain."
        subtitle="For testing only — free subdomains share a weak parent reputation."
      />

      <div className="mb-6">
        <Warning title="Low-trust by default" tone="bad">
          Inbox providers score free-TLD and shared-subdomain addresses lower. Not recommended for
          1,000+ campaigns. Buy a real domain from Cloudflare Registrar / Porkbun for $10/year —
          best deliverability investment you'll ever make.
        </Warning>
      </div>

      <Section title="Pick a free subdomain provider">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {FREE_HOSTS.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setHost(h.id)}
              className={`panel text-left p-4 transition ${host === h.id ? "ring-2 ring-envelope-500" : ""}`}
            >
              <div className="font-semibold">{h.id}</div>
              <div className="mt-1 text-xs text-white/60">{h.description}</div>
              <Link
                href={h.url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block text-xs text-clue-400 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {h.url}
              </Link>
            </button>
          ))}
        </div>
      </Section>

      <form onSubmit={onSubmit} className="panel p-5">
        <Section title="Identity">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="label">Subdomain you registered</label>
              <div className="flex items-center gap-2">
                <input className="input font-mono" value={subdomain} onChange={(e) => setSubdomain(e.target.value)} placeholder="mysite" required />
                <span className="font-mono text-white/60">.{host}</span>
              </div>
              {fullDomain && <div className="mt-1 text-xs text-white/50">Full domain: <code>{fullDomain}</code></div>}
            </div>
            <div>
              <label className="label">Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">From email</label>
              <input type="email" className="input font-mono" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder={`news@${fullDomain}`} required />
            </div>
            <div>
              <label className="label">From name</label>
              <input className="input" value={fromName} onChange={(e) => setFromName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Provider to route through</label>
              <select className="input" value={providerKind} onChange={(e) => setProviderKind(e.target.value)}>
                <option value="brevo">Brevo</option>
                <option value="resend">Resend</option>
                <option value="mailjet">Mailjet</option>
                <option value="sendgrid">SendGrid</option>
              </select>
            </div>
          </div>
        </Section>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-white/50">Daily cap locked to 100 on FREE_DOMAIN mode.</div>
          <button type="submit" className="btn-primary" disabled={saving || !subdomain}>
            <Globe2 className="h-4 w-4" /> {saving ? "Saving..." : "Save (experimental)"}
          </button>
        </div>
        {err && <div className="mt-3 flex items-center gap-2 text-sm text-health-bad"><XCircle className="h-4 w-4" /> {err}</div>}
        {msg && <div className="mt-3 flex items-center gap-2 text-sm text-health-good"><CheckCircle2 className="h-4 w-4" /> {msg}</div>}
      </form>
    </div>
  );
}
