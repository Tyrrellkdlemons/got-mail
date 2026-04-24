"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";
import { Section } from "@/components/ui/Section";
import { CheckCircle2, XCircle, Mailbox } from "lucide-react";

const PRESETS: Record<string, { host: string; port: number; useTls: boolean; dailyLimit: number; note: string }> = {
  gmail: { host: "smtp.gmail.com", port: 587, useTls: true, dailyLimit: 500, note: "Free Gmail ~500/day. Requires App Password." },
  "google-workspace": { host: "smtp.gmail.com", port: 587, useTls: true, dailyLimit: 2000, note: "Workspace: 2,000/day per user (1,500 for mail merge, 500 for trials)." },
  outlook: { host: "smtp.office365.com", port: 587, useTls: true, dailyLimit: 10000, note: "Microsoft 365 limits; check tenant." },
  zoho: { host: "smtp.zoho.com", port: 587, useTls: true, dailyLimit: 1000, note: "Zoho Mail ~1,000/day free tier." },
  custom: { host: "", port: 587, useTls: true, dailyLimit: 1000, note: "Custom SMTP — confirm limits with your provider." },
};

export default function MyEmailSmtp() {
  const [providerType, setProviderType] = useState("gmail");
  const [name, setName] = useState("My Gmail sender");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [host, setHost] = useState(PRESETS.gmail.host);
  const [port, setPort] = useState(PRESETS.gmail.port);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [useTls, setUseTls] = useState(true);
  const [dailyLimit, setDailyLimit] = useState(PRESETS.gmail.dailyLimit);
  const [hourlyLimit, setHourlyLimit] = useState(50);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function onProviderChange(kind: string) {
    setProviderType(kind);
    const preset = PRESETS[kind];
    if (preset) {
      setHost(preset.host);
      setPort(preset.port);
      setUseTls(preset.useTls);
      setDailyLimit(preset.dailyLimit);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await fetch("/api/identities", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "MY_EMAIL",
          name,
          fromName,
          fromEmail,
          replyTo,
          providerKind: "smtp",
          dailyLimit,
          hourlyLimit,
          smtp: { host, port, username, password, useTls, providerType },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) setErr(data.error ?? `HTTP ${res.status}`);
      else {
        setMsg("Sending identity created. SMTP password encrypted at rest.");
        setPassword("");
      }
    } catch (e: any) {
      setErr(e?.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="★ sending mode · my email"
        title="Send from your personal or business mailbox."
        subtitle="Connect Gmail, Google Workspace, Outlook, Zoho, or a custom SMTP account."
      />

      <div className="mb-6">
        <Warning title="Personal accounts have tight daily caps" tone="warn">
          Got Mail enforces each provider's limits. Free Gmail ~500/day, Workspace 2,000/day.
          For 1,000+ campaigns, use an owned domain with a dedicated provider.
        </Warning>
      </div>

      <form onSubmit={onSubmit} className="panel p-5">
        <Section title="Identity">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="label">Name this identity</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="label">Provider type</label>
              <select className="input" value={providerType} onChange={(e) => onProviderChange(e.target.value)}>
                <option value="gmail">Gmail (free)</option>
                <option value="google-workspace">Google Workspace</option>
                <option value="outlook">Outlook / Microsoft 365</option>
                <option value="zoho">Zoho Mail</option>
                <option value="custom">Custom SMTP</option>
              </select>
              <div className="mt-1 text-xs text-white/50">{PRESETS[providerType]?.note}</div>
            </div>
            <div>
              <label className="label">From email</label>
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

        <Section title="SMTP settings">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="label">Host</label>
              <input className="input font-mono" value={host} onChange={(e) => setHost(e.target.value)} required />
            </div>
            <div>
              <label className="label">Port</label>
              <input type="number" className="input font-mono" value={port} onChange={(e) => setPort(parseInt(e.target.value))} required />
            </div>
            <div>
              <label className="label">Username</label>
              <input className="input font-mono" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password / app password</label>
              <input type="password" className="input font-mono" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <label className="label flex items-center gap-2">
              <input type="checkbox" checked={useTls} onChange={(e) => setUseTls(e.target.checked)} />
              Use TLS (STARTTLS)
            </label>
          </div>
        </Section>

        <Section title="Limits (enforced by the queue)">
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
          <div className="text-xs text-white/50">Password encrypted with AES-256-GCM before save.</div>
          <button type="submit" className="btn-primary" disabled={loading}>
            <Mailbox className="h-4 w-4" /> {loading ? "Saving..." : "Save sending identity"}
          </button>
        </div>
        {err && <div className="mt-3 flex items-center gap-2 text-sm text-health-bad"><XCircle className="h-4 w-4" /> {err}</div>}
        {msg && <div className="mt-3 flex items-center gap-2 text-sm text-health-good"><CheckCircle2 className="h-4 w-4" /> {msg}</div>}
      </form>
    </div>
  );
}
