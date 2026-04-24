"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";
import { FlaskConical, Stethoscope, Check, X } from "lucide-react";

type Check = { type: string; name: string; value: string | null; pass: boolean; note?: string };
type AuditResult = { domain: string; checks: Check[] };
type Blacklist = { listed: string[]; checked: string[]; ip: string | null };

export default function DoctorPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [blacklist, setBlacklist] = useState<Blacklist | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setAudit(null);
    setBlacklist(null);
    try {
      const res = await fetch(`/api/dns-check?domain=${encodeURIComponent(domain)}&blacklist=1`);
      const data = await res.json();
      if (data.ok) {
        setAudit(data.audit);
        setBlacklist(data.blacklist);
      }
    } finally {
      setLoading(false);
    }
  }

  const passCount = audit?.checks.filter((c) => c.pass).length ?? 0;
  const totalCount = audit?.checks.length ?? 0;
  const score = totalCount ? Math.round((passCount / totalCount) * 100) : 0;
  const rblPenalty = (blacklist?.listed.length ?? 0) * 15;
  const finalScore = Math.max(0, score - rblPenalty);

  const rxs: string[] = [];
  if (audit) {
    for (const c of audit.checks) {
      if (!c.pass) {
        if (c.type === "SPF") rxs.push("Publish an SPF record at the root. Include your email provider (e.g. include:amazonses.com).");
        if (c.type === "DKIM") rxs.push("Get the DKIM CNAME/TXT from your email provider and publish it. Common selectors: resend, default, k1, selector1.");
        if (c.type === "DMARC") rxs.push("Publish a DMARC record at _dmarc. Start with v=DMARC1; p=none; rua=mailto:you@yourdomain.");
        if (c.type === "MX") rxs.push("Add MX records so you can receive replies and bounces.");
      }
    }
  }
  if ((blacklist?.listed.length ?? 0) > 0) {
    rxs.push(`Your IP is on ${blacklist?.listed.length} blacklist(s). File removal requests with each listed RBL after fixing the root cause.`);
  }
  if (rxs.length === 0 && audit) {
    rxs.push("No issues detected. Warm up gradually and monitor your bounce/complaint rates weekly.");
  }

  return (
    <div>
      <PageHeader
        eyebrow="★ deliverability doctor"
        title="Why aren't my emails landing?"
        subtitle="Live diagnostic across SPF, DKIM, DMARC, MX, and 6 public blacklists. Prescribes fixes in priority order."
      />

      <form onSubmit={run} className="panel mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">Sending domain to diagnose</label>
          <input
            className="input"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="yourcompany.com"
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading || !domain}>
          <Stethoscope className="h-4 w-4" />
          {loading ? "Examining..." : "Diagnose"}
        </button>
      </form>

      {audit && (
        <>
          <div className="panel mb-6 p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-retro text-[10px] uppercase tracking-widest text-envelope-500">
                  deliverability score
                </div>
                <div className="font-display text-6xl">
                  {finalScore}
                  <span className="text-lg text-white/50">/100</span>
                </div>
              </div>
              <FlaskConical className="h-24 w-24 text-envelope-500 opacity-30" />
            </div>
            <div className="mt-3 text-xs text-white/60">
              {passCount}/{totalCount} DNS checks pass
              {(blacklist?.listed.length ?? 0) > 0 && ` · ${blacklist?.listed.length} blacklist hit(s)`}
            </div>
          </div>

          <div className="panel mb-6 p-5">
            <h3 className="mb-3 font-display text-xl text-clue-400">DNS checks</h3>
            <ul className="space-y-2">
              {audit.checks.map((c) => (
                <li key={c.type} className="flex items-start gap-3 text-sm">
                  {c.pass ? (
                    <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-health-good" />
                  ) : (
                    <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-health-bad" />
                  )}
                  <div>
                    <span className="font-semibold">{c.type}</span>{" "}
                    <span className="font-mono text-xs text-white/60">{c.name}</span>
                    {c.note && <div className="text-xs text-white/60">{c.note}</div>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {blacklist?.listed && blacklist.listed.length > 0 && (
            <div className="mb-6">
              <Warning title={`${blacklist.listed.length} blacklist hit(s)`} tone="bad">
                On: {blacklist.listed.join(", ")}
              </Warning>
            </div>
          )}

          <div className="panel p-5">
            <h3 className="mb-3 font-display text-xl text-clue-400">Prescription</h3>
            <ol className="space-y-2 text-sm text-white/80">
              {rxs.map((r, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-envelope-500">{i + 1}.</span>
                  <span>{r}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}
    </div>
  );
}
