"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";
import { Rocket, KeyRound } from "lucide-react";

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

type Segment = { id: string; name: string };
type Identity = { id: string; name: string; fromEmail: string };

export default function NewCampaignPage() {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [provider, setProvider] = useState("brevo");
  const [segmentId, setSegmentId] = useState<string>("");
  const [sendingIdentityId, setSendingIdentityId] = useState<string>("");
  const [available, setAvailable] = useState<Record<string, { available: boolean; from: string }>>({});
  const [segments, setSegments] = useState<Segment[]>([]);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetch("/api/test-send/available-providers").then((r) => r.json()).then((d) => {
      if (d?.ok) setAvailable(d.providers ?? {});
    }).catch(() => {});
    fetch("/api/campaigns/options").then((r) => r.json()).then((d) => {
      if (d?.ok) {
        setSegments(d.segments ?? []);
        setIdentities(d.identities ?? []);
        if (d.segments?.[0]) setSegmentId(d.segments[0].id);
        if (d.identities?.[0]) setSendingIdentityId(d.identities[0].id);
      }
    }).catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name, subject, previewText, bodyText,
          providerKind: provider,
          segmentId: segmentId || null,
          sendingIdentityId: sendingIdentityId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error ?? `HTTP ${res.status}`);
      } else {
        setCreated({ id: data.campaign.id, name: data.campaign.name });
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
        eyebrow="★ new campaign"
        title="Craft a new campaign."
        subtitle="Saved as DRAFT. You can review and approve it before any send is queued."
      />

      <div className="mb-6">
        <Warning title="Required compliance" tone="info">
          Got Mail will inject the postal address footer, a working unsubscribe link
          (List-Unsubscribe header + One-Click), and a plain-text alternative on every send.
          You don't have to write them.
        </Warning>
      </div>

      {created && (
        <div className="mb-6">
          <Warning title={`Campaign "${created.name}" saved as DRAFT`} tone="info">
            You can{" "}
            <a className="underline" href="/campaigns">view all campaigns</a>{" "}or{" "}
            <a className="underline" href="/test-send">send a 5-recipient test batch</a>{" "}first.
          </Warning>
        </div>
      )}

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="panel p-5">
          <h3 className="mb-3 font-display text-xl text-clue-400">Campaign details</h3>
          <div className="space-y-3">
            <div>
              <label className="label">Campaign name</label>
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Q2 launch announcement" required />
            </div>
            <div>
              <label className="label">Subject line</label>
              <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Hi {{first_name}}, news from us" required />
            </div>
            <div>
              <label className="label">Preview text (optional)</label>
              <input className="input" value={previewText} onChange={(e) => setPreviewText(e.target.value)} placeholder="Short preheader shown in inbox" />
            </div>
            <div>
              <label className="label">Sending identity</label>
              <select className="input" value={sendingIdentityId} onChange={(e) => setSendingIdentityId(e.target.value)}>
                <option value="">— pick an identity —</option>
                {identities.map((i) => (
                  <option key={i.id} value={i.id}>{i.name} · {i.fromEmail}</option>
                ))}
              </select>
              <div className="mt-1 text-xs text-white/50">
                Verified domain or owned-mailbox identity. {identities.length === 0 && "None set up yet — go to Sending Identity wizard first, or skip and pick later."}
              </div>
            </div>
            <div>
              <label className="label">Audience segment</label>
              <select className="input" value={segmentId} onChange={(e) => setSegmentId(e.target.value)}>
                <option value="">— pick a segment —</option>
                {segments.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Provider</label>
              <select className="input" value={provider} onChange={(e) => setProvider(e.target.value)}>
                {PROVIDER_OPTIONS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                    {available[p.value]?.available ? " · ✓ key on server" : ""}
                  </option>
                ))}
              </select>
              {available[provider]?.available && (
                <div className="mt-1 flex items-center gap-1 text-xs text-clue-400">
                  <KeyRound className="h-3 w-3" /> {available[provider].from} is configured — no manual paste needed at send time
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="mb-3 font-display text-xl text-clue-400">Body</h3>
          <div className="space-y-3">
            <div>
              <label className="label">Plain-text body (HTML auto-generated)</label>
              <textarea
                className="input h-64 font-mono text-sm"
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                placeholder={"Hi {{first_name}},\n\nWriting to share...\n\nThanks,\n— Your name"}
                required
              />
              <div className="mt-1 text-xs text-white/50">
                Use <code className="font-mono">{"{{first_name}}"}</code> /{" "}
                <code className="font-mono">{"{{email}}"}</code>. Footer + unsubscribe added automatically.
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex items-center justify-between">
          <div className="text-xs text-white/60">
            Saved as <code className="font-mono">DRAFT</code>. No send is triggered.
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !name || !subject || !bodyText}>
            <Rocket className="h-4 w-4" />
            {loading ? "Saving…" : "Save as draft"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6">
          <Warning title="Couldn't save campaign" tone="bad">{error}</Warning>
        </div>
      )}
    </div>
  );
}
