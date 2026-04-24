"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";
import { Check, X, Search, ShieldAlert } from "lucide-react";

type Check = { type: string; name: string; value: string | null; pass: boolean; note?: string };
type AuditResult = { domain: string; checks: Check[] };
type Blacklist = { listed: string[]; checked: string[]; ip: string | null };

export default function DnsHealthPage() {
  const [domain, setDomain] = useState("gotmail.example");
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [blacklist, setBlacklist] = useState<Blacklist | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAudit(null);
    setBlacklist(null);
    try {
      const res = await fetch(
        `/api/dns-check?domain=${encodeURIComponent(domain)}&blacklist=1`
      );
      const data = await res.json();
      if (!data.ok) setError(data.error ?? "Unknown error");
      else {
        setAudit(data.audit);
        setBlacklist(data.blacklist);
      }
    } catch (e: any) {
      setError(e?.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="★ dns health · live lookups"
        title="Is my domain ready to send?"
        subtitle="Live SPF, DKIM, DMARC, MX, and blacklist checks via Google's free DNS-over-HTTPS."
      />

      <form onSubmit={run} className="panel mb-6 flex flex-col gap-3 p-5 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="label">Domain to check</label>
          <input
            className="input"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="yourcompany.com"
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={loading}>
          <Search className="h-4 w-4" />
          {loading ? "Looking up..." : "Run checks"}
        </button>
      </form>

      {error && (
        <Warning title="Lookup failed" tone="bad">
          {error}
        </Warning>
      )}

      {audit && (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-chunky border border-white/10 bg-white/5">
            <table className="w-full text-sm">
              <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
                <tr>
                  <th className="px-4 py-3 text-left">Record</th>
                  <th className="px-4 py-3 text-left">Host</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {audit.checks.map((c) => (
                  <tr key={c.type} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-semibold">{c.type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white/70">{c.name}</td>
                    <td className="px-4 py-3">
                      {c.pass ? (
                        <span className="tag-good inline-flex items-center gap-1">
                          <Check className="h-3 w-3" /> pass
                        </span>
                      ) : (
                        <span className="tag-bad inline-flex items-center gap-1">
                          <X className="h-3 w-3" /> fail
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-white/60">
                      <div className="max-w-[520px] truncate">{c.value ?? "—"}</div>
                      {c.note && <div className="mt-1 text-white/50">{c.note}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {blacklist && (
            <div className="panel p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-xl">
                  <ShieldAlert className="inline h-5 w-5 text-envelope-500" /> Blacklist check
                </h3>
                {blacklist.ip && (
                  <span className="font-mono text-xs text-white/60">
                    host → IP {blacklist.ip}
                  </span>
                )}
              </div>
              {!blacklist.ip && (
                <p className="text-sm text-white/60">
                  Domain has no A record — nothing to look up on RBLs.
                </p>
              )}
              {blacklist.ip && (
                <div className="flex flex-wrap gap-2">
                  {blacklist.checked.map((rbl) => {
                    const listed = blacklist.listed.includes(rbl);
                    return (
                      <span
                        key={rbl}
                        className={listed ? "tag-bad" : "tag-good"}
                        title={rbl}
                      >
                        {listed ? `⚠ ${rbl}` : `✓ ${rbl}`}
                      </span>
                    );
                  })}
                </div>
              )}
              <p className="mt-3 text-xs text-white/50">
                Checks against Spamhaus, SpamCop, Barracuda, SORBS, CBL, and PSBL via DNS.
              </p>
            </div>
          )}
        </div>
      )}

      {!audit && !error && (
        <div className="mt-6 text-sm text-white/60">
          Try your own domain. For a quick smoke-test, try <code className="font-mono">github.com</code> or{" "}
          <code className="font-mono">google.com</code>.
        </div>
      )}
    </div>
  );
}
