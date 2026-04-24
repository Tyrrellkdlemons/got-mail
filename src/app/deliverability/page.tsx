import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Section } from "@/components/ui/Section";
import { prisma } from "@/lib/db";
import { formatPct } from "@/lib/utils";
import { Gauge, AlertTriangle, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DeliverabilityPage() {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } }).catch(() => null);
  const [latest, history] = workspace
    ? await Promise.all([
        prisma.deliverabilityHealth.findFirst({
          where: { workspaceId: workspace.id },
          orderBy: { measuredAt: "desc" },
        }).catch(() => null),
        prisma.deliverabilityHealth.findMany({
          where: { workspaceId: workspace.id },
          orderBy: { measuredAt: "desc" },
          take: 30,
        }).catch(() => []),
      ])
    : [null, []];

  return (
    <div>
      <PageHeader
        eyebrow="★ deliverability"
        title="Am I landing in the inbox?"
        subtitle="30-day rolling metrics per domain and provider. Seeded with a sample snapshot — real numbers populate once the sending engine runs."
      />

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Bounce rate" value={formatPct(latest?.bounceRate ?? null)} tone={(latest?.bounceRate ?? 0) < 2 ? "good" : "bad"} icon={<AlertTriangle />} sub="Target <2%" />
        <StatCard label="Complaint rate" value={formatPct(latest?.complaintRate ?? null)} tone={(latest?.complaintRate ?? 0) < 0.1 ? "good" : "bad"} sub="Target <0.1%" />
        <StatCard label="Inbox placement" value={formatPct(latest?.inboxPct ?? null)} tone="good" sub="Gmail / Yahoo / Outlook" icon={<Inbox />} />
        <StatCard label="Open rate" value={formatPct(latest?.openRate ?? null)} sub="Engagement proxy" icon={<Gauge />} />
        <StatCard label="Click rate" value={formatPct(latest?.clickRate ?? null)} />
        <StatCard label="Unsub rate" value={formatPct(latest?.unsubRate ?? null)} sub="Target <0.5%" />
      </div>

      <Section title="Measurement history">
        <div className="overflow-hidden rounded-chunky border border-white/10 bg-white/5">
          <table className="w-full text-sm">
            <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
              <tr>
                <th className="px-4 py-3 text-left">Measured</th>
                <th className="px-4 py-3 text-left">Domain</th>
                <th className="px-4 py-3 text-left">Provider</th>
                <th className="px-4 py-3 text-left">Bounce</th>
                <th className="px-4 py-3 text-left">Complaint</th>
                <th className="px-4 py-3 text-left">Inbox</th>
                <th className="px-4 py-3 text-left">Blacklisted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {history.length === 0 && (
                <tr><td className="px-4 py-6 text-white/60" colSpan={7}>No measurements yet.</td></tr>
              )}
              {history.map((h) => (
                <tr key={h.id}>
                  <td className="px-4 py-3 font-mono text-xs">{h.measuredAt.toISOString().slice(0, 10)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{h.domain ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">{h.providerKind ?? "—"}</td>
                  <td className="px-4 py-3">{formatPct(h.bounceRate ?? null)}</td>
                  <td className="px-4 py-3">{formatPct(h.complaintRate ?? null)}</td>
                  <td className="px-4 py-3">{formatPct(h.inboxPct ?? null)}</td>
                  <td className="px-4 py-3">{h.rblListed ? <span className="tag-bad">yes</span> : <span className="tag-good">no</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
