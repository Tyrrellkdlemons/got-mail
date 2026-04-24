import { PageHeader } from "@/components/ui/PageHeader";
import { Warning } from "@/components/ui/Warning";
import { StatCard } from "@/components/ui/StatCard";
import { Section } from "@/components/ui/Section";
import { Rocket, Users2, Gauge, AlertTriangle } from "lucide-react";

export default function MassModePage() {
  return (
    <div>
      <PageHeader
        eyebrow="★ 1,000+ mass campaign mode"
        title="Big send. Safely."
        subtitle="Pick a segment of 1,000+ consent-verified contacts. Got Mail batches, throttles, and pauses on any sign of trouble."
        actions={<button className="btn-primary"><Rocket className="h-4 w-4" /> Start mass campaign</button>}
      />

      <div className="mb-6">
        <Warning title="Pre-flight checklist" tone="info">
          Sending is blocked until every item on the{" "}
          <a className="underline" href="/compliance">Compliance Checklist</a>{" "}
          is green. Got Mail will not skip checks even if you're in a hurry.
        </Warning>
      </div>

      <Section title="What Got Mail does for you">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Batching" value="50" sub="recipients / batch" icon={<Users2 />} />
          <StatCard label="Throttle" value="30s" sub="between batches (tunable)" icon={<Gauge />} />
          <StatCard label="Circuit breaker" value="2%" sub="bounce rate pause" icon={<AlertTriangle />} tone="warn" />
          <StatCard label="Warmup" value="50→15k" sub="10-day ramp" icon={<Rocket />} />
        </div>
      </Section>

      <Section title="The flow">
        <ol className="space-y-3">
          {[
            "Select 1,000+ matching contacts (server-side selection token, not a browser array).",
            "Filter to VERIFIED / IMPORTED_WITH_PROOF consent. Drop unsub / bounce / complaint / suppression.",
            "Split into SendingBatch rows with send_after scheduled by provider quota + warmup.",
            "Worker processes one batch at a time. Updates rolling bounce/complaint stats after each.",
            "Auto-pause if bounce rate >2% or complaint rate >0.1%.",
            "Archive consent proofs for every recipient at send-time.",
          ].map((s, i) => (
            <li key={i} className="panel flex gap-3 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-envelope-500 font-display text-lg text-aol-900">
                {i + 1}
              </div>
              <p className="text-sm text-white/80">{s}</p>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}
