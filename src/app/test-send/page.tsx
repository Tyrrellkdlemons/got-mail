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

type ProviderOption = { value: string; label: string; group?: string };
const PROVIDER_OPTIONS: ProviderOption[] = [
  // Recommended for real-inbox tests right now
  { value: "gmail",        label: "Gmail SMTP — direct to any inbox via your gmail (500/day)", group: "Recommended" },
  // Hosted providers
  { value: "resend",       label: "Resend — 100/day, 3k/month free", group: "Hosted" },
  { value: "mailjet",      label: "Mailjet — 200/day, 6k/month free", group: "Hosted" },
  { value: "postmark",     label: "Postmark — 100/month dev plan", group: "Hosted" },
  { value: "sendgrid",     label: "SendGrid — 60-day trial @ 100/day", group: "Hosted" },
  { value: "mailersend",   label: "MailerSend — 3,000/month free", group: "Hosted" },
  { value: "smtp2go",      label: "SMTP2GO — 1,000/month free", group: "Hosted" },
  { value: "elasticemail", label: "Elastic Email — 100/day free", group: "Hosted" },
  { value: "mailtrap",     label: "Mailtrap — Email Sending API", group: "Hosted" },
  { value: "zeptomail",    label: "Zoho ZeptoMail — 10k free trial", group: "Hosted" },
  { value: "brevo",        label: "Brevo — 300/day free", group: "Hosted" },
  // Sandbox / dev
  { value: "smtp",         label: "SMTP fallback (Mailtrap sandbox / custom)", group: "Sandbox" },
  // Self-hosted open source — fully unbound, no per-provider limits
  { value: "postal",       label: "Postal — self-hosted (MIT)", group: "Self-hosted OSS" },
  { value: "listmonk",     label: "listmonk — self-hosted (AGPL-3.0)", group: "Self-hosted OSS" },
  { value: "mautic",       label: "Mautic — self-hosted (GPL)", group: "Self-hosted OSS" },
];

export default function TestSendPage() {
  const [provider, setProvider] = useState("gmail");
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [useServerKeys, setUseServerKeys] = useState(false);
  const [available, setAvailable] = useState<Record<string, { available: boolean; from: string; status?: string; note?: string }>>({});
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
    "emilywilliamsis@yahoo.com\nemilydwxoxo@gmail.com"
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
                {["Recommended", "Hosted", "Sandbox", "Self-hosted OSS"].map((groupName) => {
                  const groupOpts = PROVIDER_OPTIONS.filter((p) => p.group === groupName);
                  if (groupOpts.length === 0) return null;
                  return (
                    <optgroup key={groupName} label={groupName}>
                      {groupOpts.map((p) => {
                        const a = available[p.value];
                        const suffix = a?.status === "suspended"
                          ? " · ⛔ DOWN"
                          : a?.status === "sandbox"
                          ? " · ⚠ sandbox only"
                          : a?.status === "self-hosted-needed" && !a.available
                          ? " · needs URL+key"
                          : a?.available
                          ? " · ✓ key on server"
                          : "";
                        return (
                          <option key={p.value} value={p.value}>
                            {p.label}
                            {suffix}
                          </option>
                        );
                      })}
                    </optgroup>
                  );
                })}
              </select>
            </div>

            {/* Provider status banner — surface suspended/sandbox state inline */}
            {available[provider]?.status === "suspended" && (
              <div className="rounded-lg border border-health-bad/40 bg-health-bad/10 p-3 text-sm">
                <div className="font-semibold text-health-bad">⛔ Provider currently DOWN</div>
                <div className="mt-1 text-xs text-white/70">{available[provider]?.note}</div>
              </div>
            )}
            {available[provider]?.status === "sandbox" && (
              <div className="rounded-lg border border-health-warn/40 bg-health-warn/10 p-3 text-sm">
                <div className="font-semibold text-health-warn">⚠ Sandbox provider</div>
                <div className="mt-1 text-xs text-white/70">{available[provider]?.note}</div>
              </div>
            )}
            {available[provider]?.status === "self-hosted-needed" && !available[provider]?.available && (
              <div className="rounded-lg border border-clue-500/40 bg-clue-500/10 p-3 text-sm">
                <div className="font-semibold text-clue-400">🛠 Self-hosted — needs configuration</div>
                <div className="mt-1 text-xs text-white/70">{available[provider]?.note}</div>
                <div className="mt-1 text-xs text-white/50">
                  Set the env var(s) shown above in your `.env` and Netlify project, then redeploy.
                </div>
              </div>
            )}
            {provider === "gmail" && !available.gmail?.available && (
              <div className="rounded-lg border border-clue-500/40 bg-clue-500/10 p-3 text-sm">
                <div className="font-semibold text-clue-400">🔑 Gmail SMTP setup (one-time, ~2 min)</div>
                <ol className="mt-2 space-y-1 text-xs text-white/70 list-decimal list-inside">
                  <li>Open <a className="underline" href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer">myaccount.google.com/apppasswords</a> (requires 2FA on your Google account).</li>
                  <li>Click "Create" → name it "Got Mail" → Google shows a 16-char password.</li>
                  <li>Set Netlify env vars: <code className="font-mono">GMAIL_USER</code> = your gmail, <code className="font-mono">GMAIL_APP_PASSWORD</code> = the 16-char password.</li>
                  <li>Trigger a redeploy. Gmail SMTP will then deliver to ANY inbox at 500/day.</li>
                </ol>
              </div>
            )}

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
            disabled={
              loading ||
              (!useServerKeys && !apiKey) ||
              !fromEmail ||
              available[provider]?.status === "suspended"
            }
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
          {/* Summary stats */}
          <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="panel p-4">
              <div className="font-retro text-[10px] uppercase tracking-widest text-white/60">Sent</div>
              <div className="mt-1 font-display text-2xl text-health-good">
                {results.filter((r) => r.ok).length}
                <span className="text-base text-white/40"> / {results.length}</span>
              </div>
            </div>
            <div className="panel p-4">
              <div className="font-retro text-[10px] uppercase tracking-widest text-white/60">Failed</div>
              <div className="mt-1 font-display text-2xl text-health-bad">
                {results.filter((r) => !r.ok).length}
              </div>
            </div>
            <div className="panel p-4">
              <div className="font-retro text-[10px] uppercase tracking-widest text-white/60">Provider</div>
              <div className="mt-1 font-display text-base text-clue-400">
                {provider}
              </div>
            </div>
            <div className="panel p-4">
              <div className="font-retro text-[10px] uppercase tracking-widest text-white/60">Mode</div>
              <div className="mt-1 font-display text-base text-envelope-500">
                {provider === "smtp" && fromEmail.includes("sandbox.mailtrap")
                  ? "sandbox"
                  : useServerKeys
                  ? "live · server key"
                  : "live · user key"}
              </div>
            </div>
          </div>

          {/* Sandbox warning — emails won't reach real inboxes */}
          {provider === "smtp" && fromEmail.includes("sandbox.mailtrap") && (
            <div className="mb-4">
              <Warning title="Sandbox mode — emails do NOT reach real inboxes" tone="warn">
                Mailtrap sandbox captures messages in your{" "}
                <a className="underline" href="https://mailtrap.io/sandboxes/4575017/messages" target="_blank" rel="noreferrer">
                  Mailtrap sandbox inbox
                </a>{" "}
                instead of delivering them. To send to a real Yahoo / Gmail / etc address you need
                a live provider (Brevo, Resend, Mailtrap Email Sending live tier, etc) — switch the
                provider above.
              </Warning>
            </div>
          )}

          {/* Detailed results table */}
          <div className="overflow-hidden rounded-chunky border border-white/10 bg-white/5">
            <table className="w-full text-sm">
              <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
                <tr>
                  <th className="px-4 py-3 text-left">Recipient</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Provider message id</th>
                  <th className="px-4 py-3 text-left">Detail</th>
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
                    <td className="px-4 py-3 font-mono text-xs text-white/60 break-all">
                      {r.providerMessageId ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {r.errorMessage ? (
                        <span className="text-health-bad">{r.errorMessage}</span>
                      ) : r.ok ? (
                        <span className="text-white/50">accepted by provider</span>
                      ) : (
                        <span className="text-white/40">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer help */}
          <div className="mt-3 text-xs text-white/60 space-y-1">
            <div>
              <strong className="text-white/80">Where to look:</strong>{" "}
              {provider === "smtp" && fromEmail.includes("sandbox.mailtrap") ? (
                <>Open your <a className="underline" href="https://mailtrap.io/sandboxes/4575017/messages" target="_blank" rel="noreferrer">Mailtrap sandbox inbox</a> — every send lands there, not in the recipient's real mailbox.</>
              ) : (
                <>The recipient's real inbox. If it's not there in 1–2 minutes, check the spam folder and verify SPF/DKIM/DMARC in <a href="/domain-wizard" className="underline">Domain Wizard</a>.</>
              )}
            </div>
            <div>
              <strong className="text-white/80">"Too many emails per second" errors:</strong>{" "}
              this is the provider's rate limit, not your code. Mailtrap sandbox free tier is the strictest;
              Brevo / Resend / Postmark allow much higher throughput.
            </div>
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
