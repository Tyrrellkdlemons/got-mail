import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Section } from "@/components/ui/Section";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Warning } from "@/components/ui/Warning";
import { prisma } from "@/lib/db";
import {
  Users2,
  Mail,
  ShieldCheck,
  AlertTriangle,
  Rocket,
  Gauge,
} from "lucide-react";
import Link from "next/link";
import { formatPct } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function load() {
  try {
    const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } });
    if (!workspace) return null;

    const [
      verifiedContacts,
      totalContacts,
      sentToday,
      queued,
      campaigns,
      domains,
      verifiedDomains,
      health,
      bounces,
      complaints,
      unsubs,
      providersCatalog,
    ] = await Promise.all([
      prisma.contact.count({ where: { workspaceId: workspace.id, consentStatus: "VERIFIED" } }),
      prisma.contact.count({ where: { workspaceId: workspace.id } }),
      prisma.emailSend.count({
        where: {
          workspaceId: workspace.id,
          sentAt: { gte: new Date(Date.now() - 24 * 3600 * 1000) },
        },
      }),
      prisma.campaignRecipient.count({ where: { status: "QUEUED" } }),
      prisma.campaign.count({ where: { workspaceId: workspace.id } }),
      prisma.domain.count({ where: { workspaceId: workspace.id } }),
      prisma.domain.count({ where: { workspaceId: workspace.id, status: "VERIFIED" } }),
      prisma.deliverabilityHealth.findFirst({
        where: { workspaceId: workspace.id },
        orderBy: { measuredAt: "desc" },
      }),
      prisma.bounce.count({ where: { workspaceId: workspace.id } }),
      prisma.complaint.count({ where: { workspaceId: workspace.id } }),
      prisma.unsubscribe.count({ where: { workspaceId: workspace.id } }),
      prisma.sourceResearchItem.count({ where: { category: "provider" } }),
    ]);

    return {
      workspace,
      verifiedContacts,
      totalContacts,
      sentToday,
      queued,
      campaigns,
      domains,
      verifiedDomains,
      health,
      bounces,
      complaints,
      unsubs,
      providersCatalog,
    };
  } catch {
    return null;
  }
}

export default async function Dashboard() {
  const data = await load();

  const providerBars = [
    { name: "Brevo", max: 300, label: "300/day free" },
    { name: "Mailjet", max: 200, label: "200/day, 6k/month" },
    { name: "Resend", max: 100, label: "100/day, 3k/month" },
    { name: "Postmark", max: 100, label: "100/month dev plan" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="★ dashboard"
        title={data ? `Welcome back, ${data.workspace.name}.` : "Welcome back."}
        subtitle="You've got... a tidy sender reputation. Keep it that way."
        actions={
          <>
            <Link href="/mass-mode" className="btn-primary">
              <Rocket className="h-4 w-4" />
              New mass campaign
            </Link>
            <Link href="/providers" className="btn-secondary">
              Browse providers
            </Link>
          </>
        }
      />

      {!data && (
        <Warning title="Database not seeded yet" tone="info">
          Run the seed once — double-click <code className="font-mono">SEED_DATABASE.bat</code> (or
          {" "}<code className="font-mono">npm run db:push &amp;&amp; npm run db:seed</code>) to populate Neon with
          providers, OSS tools, and a sample workspace. Every page will fill in.
        </Warning>
      )}

      {data && (
        <>
          <Section title="Today at a glance">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
              <StatCard
                label="Verified contacts"
                value={data.verifiedContacts}
                sub={`${data.totalContacts} total — ${data.verifiedContacts}/${data.totalContacts} consented`}
                icon={<Users2 />}
              />
              <StatCard
                label="Sent today"
                value={data.sentToday}
                sub="Across all providers"
                icon={<Mail />}
              />
              <StatCard
                label="Queued"
                value={data.queued}
                sub="Ready to fire"
                icon={<Gauge />}
                tone={data.queued > 0 ? "warn" : "default"}
              />
              <StatCard
                label="Domain health"
                value={`${data.verifiedDomains}/${data.domains}`}
                sub={data.verifiedDomains === data.domains && data.domains > 0 ? "All verified" : "Run the wizard"}
                icon={<ShieldCheck />}
                tone={data.verifiedDomains === data.domains && data.domains > 0 ? "good" : "warn"}
              />
            </div>
          </Section>

          <Section title="Provider quota remaining">
            <div className="panel space-y-4 p-5">
              {providerBars.map((p) => (
                <div key={p.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold">{p.name}</span>
                    <span className="font-mono text-white/60">
                      0 / {p.max} — {p.label}
                    </span>
                  </div>
                  <ProgressBar value={0} max={p.max} />
                </div>
              ))}
              <div className="pt-2 text-xs text-white/50">
                Got Mail's catalog has {data.providersCatalog} providers tracked.
              </div>
            </div>
          </Section>

          <Section title="Health signals (30-day)">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
              <StatCard
                label="Bounce rate"
                value={formatPct(data.health?.bounceRate ?? null)}
                tone={(data.health?.bounceRate ?? 0) < 2 ? "good" : "bad"}
                icon={<AlertTriangle />}
                sub="Target <2%"
              />
              <StatCard
                label="Complaint rate"
                value={formatPct(data.health?.complaintRate ?? null)}
                tone={(data.health?.complaintRate ?? 0) < 0.1 ? "good" : "bad"}
                sub="Target <0.1%"
              />
              <StatCard
                label="Inbox placement"
                value={formatPct(data.health?.inboxPct ?? null)}
                tone="good"
                sub="Gmail / Yahoo / Outlook"
              />
              <StatCard
                label="Campaigns"
                value={data.campaigns}
                sub="In this workspace"
              />
              <StatCard label="Bounces (total)" value={data.bounces} />
              <StatCard label="Complaints (total)" value={data.complaints} />
              <StatCard label="Unsubscribes (total)" value={data.unsubs} />
            </div>
          </Section>
        </>
      )}

      <Warning title="Before your first real send" tone="info">
        Run the Domain Setup Wizard to verify SPF, DKIM and DMARC on your own
        sending domain.{" "}
        <Link href="/domain-wizard" className="underline">
          Open the wizard →
        </Link>
      </Warning>
    </div>
  );
}
