import { PageHeader } from "@/components/ui/PageHeader";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SegmentsPage() {
  const workspace = await prisma.workspace.findFirst({ where: { slug: "default" } }).catch(() => null);
  const segments = workspace
    ? await prisma.segment.findMany({
        where: { workspaceId: workspace.id },
        include: { _count: { select: { members: true } } },
        orderBy: { createdAt: "desc" },
      }).catch(() => [])
    : [];

  return (
    <div>
      <PageHeader
        eyebrow="★ segments"
        title="Slice your audience."
        subtitle="Filter by tag, activity, consent source, imported batch, engagement. Attach segments to campaigns."
      />
      <div className="overflow-hidden rounded-chunky border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead className="bg-aol-900/60 font-retro text-[10px] uppercase tracking-widest text-envelope-500">
            <tr>
              <th className="px-4 py-3 text-left">Segment</th>
              <th className="px-4 py-3 text-left">Description</th>
              <th className="px-4 py-3 text-left">Members</th>
              <th className="px-4 py-3 text-left">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {segments.length === 0 && (
              <tr><td className="px-4 py-6 text-white/60" colSpan={4}>No segments yet.</td></tr>
            )}
            {segments.map((s) => (
              <tr key={s.id} className="hover:bg-white/5">
                <td className="px-4 py-3 font-semibold">{s.name}</td>
                <td className="px-4 py-3 text-xs text-white/70">{s.description ?? "—"}</td>
                <td className="px-4 py-3 font-mono">{s._count.members}</td>
                <td className="px-4 py-3 font-mono text-xs text-white/60">{s.createdAt.toISOString().slice(0, 10)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
