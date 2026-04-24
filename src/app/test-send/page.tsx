"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";
import { Section } from "@/components/ui/Section";
import { Rocket, CheckCircle2, XCircle } from "lucide-react";

type SendResult = {
  to: string;
  ok: boolean;
  status: string;
  providerMessageId?: string;
  errorMessage?: string;
};

export default function TestSendPage() {
  const [provider, setProvider] = useState("brevo");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("Got Mail Test");
  const [subject, setSubject] = useState("Hi from Got Mail — quick test");
  const [body, setBody] = useState(
    "Hi {{first_name}},\n\nThis is a quick test from Got Mail to verify my setup works end-to-end.\n\nThanks,\n— Me"
  );
  const [recipients, setRecipients] = useState(
    "Ada Lovelace <ada@example.com>\nGrace Hopper <grace@example.com>\nAlan Turing <alan@example.com>\nLinus Torvalds <linus@example.com>\nMargaret Hamilton <margaret@example.com>"
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SendResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("/api/test-send", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider,
          apiKey,
          apiSecret,
          fromEmail,
          fromName,
          subject,
          body,
          recipients: parseRecipients(recipients),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
      } else {
        setResults(data.results);
      }
    } catch (err: any) {
      setError(err?.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="★ test send · 5 recipients"
        title="Verify the app actually sends email."
        subtitle="Paste a provider API key (Brevo or Resend both have free tiers), enter 5 recipients you control, and hit Send. Got Mail fires them through the provider with full compliance headers."
      />

      <div className="mb-6">
        <Warning title="Ethical use only" tone="info">
          Use addresses you own or have explicit permission to email. The built-in compliance
          headers (List-Unsubscribe, plain-text alt, physical address) still apply.
        </Warning>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Left column */}
        <div className="panel p-5">
          <h3 className="mb-3 font-display text-xl text-clue-400">Provider</h3>
          <div className="space-y-3">
            <div>
              <label className="label">Provider</label>
              <select
                className="input"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="brevo">Brevo — 300/day free</option>
                <option value="resend">Resend — 100/day free</option>
                <option value="mailjet">Mailjet — 6,000/month free</option>
                <option value="postmark">Postmark — 100/month dev plan</option>
                <option value="sendgrid">SendGrid — 60-day trial</option>
              </select>
            </div>
            <div>
              <label className="label">API key</label>
              <input
                type="password"
                className="input font-mono"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="xkeysib-... / re_... / etc."
                required
              />
              <div className="mt-1 text-xs text-white/50">
                Sent once to the server for this request. Not stored. Get a free key at
                brevo.com or resend.com.
              </div>
            </div>
            {provider === "mailjet" && (
              <div>
                <label className="label">API secret (Mailjet only)</label>
                <input
                  type="password"
                  className="input font-mono"
                  value={apiSecret}
                  onChange={(e) => setApiSecret(e.target.value)}
                  placeholder="Mailjet API secret"
                />
              </div>
            )}
            <div>
              <label className="label">From email (must be verified at the provider)</label>
              <input
                type="email"
                className="input"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="you@yourdomain.com"
                required
              />
            </div>
            <div>
              <label className="label">From name</label>
              <input
                className="input"
                value={fromName}
                onChange={(e) => setFromName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="panel p-5">
          <h3 className="mb-3 font-display text-xl text-clue-400">Message</h3>
          <div className="space-y-3">
            <div>
              <label className="label">Subject</label>
              <input
                className="input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Body (plain text; HTML auto-generated)</label>
              <textarea
                className="input h-32 font-mono text-sm"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                required
              />
              <div className="mt-1 text-xs text-white/50">
                Use <code className="font-mono">{"{{first_name}}"}</code> to personalize.
              </div>
            </div>
            <div>
              <label className="label">Recipients (1 per line)</label>
              <textarea
                className="input h-32 font-mono text-xs"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="Name <email@example.com>"
                required
              />
              <div className="mt-1 text-xs text-white/50">
                Max 5. Format: <code className="font-mono">Name &lt;email&gt;</code> or just email.
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex items-center justify-between">
          <div className="text-xs text-white/60">
            Got Mail injects: <code className="font-mono">List-Unsubscribe</code> header,{" "}
            <code className="font-mono">List-Unsubscribe-Post: One-Click</code>, plain-text alt,
            sender postal address footer.
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !apiKey || !fromEmail}
          >
            <Rocket className="h-4 w-4" />
            {loading ? "Sending…" : "Send test batch"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6">
          <Warning title="Send failed" tone="bad">
            {error}
          </Warning>
        </div>
      )}

      {results && (
        <Section title="Results" className="mt-6">
          <div className="overflow-hidden rounded-chunky border border-white/10 bg-white/5">
            <table className="w-full text-sm">
              <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
                <tr>
                  <th className="px-4 py-3 text-left">Recipient</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Provider message id</th>
                  <th className="px-4 py-3 text-left">Error</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {results.map((r, i) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="px-4 py-3 font-mono">{r.to}</td>
                    <td className="px-4 py-3">
                      {r.ok ? (
                        <span className="tag-good inline-flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> sent
                        </span>
                      ) : (
                        <span className="tag-bad inline-flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> failed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-white/60">
                      {r.providerMessageId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-health-bad">
                      {r.errorMessage ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-xs text-white/60">
            Check the recipient inboxes to confirm delivery. If anything landed in spam, open the{" "}
            <a href="/domain-wizard" className="underline">Domain Wizard</a> and verify SPF/DKIM/DMARC
            on your From-email's domain.
          </div>
        </Section>
      )}
    </div>
  );
}

function parseRecipients(raw: string) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 5)
    .map((line) => {
      const match = line.match(/^(.*?)\s*<([^>]+)>$/);
      if (match) return { name: match[1].trim(), email: match[2].trim() };
      return { name: "", email: line };
    });
}
