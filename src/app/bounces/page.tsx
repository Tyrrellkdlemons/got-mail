import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { Section } from "@/components/ui/Section";
import { prisma } from "@/lib/db";
import { AlertTriangle, AlertOctagon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BouncesPage() {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } }).catch(() => null);

  const [bounces, complaints, bouncesTotal, complaintsTotal] = workspace
    ? await Promise.all([
        prisma.bounce.findMany({
          where: { workspaceId: workspace.id },
          orderBy: { createdAt: "desc" },
          take: 50,
        }).catch(() => []),
        prisma.complaint.findMany({
          where: { workspaceId: workspace.id },
          orderBy: { createdAt: "desc" },
          take: 50,
        }).catch(() => []),
        prisma.bounce.count({ where: { workspaceId: workspace.id } }).catch(() => 0),
        prisma.complaint.count({ where: { workspaceId: workspace.id } }).catch(() => 0),
      ])
    : [[], [], 0, 0];

  return (
    <div>
      <PageHeader
        eyebrow="★ bounces & complaints"
        title="The naughty list."
        subtitle="Every bounce and complaint. Hard bounces are auto-suppressed. Complaints auto-suppressed."
      />
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <StatCard label="Total bounces" value={bouncesTotal} icon={<AlertTriangle />} tone={bouncesTotal > 0 ? "warn" : "default"} />
        <StatCard label="Total complaints" value={complaintsTotal} icon={<AlertOctagon />} tone={complaintsTotal > 0 ? "bad" : "default"} />
      </div>

      <Section title="Recent bounces">
        <div className="overflow-hidden rounded-chunky border border-white/10 bg-white/5">
          <table className="w-full text-sm">
            <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Kind</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Message</th>
                <th className="px-4 py-3 text-left">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {bounces.length === 0 && (
                <tr><td className="px-4 py-6 text-white/60" colSpan={5}>No bounces yet. Hard bounces land here automatically when a provider webhook fires.</td></tr>
              )}
              {bounces.map((b) => (
                <tr key={b.id}>
                  <td className="px-4 py-3 font-mono">{b.email}</td>
                  <td className="px-4 py-3"><span className={b.kind === "HARD" ? "tag-bad" : "tag-warn"}>{b.kind.toLowerCase()}</span></td>
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{b.code ?? "—"}</td>
                  <td className="px-4 py-3 text-xs text-white/70">{b.message ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{b.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Recent complaints">
        <div className="overflow-hidden rounded-chunky border border-white/10 bg-white/5">
          <table className="w-full text-sm">
            <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Source</th>
                <th className="px-4 py-3 text-left">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {complaints.length === 0 && (
                <tr><td className="px-4 py-6 text-white/60" colSpan={3}>No spam complaints. That&apos;s how we like it.</td></tr>
              )}
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-mono">{c.email}</td>
                  <td className="px-4 py-3 text-xs text-white/60">{c.source ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs text-white/60">{c.createdAt.toISOString().slice(0, 16).replace("T", " ")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
