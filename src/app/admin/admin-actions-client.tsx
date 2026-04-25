"use client";

import { useState } from "react";
import { Database, RefreshCcw, Trash2, FlaskConical, AlertTriangle } from "lucide-react";

type ActionResult = { ok: boolean; message?: string; error?: string };

export function AdminActions() {
  const [busy, setBusy] = useState<string | null>(null);
  const [result, setResult] = useState<ActionResult | null>(null);

  async function run(action: string, confirm: string) {
    if (!window.confirm(confirm)) return;
    setBusy(action);
    setResult(null);
    try {
      const res = await fetch("/api/admin/action", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      setResult({ ok: !!data.ok, message: data.message, error: data.error });
    } catch (err: any) {
      setResult({ ok: false, error: err?.message || "Network error" });
    } finally {
      setBusy(null);
    }
  }

  const actions = [
    {
      key: "reseed-sources",
      icon: <RefreshCcw className="h-4 w-4" />,
      label: "Re-seed source catalog",
      sub: "Refreshes the 93-item provider/OSS catalog (idempotent upsert).",
      confirm: "Re-seed source catalog? Safe — uses upsert, no data is deleted.",
      tone: "primary" as const,
    },
    {
      key: "wipe-test-sends",
      icon: <Trash2 className="h-4 w-4" />,
      label: "Wipe EmailSend + EmailEvent",
      sub: "Clears the send/event log for a clean slate. Doesn't touch contacts or campaigns.",
      confirm: "Wipe ALL EmailSend and EmailEvent rows? This cannot be undone.",
      tone: "danger" as const,
    },
    {
      key: "send-self-test",
      icon: <FlaskConical className="h-4 w-4" />,
      label: "Self-test (send to GMAIL_USER)",
      sub: "Send a one-line test from Got Mail to your own gmail via Gmail SMTP.",
      confirm: "Send a self-test email to your GMAIL_USER address?",
      tone: "primary" as const,
    },
    {
      key: "show-env",
      icon: <Database className="h-4 w-4" />,
      label: "Show env diagnostic (no secrets)",
      sub: "Returns which env vars are SET (true/false), never the values.",
      confirm: "Show env diagnostic? (booleans only, no values)",
      tone: "primary" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {actions.map((a) => (
        <button
          key={a.key}
          onClick={() => run(a.key, a.confirm)}
          disabled={busy !== null}
          className={
            "panel flex items-start gap-3 p-4 text-left transition-colors hover:bg-white/10 " +
            (a.tone === "danger" ? "border-health-bad/40" : "")
          }
        >
          <span className={a.tone === "danger" ? "text-health-bad" : "text-clue-400"}>{a.icon}</span>
          <span className="flex-1">
            <span className="block font-display text-base text-white">{a.label}</span>
            <span className="block text-xs text-white/60">{a.sub}</span>
            {busy === a.key && <span className="mt-1 block text-xs text-clue-400">running…</span>}
          </span>
        </button>
      ))}

      {result && (
        <div className={"md:col-span-2 rounded-lg border p-4 text-sm " + (result.ok ? "border-health-good/40 bg-health-good/10 text-health-good" : "border-health-bad/40 bg-health-bad/10 text-health-bad")}>
          {result.ok ? (
            <pre className="whitespace-pre-wrap font-mono text-xs">{result.message ?? "Done."}</pre>
          ) : (
            <span><AlertTriangle className="mr-1 inline h-4 w-4" />{result.error ?? "Action failed."}</span>
          )}
        </div>
      )}
    </div>
  );
}
