import { PageHeader } from "@/components/ui/PageHeader";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        eyebrow="★ settings"
        title="Workspace settings."
        subtitle="Legal business name, postal address, timezone, roles, audit log retention."
      />
      <div className="space-y-4">
        <div className="panel p-5">
          <h3 className="mb-3 font-display text-xl">Identity (required for CAN-SPAM)</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="label">Legal business name</label>
              <input className="input" placeholder="Acme Inc." />
            </div>
            <div>
              <label className="label">Postal address</label>
              <input className="input" placeholder="123 Market St, San Francisco, CA 94103" />
            </div>
            <div>
              <label className="label">Reply-to email</label>
              <input className="input" placeholder="support@yourcompany.com" />
            </div>
            <div>
              <label className="label">Timezone</label>
              <input className="input" defaultValue="America/Los_Angeles" />
            </div>
          </div>
        </div>

        <div className="panel p-5">
          <h3 className="mb-3 font-display text-xl">Feature flags</h3>
          <ul className="space-y-2 text-sm text-white/80">
            <li>FEATURE_WARMUP_AUTOPILOT — gradual volume ramp for new domains</li>
            <li>FEATURE_DELIVERABILITY_DOCTOR — inbox placement + RBL monitor</li>
            <li>FEATURE_CONSENT_LEDGER — tamper-evident consent log</li>
            <li>FEATURE_AI_CONTENT_STUDIO — subject-line scorer + spam predictor</li>
          </ul>
        </div>

        <div className="panel p-5">
          <h3 className="mb-3 font-display text-xl">Danger zone</h3>
          <p className="text-sm text-white/70">
            Suppression list is append-only. Deletion requires a workspace owner
            and writes an audit log entry.
          </p>
        </div>
      </div>
    </div>
  );
}
