import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Section } from "@/components/ui/Section";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Warning } from "@/components/ui/Warning";
import {
  Users2,
  Mail,
  ShieldCheck,
  AlertTriangle,
  Rocket,
  Gauge,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  // Scaffold: live data comes from Prisma in future iterations.
  return (
    <div>
      <PageHeader
        eyebrow="★ dashboard"
        title="Welcome back."
        subtitle="You've got... a tidy sender reputation. Keep it that way."
        actions={
          <>
            <Link href="/mass-mode" className="btn-primary">
              <Rocket className="h-4 w-4" />
              New mass campaign
            </Link>
            <Link href="/providers" className="btn-secondary">
              Find free providers
            </Link>
          </>
        }
      />

      <Section title="Today at a glance">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <StatCard label="Verified contacts" value="0" sub="Consent-verified" icon={<Users2 />} />
          <StatCard label="Sent today" value="0" sub="Across all providers" icon={<Mail />} />
          <StatCard label="Queued" value="0" sub="Ready to fire" icon={<Gauge />} tone="warn" />
          <StatCard label="Domain health" value="—" sub="Run the wizard" icon={<ShieldCheck />} />
        </div>
      </Section>

      <Section title="Provider quota remaining">
        <div className="panel space-y-4 p-5">
          {[
            { name: "Brevo", used: 0, max: 300, label: "300/day free" },
            { name: "Mailjet", used: 0, max: 200, label: "200/day, 6k/month" },
            { name: "Resend", used: 0, max: 100, label: "100/day, 3k/month" },
            { name: "Postmark", used: 0, max: 100, label: "100/month dev plan" },
          ].map((p) => (
            <div key={p.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-semibold">{p.name}</span>
                <span className="font-mono text-white/60">
                  {p.used} / {p.max} — {p.label}
                </span>
              </div>
              <ProgressBar value={p.used} max={p.max} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Health signals">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Bounce rate (30d)" value="—" tone="good" icon={<AlertTriangle />} sub="Target <2%" />
          <StatCard label="Complaint rate (30d)" value="—" tone="good" sub="Target <0.1%" />
          <StatCard label="Unsub rate (30d)" value="—" tone="good" sub="Target <0.5%" />
        </div>
      </Section>

      <Warning title="Run the Domain Setup Wizard first" tone="info">
        Before sending to 1,000+ contacts, verify SPF, DKIM and DMARC on your
        sending domain.{" "}
        <Link href="/domain-wizard" className="underline">
          Open the wizard →
        </Link>
      </Warning>
    </div>
  );
}
