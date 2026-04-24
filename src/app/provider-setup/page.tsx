"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";
import { Section } from "@/components/ui/Section";
import { KeyRound, Plus, CheckCircle2, XCircle } from "lucide-react";

type Account = {
  id: string;
  providerKind: string;
  label: string;
  baseUrl: string | null;
  verifiedAt: string | null;
  createdAt: string;
};

export default function ProviderSetupPage() {
  const [providerKind, setProviderKind] = useState("brevo");
  const [label, setLabel] = useState("My Brevo account");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);

  async function loadAccounts() {
    try {
      const res = await fetch("/api/provider-accounts/list");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts ?? []);
      }
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/provider-accounts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          providerKind,
          label,
          apiKey: apiKey || undefined,
          apiSecret: apiSecret || undefined,
          baseUrl: baseUrl || undefined,
          validate: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
      } else {
        setMessage(`Connected ${providerKind}. Stored encrypted.`);
        setApiKey("");
        setApiSecret("");
        await loadAccounts();
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
        eyebrow="★ provider api keys"
        title="Connect an email provider."
        subtitle="Keys are AES-256-GCM encrypted at rest using CREDENTIALS_ENCRYPTION_KEY. Never exposed to the browser after save."
      />

      <div className="mb-6">
        <Warning title="Validated before save" tone="info">
          Got Mail pings each provider before storing the key. If validation fails, nothing is saved.
        </Warning>
      </div>

      <Section title="Add a provider">
        <form onSubmit={onSubmit} className="panel p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="label">Provider</label>
              <select className="input" value={providerKind} onChange={(e) => setProviderKind(e.target.value)}>
                <option value="brevo">Brevo</option>
                <option value="mailjet">Mailjet</option>
                <option value="resend">Resend</option>
                <option value="postmark">Postmark</option>
                <option value="sendgrid">SendGrid</option>
                <option value="postal">Postal (self-hosted)</option>
                <option value="listmonk">listmonk (self-hosted)</option>
                <option value="mautic">Mautic (self-hosted)</option>
              </select>
            </div>
            <div>
              <label className="label">Label</label>
              <input className="input" value={label} onChange={(e) => setLabel(e.target.value)} required />
            </div>
            <div>
              <label className="label">API key</label>
              <input type="password" className="input font-mono" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
            </div>
            {(providerKind === "mailjet" || providerKind === "listmonk" || providerKind === "mautic") && (
              <div>
                <label className="label">API secret / password</label>
                <input type="password" className="input font-mono" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} />
              </div>
            )}
            {(providerKind === "postal" || providerKind === "listmonk" || providerKind === "mautic") && (
              <div className="md:col-span-2">
                <label className="label">Base URL</label>
                <input className="input" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://your-server.example.com" />
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-white/50">
              Keys go into <code className="font-mono">ProviderAccount.apiKeyEnc</code>.
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              <Plus className="h-4 w-4" /> {loading ? "Validating..." : "Save & validate"}
            </button>
          </div>

          {error && (
            <div className="mt-3 flex items-center gap-2 text-sm text-health-bad">
              <XCircle className="h-4 w-4" /> {error}
            </div>
          )}
          {message && (
            <div className="mt-3 flex items-center gap-2 text-sm text-health-good">
              <CheckCircle2 className="h-4 w-4" /> {message}
            </div>
          )}
        </form>
      </Section>

      <Section title="Connected providers">
        <div className="overflow-hidden rounded-chunky border border-white/10 bg-white/5">
          <table className="w-full text-sm">
            <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
              <tr>
                <th className="px-4 py-3 text-left">Label</th>
                <th className="px-4 py-3 text-left">Provider</th>
                <th className="px-4 py-3 text-left">Verified</th>
                <th className="px-4 py-3 text-left">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {accounts.length === 0 && (
                <tr><td className="px-4 py-6 text-white/60" colSpan={4}>No providers connected yet. Add one above.</td></tr>
              )}
              {accounts.map((a) => (
                <tr key={a.id}>
                  <td className="px-4 py-3 font-semibold flex items-center gap-2"><KeyRound className="h-4 w-4 text-envelope-500" /> {a.label}</td>
                  <td className="px-4 py-3"><span className="tag-clue">{a.providerKind}</span></td>
                  <td className="px-4 py-3">
                    {a.verifiedAt ? <span className="tag-good">verified</span> : <span className="tag-warn">pending</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{a.createdAt.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
