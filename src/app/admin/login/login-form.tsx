"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";
import { KeyRound } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Backdoor #3: ?backdoor=<token> URL — auto-fills the token if matched.
  // Doesn't auto-submit (user still needs to confirm) so a leaked URL alone
  // isn't enough; user has to click "Enter".
  useEffect(() => {
    const k = searchParams.get("backdoor");
    if (k) setToken(k);
  }, [searchParams]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || `HTTP ${res.status}`);
        return;
      }
      router.push("/admin");
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="★ admin · gated"
        title="Admin panel"
        subtitle="Single-secret access. Token lives in ADMIN_TOKEN env var. See BACKDOORS.md for entry points."
      />
      <div className="mb-6">
        <Warning title="Owner only" tone="warn">
          This is a hidden control panel for site owners. Closing this tab and clearing cookies
          revokes access; the token cookie expires in 24 hours regardless.
        </Warning>
      </div>
      <form onSubmit={onSubmit} className="panel max-w-xl p-6">
        <h3 className="mb-3 font-display text-xl text-clue-400">
          <KeyRound className="mr-1 inline h-4 w-4" />
          Enter admin token
        </h3>
        <input
          type="password"
          className="input font-mono"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="ADMIN_TOKEN…"
          autoFocus
          required
        />
        <div className="mt-4 flex items-center justify-between">
          <div className="text-xs text-white/50">
            Wrong token = 1.5s lockout per attempt.
          </div>
          <button type="submit" className="btn-primary" disabled={loading || !token}>
            {loading ? "Verifying…" : "Enter"}
          </button>
        </div>
        {error && (
          <div className="mt-4">
            <Warning title="Login failed" tone="bad">{error}</Warning>
          </div>
        )}
      </form>
    </div>
  );
}
