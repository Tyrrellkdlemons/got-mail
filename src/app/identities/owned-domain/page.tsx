"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";
import { Section } from "@/components/ui/Section";
import { CheckCircle2, XCircle, Network } from "lucide-react";
import Link from "next/link";

type Check = { type: string; pass: boolean; value: string | null; note?: string };

export default function OwnedDomainPage() {
  const [name, setName] = useState("Owned domain sender");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [domain, setDomain] = useState("");
  const [providerKind, setProviderKind] = useState("brevo");
  const [dailyLimit, setDailyLimit] = useState(1000);
  const [hourlyLimit, setHourlyLimit] = useState(200);
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [auditing, setAuditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function runAudit() {
    if (!domain) return;
    setAuditing(true);
    try {
      const res = await fetch(`/api/dns-check?domain=${encodeURIComponent(domain)}`);
      const data = await res.json();
      if (data.ok) setChecks(data.audit.checks);
    } finally {
      setAuditing(false);
    }
  }

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
          mode: "OWNED_DOMAIN",
          name,
          fromName,
          fromEmail,
          replyTo,
          providerKind,
          domain,
          dailyLimit,
          hourlyLimit,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) setErr(data.error ?? `HTTP ${res.status}`);
      else setMsg("Sending identity created. Now run the Domain Wizard to verify DNS before sending.");
    } catch (e: any) {
      setErr(e?.message ?? "Network error");
    } finally {
      setSaving(false);
    }
  }

  const dnsScore = checks ? Math.round((checks.filter((c) => c.pass).length / checks.length) * 100) : null;

  return (
    <div>
      <PageHeader
        eyebrow="★ sending mode · owned domain · recommended"
        title="Send from your own domain."
        subtitle="The highest-deliverability mode. Requires full SPF / DKIM / DMARC authentication."
      />

      <div className="mb-6">
        <Warning title="1,000+ sending unlocked only after DNS is green" tone="info">
          Got Mail will block large campaigns until SPF + DKIM + DMARC all pass. Use the audit button
          below to check right now, or open the <Link href="/domain-wizard" className="underline">Domain Wizard</Link>.
        </Warning>
      </div>

      <form onSubmit={onSubmit} className="panel p-5">
        <Section title="Identity">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Provider</label>
              <select className="input" value={providerKind} onChange={(e) => setProviderKind(e.target.value)}>
                <option value="brevo">Brevo</option>
                <option value="mailjet">Mailjet</option>
                <option value="resend">Resend</option>
                <option value="postmark">Postmark</option>
                <option value="sendgrid">SendGrid</option>
                <option value="ses">Amazon SES</option>
              </select>
            </div>
            <div>
              <label className="label">Domain</label>
              <div className="flex gap-2">
                <input className="input font-mono" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="yourcompany.com" required />
                <button type="button" className="btn-secondary whitespace-nowrap" onClick={runAudit} disabled={auditing || !domain}>
                  {auditing ? "Auditing..." : "Audit DNS"}
                </button>
              </div>
            </div>
            <div>
              <label className="label">From email (must be on this domain)</label>
              <input type="email" className="input" value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">From name</label>
              <input className="input" value={fromName} onChange={(e) => setFromName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Reply-to (optional)</label>
              <input type="email" className="input" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} />
            </div>
          </div>
        </Section>

        {checks && (
          <Section title={`DNS audit · score ${dnsScore}/100`}>
            <ul className="space-y-1 text-sm">
              {checks.map((c) => (
                <li key={c.type} className="flex items-center gap-2">
                  {c.pass ? <CheckCircle2 className="h-4 w-4 text-health-good" /> : <XCircle className="h-4 w-4 text-health-bad" />}
                  <span className="font-semibold w-16">{c.type}</span>
                  <span className="text-xs text-white/60">{c.note ?? "—"}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Limits">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="label">Daily cap</label>
              <input type="number" className="input" value={dailyLimit} onChange={(e) => setDailyLimit(parseInt(e.target.value))} />
            </div>
            <div>
              <label className="label">Hourly cap</label>
              <input type="number" className="input" value={hourlyLimit} onChange={(e) => setHourlyLimit(parseInt(e.target.value))} />
            </div>
          </div>
        </Section>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-white/50">Identity + Domain rows created in Neon.</div>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Network className="h-4 w-4" /> {saving ? "Saving..." : "Save sending identity"}
          </button>
        </div>
        {err && <div className="mt-3 flex items-center gap-2 text-sm text-health-bad"><XCircle className="h-4 w-4" /> {err}</div>}
        {msg && <div className="mt-3 flex items-center gap-2 text-sm text-health-good"><CheckCircle2 className="h-4 w-4" /> {msg}</div>}
      </form>
    </div>
  );
}
