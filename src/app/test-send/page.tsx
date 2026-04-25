"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";
import { Section } from "@/components/ui/Section";
import { Rocket, CheckCircle2, XCircle, KeyRound } from "lucide-react";

type SendResult = {
  to: string;
  ok: boolean;
  status: string;
  providerMessageId?: string;
  errorMessage?: string;
};

const PROVIDER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "brevo",        label: "Brevo — 300/day free" },
  { value: "resend",       label: "Resend — 100/day, 3k/month free" },
  { value: "mailjet",      label: "Mailjet — 200/day, 6k/month free" },
  { value: "postmark",     label: "Postmark — 100/month dev plan" },
  { value: "sendgrid",     label: "SendGrid — 60-day trial @ 100/day" },
  { value: "mailersend",   label: "MailerSend — 3,000/month free" },
  { value: "smtp2go",      label: "SMTP2GO — 1,000/month free" },
  { value: "elasticemail", label: "Elastic Email — 100/day free" },
  { value: "mailtrap",     label: "Mailtrap — Email Sending API" },
  { value: "zeptomail",    label: "Zoho ZeptoMail — 10k free trial" },
  { value: "smtp",         label: "SMTP fallback (Mailtrap sandbox / custom)" },
];

export default function TestSendPage() {
  const [provider, setProvider] = useState("brevo");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [useServerKeys, setUseServerKeys] = useState(false);
  const [available, setAvailable] = useState<Record<string, { available: boolean; from: string }>>({});
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("Got Mail Test");

  // On mount, ask the server which providers already have env-var keys configured.
  useEffect(() => {
    fetch("/api/test-send/available-providers")
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) {
          setAvailable(d.providers ?? {});
          if (d.fromEmailDefault && !fromEmail) setFromEmail(d.fromEmailDefault);
          if (d.fromNameDefault) setFromName(d.fromNameDefault);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentAvailable = available[provider]?.available ?? false;
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
          apiKey: useServerKeys ? "" : apiKey,
          apiSecret: useServerKeys ? "" : apiSecret,
          useServerKeys,
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
                onChange={(e) => {
                  setProvider(e.target.value);
                  // Reset useServerKeys if the new provider doesn't have one configured
                  if (!available[e.target.value]?.available) setUseServerKeys(false);
                }}
              >
                {PROVIDER_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                    {available[p.value]?.available ? " · ✓ key on server" : ""}
                  </option>
                ))}
              </select>
            </div>

            {currentAvailable && (
              <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-clue-500/40 bg-clue-500/10 p-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-0.5"
                  checked={useServerKeys}
                  onChange={(e) => setUseServerKeys(e.target.checked)}
                />
                <span>
                  <span className="font-semibold text-clue-400">
                    <KeyRound className="mr-1 inline h-3 w-3" />
                    Use server-side env keys
                  </span>
                  <span className="block text-xs text-white/60">
                    Skip pasting — use the {available[provider]?.from} env var already configured
                    on this deployment. Recommended for quick tests.
                  </span>
                </span>
              </label>
            )}

            {!useServerKeys && (
              <div>
                <label className="label">API key</label>
                <input
                  type="password"
                  className="input font-mono"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="xkeysib-... / re_... / etc."
                  required={!useServerKeys}
                />
                <div className="mt-1 text-xs text-white/50">
                  Sent once to the server for this request. Not stored.
                </div>
              </div>
            )}
            {!useServerKeys && provider === "mailjet" && (
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
            disabled={loading || (!useServerKeys && !apiKey) || !fromEmail}
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
